import { Injectable } from '@angular/core'
import { ErrorMessageOptions, ErrorMessageResolver } from './error-message-resolver'
import { isObservable, Observable, of } from 'rxjs'
import { ValidationErrors } from '@angular/forms'
import { first } from 'rxjs/operators'


@Injectable()
export class FmxErrorsService {
  registerResolver(resolver: ErrorMessageResolver, overwrite: boolean = false): void {
    if (this.resolvers.has(resolver.errorKey) && !overwrite) {
      throw new Error(
        `Error message resolver for key: ${resolver.errorKey} is already registered! ` +
        `If you wish to overwrite it, please set the 'overwrite' flag to true`
      )
    }
    this.resolvers.set(resolver.errorKey, resolver)
  }

  registerResolvers(resolvers: Array<ErrorMessageResolver>): void {
    resolvers?.forEach(resolver => this.registerResolver(resolver))
  }

  removeResolver(resolver: ErrorMessageResolver): void {
    this.removeResolverByKey(resolver.errorKey)
  }

  removeResolvers(resolvers: Array<ErrorMessageResolver>): void {
    resolvers?.forEach(resolver => this.removeResolver(resolver))
  }

  removeResolverByKey(errorKey: string): void {
    this.resolvers.delete(errorKey)
  }

  removeResolversByKey(errorKeys: Array<string>): void {
    errorKeys?.forEach(errorKey => this.removeResolverByKey(errorKey))
  }

  getErrorMessage(errors: ValidationErrors | null, options?: ErrorMessageOptions): Observable<string | null> {
    if (errors === null) { return of(null) }

    const controlName = options?.controlLabel || 'This field'
    const controlResolvers = FmxErrorsService.toResolversMap(options?.resolvers || [])

    const firstErrorKey = Object.keys(errors)[0]
    const resolver = controlResolvers.get(firstErrorKey) || this.resolvers.get(firstErrorKey)
    if (!resolver) { throw new Error(`No error resolver registered for error key: ${firstErrorKey}`) }

    const message: string | Observable<string> = resolver.getMessage(errors[firstErrorKey], controlName)
    const message$ = isObservable(message) ? message : of(message)
    return message$.pipe(first())
  }

  private static toResolversMap(resolvers: Array<ErrorMessageResolver>): Map<string, ErrorMessageResolver> {
    const map = new Map(resolvers.map(resolver => [resolver.errorKey, resolver]))
    return map
  }

  /**
   * Map of globally registered error message resolvers
   */
  private readonly resolvers: Map<string, ErrorMessageResolver> = new Map<string, ErrorMessageResolver>()
}
