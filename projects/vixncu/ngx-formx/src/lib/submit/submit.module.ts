import { NgModule } from '@angular/core'
import { FmxFormSubmitDirective } from './form-submit.directive'
import { FmxControlSubmitDirective } from './control-submit.directive'


@NgModule({
  declarations: [
    FmxFormSubmitDirective,
    FmxControlSubmitDirective
  ],
  exports: [
    FmxFormSubmitDirective,
    FmxControlSubmitDirective
  ]
})
export class FmxSubmitModule {}
