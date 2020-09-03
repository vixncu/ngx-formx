import { Directive, OnDestroy, OnInit } from '@angular/core'
import {
  AbstractControl,
  AsyncValidatorFn,
  ControlValueAccessor as NgControlValueAccessor,
  NgControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms'
import { Observable, Subject } from 'rxjs'
import { filter, first, map, share, startWith, takeUntil } from 'rxjs/operators'
import { FmxFormUtils } from './form.utils'

/**
 * @typeParam I type of control's input value, used as type param for {@link writeValue}
 * @typeParam O type of control's output value, used as type param for the changeFn received through ${@link registerOnChange} and as
 * return type for {@link mapToOutput}
 */
@Directive()
// tslint:disable-next-line:directive-class-suffix
export abstract class ControlValueAccessor<I = unknown, O = I> implements NgControlValueAccessor, OnInit, OnDestroy {

  abstract readonly control: AbstractControl
  errors$!: Observable<ValidationErrors | null>

  externalControl!: AbstractControl
  externalErrors$!: Observable<ValidationErrors | null>
  protected onTouched!: () => void
  protected readonly destroyed$: Subject<void> = new Subject()

  protected constructor(protected readonly ngControl: NgControl) {
    ngControl.valueAccessor = this
  }

  get destroyed(): boolean {
    return this.isDestroyed
  }

  writeValue(value: I): void {
    this.control.reset(value)
  }

  registerOnChange(fn: (value: O) => void): void {
    this.valueChanges$().pipe(takeUntil(this.destroyed$), map(value => this.mapToOutput(value))).subscribe(fn)
  }

  registerOnTouched(fn: unknown): void {
    this.onTouched = fn as () => void
  }

  ngOnInit(): void {
    this.errors$ = this.getErrors$(this.control)
    this.externalControl = this.ngControl.control as AbstractControl
    this.externalErrors$ = this.getErrors$(this.externalControl)

    // angular bug, setValidators() in nested form control
    // https://github.com/angular/angular/issues/18004, https://github.com/angular/angular/issues/23657
    setTimeout(() => this.registerExternalValidators(), 0)
  }

  ngOnDestroy(): void {
    this.isDestroyed = true
    this.destroyed$.next()
  }

  protected valueChanges$(): Observable<unknown> {
    return this.control.valueChanges
  }

  protected mapToOutput(value: unknown): O {
    return value as O
  }

  protected registerExternalValidators(): void {
    FmxFormUtils.addValidatorsToControl(this.externalControl, this.validatorFn())
    FmxFormUtils.addAsyncValidatorsToControl(this.externalControl, this.asyncValidatorFn())
    this.externalControl.updateValueAndValidity({ emitEvent: false })
  }

  protected validatorFn(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (this.destroyed) {
        /** If this control is destroyed, but the ${@link externalControl} is not, the validators set by {@link registerExternalValidators}
         * will remain active. So by returning null when this control is destroyed it will not continue to affect
         * {@link externalControl}s validation status.
         *
         * This is a workaround until Angular provides a way to remove a specific validator.
         * Right now, on version 10.0.11, all validators are composed under one validation function.
         */
        return null
      }
      if (this.control.invalid) {
        return this.control.errors ?? { invalid: true }
      }
      return null
    }
  }

  protected asyncValidatorFn(): AsyncValidatorFn {
    return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
      return this.control.statusChanges.pipe(
        /** @see validatorFn explanation regarding the use of {@link destroyed} in the validation logic */
        startWith(!this.destroyed ? this.control.status : 'ACTIVE'),
        filter(status => status !== 'PENDING'), // if async validation does not emit a value it's recalled until it does
        map(status => status === 'INVALID' ? (this.control.errors ?? { invalid: true }) : null),
        first()
      )
    }
  }

  protected markAsTouched(): void {
    this.control.markAsTouched()
    this.externalControl.markAsTouched()
  }

  protected markAsDirty(): void {
    this.control.markAsDirty()
    this.externalControl.markAsDirty()
  }

  protected getErrors$(control: AbstractControl): Observable<ValidationErrors | null> {
    return FmxFormUtils.getControlErrors$(control).pipe(takeUntil(this.destroyed$), share())
  }

  private isDestroyed: boolean = false
}
