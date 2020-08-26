import { Directive, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core'
import { FmxErrorsService } from './errors.service'
import { AbstractControl, ValidationErrors } from '@angular/forms'
import { ErrorMessageResolver } from './error-message-resolver'
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, switchMap, takeUntil } from 'rxjs/operators'
import { FmxFormUtils } from '../core'
import { ErrorsVisibility } from './errors-visibility'

@Directive({
  selector: '[fmxErrors]',
  exportAs: 'fmxErrors'
})
export class FmxErrorsDirective implements OnInit, OnDestroy {
  @Output('fmxErrorsMessage') readonly messageChange: EventEmitter<string | null> = new EventEmitter<string | null>()
  message$!: Observable<string | null>

  constructor(@Inject(FmxErrorsService) private readonly errorService: FmxErrorsService) { }

  @Input('fmxErrors') set errors(value: ValidationErrors | null) { this.errorsSubject.next(value) }

  @Input('fmxErrorsControl') set control(value: AbstractControl | null) { this.controlSubject.next(value) }

  @Input('fmxErrorsControlLabel') set controlLabel(value: string) { this.controlLabelSubject.next(value) }

  @Input('fmxErrorsVisibility') set visibility(value: ErrorsVisibility) {  }

  @Input('fmxErrorsResolvers') set resolvers(value: Array<ErrorMessageResolver>) { this.resolversSubject.next(value) }

  ngOnInit(): void {
    this.message$ = combineLatest([this.controlSubject.asObservable(), this.errorsSubject.asObservable()])
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.destroyed$),
        map(([control, errors]) => control ? FmxFormUtils.getControlErrors$(control) : of(errors)),
        switchMap(errors$ => combineLatest([errors$, this.controlLabelSubject.asObservable(), this.resolversSubject.asObservable()])),
        switchMap(([errors, controlLabel, resolvers]) => this.errorService.getErrorMessage(errors, { controlLabel, resolvers })),
        shareReplay(1)
      )
    this.message$.subscribe(message => this.messageChange.emit(message))
  }

  ngOnDestroy(): void {
    this.destroyed$.next()
  }

  private readonly destroyed$: Subject<void> = new Subject<void>()
  private readonly errorsSubject: BehaviorSubject<ValidationErrors | null> = new BehaviorSubject<ValidationErrors | null>(null)
  private readonly controlSubject: BehaviorSubject<AbstractControl | null> = new BehaviorSubject<AbstractControl | null>(null)
  private readonly controlLabelSubject: BehaviorSubject<string> = new BehaviorSubject<string>('')
  private readonly resolversSubject: BehaviorSubject<Array<ErrorMessageResolver>> = new BehaviorSubject<Array<ErrorMessageResolver>>([])
  // private readonly visibilitySubject: BehaviorSubject<ErrorsVisibility> = new BehaviorSubject<ErrorsVisibility>()
}
