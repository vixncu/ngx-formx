import { ChangeDetectorRef, Directive, Inject, Input, OnDestroy, OnInit, Self } from '@angular/core'
import { Observable, of, Subject } from 'rxjs'
import { AbstractControl, NgControl } from '@angular/forms'
import { filter, first, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators'

export type OnControlSubmitFn = (control: AbstractControl) => void

@Directive({ selector: '[formControl], [formControlName]' })
export class FmxControlSubmitDirective implements OnInit, OnDestroy {
  /**
   * This will be called everytime the form is submitted
   */
  @Input('fmxOnControlSubmit') readonly onControlSubmit: OnControlSubmitFn = this.onSubmit

  /**
   * Emits everytime the ${@link AbstractControl.statusChanges} emits a value that is not 'PENDING'.
   * If the value is 'VALID', this emits true, otherwise false
   */
  submitValid$!: Observable<boolean>

  constructor(
    @Inject(NgControl) @Self() private readonly ngControl: NgControl,
    @Inject(ChangeDetectorRef) private readonly cdf: ChangeDetectorRef
  ) { }

  private get onSubmit(): OnControlSubmitFn {
    return (control: AbstractControl) => {
      control.markAsTouched()
      control.markAsDirty()
      this.cdf.markForCheck()
    }
  }

  ngOnInit(): void {
    const control = this.ngControl.control as AbstractControl
    this.submitValid$ = of(null)
      .pipe(
        takeUntil(this.destroyed$),
        tap(() => this.onControlSubmit(control)),
        switchMap(() => control.statusChanges
          .pipe(
            startWith(control.status),
            filter(status => status !== 'PENDING'), // wait before any async validators finish
            first()
          )
        ),
        map(status => status === 'VALID')
      )
  }

  ngOnDestroy(): void {
    this.destroyed$.next()
  }

  private readonly destroyed$: Subject<void> = new Subject<void>()
}
