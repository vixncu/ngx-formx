import { Observable } from 'rxjs'

export interface ErrorMessageResolver {
  /**
   * Key of ${@link AbstractControl.errors}
   */
  errorKey: string

  /**
   * Returns the error message associated with ${@link errorKey}
   * @param error the value of ${@link AbstractControl.errors} for ${@link errorKey}
   * @param controlLabel control's label to be used in the error message
   */
  getMessage(error: unknown, controlLabel: string): string | Observable<string>
}


export interface ErrorMessageOptions {
  /**
   * Control's label to be used in the error message
   */
  controlLabel?: string

  /**
   * Error message resolvers to be used for this control only.
   * These take precedence before globally registered resolvers
   */
  resolvers?: Array<ErrorMessageResolver>
}
