import {
  ContentChildren,
  Directive,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  QueryList,
  Self,
  SkipSelf
} from '@angular/core'
import { ControlContainer, FormGroupDirective, NgForm } from '@angular/forms'
import { combineLatest, Observable, Subject } from 'rxjs'
import { FmxControlSubmitDirective } from './control-submit.directive'
import { map, share, switchMap, takeUntil } from 'rxjs/operators'

@Directive({ selector: '[formGroup], [formGroupName]', exportAs: 'fmxFormSubmit' })
export class FmxFormSubmitDirective implements OnInit, OnDestroy {
  /**
   * Emits everytime the form is submitted.
   * Compared to ${@link FormGroupDirective.ngSubmit} and ${@link NgForm.ngSubmit} this doesn't emit until all
   * async validators have finished
   */
  @Output() readonly fmxSubmit: EventEmitter<boolean> = new EventEmitter<boolean>()

  constructor(
    @Inject(FmxFormSubmitDirective) @SkipSelf() @Optional() private readonly parent: FmxFormSubmitDirective,
    @Inject(ControlContainer) @Self() @Optional() private readonly controlContainer: FormGroupDirective | NgForm
  ) {}

  /**
   * Collects all descendants of type {@link FmxControlSubmitDirective} and add them to the root form
   * @param controlDirectives
   * @private
   */
  @ContentChildren(FmxControlSubmitDirective, { descendants: true })
  private set childrenDirectives(controlDirectives: QueryList<FmxControlSubmitDirective>) {
    this.controlDirectives.clear()
    controlDirectives.forEach(directive => this.controlDirectives.add(directive))
    this.addControlDirectivesToRoot(Array.from(this.controlDirectives))
  }

  ngOnInit(): void {
    if (this.parent) {
      this.submitValid$ = this.parent.submitValid$
    } else {
      this.submitValid$ = this.controlContainer.ngSubmit
        .pipe(
          takeUntil(this.destroyed$),
          map(() => Array.from(this.controlDirectives).map(directive => directive.submitValid$)),
          switchMap(submits$ => combineLatest([...submits$])),
          map((valids: Array<boolean>) => !valids.includes(false)),
          share()
        )
      this.submitValid$.subscribe(value => this.fmxSubmit.emit(value))
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next()
  }

  /**
   * Trigger a form submit manually
   */
  submit(): void {
    this.controlContainer.onSubmit(new Event('Manually triggered submit'))
  }

  private addControlDirectivesToRoot(directives: Array<FmxControlSubmitDirective>): void {
    if (this.parent) {
      this.parent.addControlDirectivesToRoot(directives)
    } else {
      directives.forEach(directive => this.controlDirectives.add(directive))
    }
  }

  private submitValid$!: Observable<boolean>
  private readonly controlDirectives: Set<FmxControlSubmitDirective> = new Set<FmxControlSubmitDirective>()
  private readonly destroyed$: Subject<void> = new Subject<void>()
}
