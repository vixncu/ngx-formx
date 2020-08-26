import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { AbstractControl, ValidationErrors } from '@angular/forms'
import { ErrorMessageResolver } from './error-message-resolver'

@Component({
  selector: 'fmx-errors',
  template: `
    <ng-container [fmxErrors]="errors"
                  [fmxErrorsControl]="control"
                  [fmxErrorsControlLabel]="controlLabel"
                  [fmxErrorsResolvers]="resolvers"
                  #errorsDirective='fmxErrors'>
      {{errorsDirective.message$ | async}}
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class FmxErrorsComponent {
  @Input() readonly errors: ValidationErrors | null = null
  @Input() readonly control: AbstractControl | null = null
  @Input() readonly controlLabel: string = ''
  @Input() readonly resolvers: Array<ErrorMessageResolver> = []
}
