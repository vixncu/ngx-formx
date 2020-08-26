import { AbstractControl } from '@angular/forms'
import { InjectionToken } from '@angular/core'

export type ErrorsVisibility = (control: AbstractControl) => boolean

export const FMX_ERRORS_VISIBILITY = new InjectionToken<ErrorsVisibility>('Fmx Errors Visibility', {
  factory: () => (control: AbstractControl) => control.invalid && control.touched && control.dirty
})
