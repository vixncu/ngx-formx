import { ErrorMessageResolver } from './error-message-resolver'

export class RequiredErrorResolver implements ErrorMessageResolver {
  readonly errorKey: string = 'required'

  getMessage(error: unknown, name: string): string {
    return `${name} is required!`
  }
}

export class MinLengthErrorResolver implements ErrorMessageResolver {
  readonly errorKey: string = 'minlength'

  getMessage(error: { requiredLength: number, actualLength: number }, controlName: string): string {
    return `${controlName} has to be min ${error.requiredLength} characters long`
  }
}

export class MaxLengthErrorResolver implements ErrorMessageResolver {
  readonly errorKey: string = 'maxlength'

  getMessage(error: { requiredLength: number, actualLength: number }, controlName: string): string {
    return `${controlName} has to be max ${error.requiredLength} characters long`
  }
}

export class EmailErrorResolver implements ErrorMessageResolver {
  readonly errorKey: string = 'email'

  getMessage(error: unknown, controlName: string): string {
    return 'Please enter a valid email'
  }
}

export const DEFAULT_ERROR_RESOLVERS: Array<ErrorMessageResolver> = [
  new RequiredErrorResolver(),
  new MinLengthErrorResolver(),
  new MaxLengthErrorResolver(),
  new EmailErrorResolver()
]
