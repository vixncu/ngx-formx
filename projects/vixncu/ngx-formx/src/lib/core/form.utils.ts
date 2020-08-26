import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms'
import { Observable } from 'rxjs'
import { map, startWith } from 'rxjs/operators'

// @dynamic
export class FmxFormUtils {
  /**
   * Add validators to a control without removing the existing ones
   */
  static addValidatorsToControl(control: AbstractControl, newValidator: ValidatorFn | ValidatorFn[]): void {
    if (control) {
      const newValidators = Array.isArray(newValidator) ? newValidator : [newValidator]
      const validators = control.validator ? [control.validator, ...newValidators] : newValidators
      control.setValidators(validators)
    }
  }

  /**
   * Add async validators to a control without removing the existing ones
   */
  static addAsyncValidatorsToControl(control: AbstractControl, newValidator: AsyncValidatorFn | AsyncValidatorFn[]): void {
    if (control) {
      const newValidators = Array.isArray(newValidator) ? newValidator : [newValidator]
      const validators = control.asyncValidator ? [control.asyncValidator, ...newValidators] : newValidators
      control.setAsyncValidators(validators)
    }
  }

  /**
   * Get control's errors as an Observable
   * Main use case: Changes done by async validators into ${@link AbstractControl.errors}
   * are not spotted when using ${@link ChangeDetectionStrategy.OnPush}
   */
  static getControlErrors$(control: AbstractControl): Observable<ValidationErrors | null> {
    return control.statusChanges.pipe(startWith(''), map(() => control.errors))
  }
}
