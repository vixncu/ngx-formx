import { CommonModule } from '@angular/common'
import { ModuleWithProviders, NgModule } from '@angular/core'
import { FmxErrorsComponent } from './errors.component'
import { FmxErrorsDirective } from './errors.directive'
import { FmxErrorsService } from './errors.service'
import { ErrorsVisibility, FMX_ERRORS_VISIBILITY } from './errors-visibility'


export interface FmxErrorsModuleConfig {
  errorsVisibility?: ErrorsVisibility
}


@NgModule({
  imports: [CommonModule],
  declarations: [
    FmxErrorsComponent,
    FmxErrorsDirective
  ],
  exports: [
    FmxErrorsComponent,
    FmxErrorsDirective
  ]
})
export class FmxErrorsModule {
  static forRoot(config?: FmxErrorsModuleConfig): ModuleWithProviders<FmxErrorsModule> {
    return {
      ngModule: FmxErrorsModule,
      providers: [
        FmxErrorsService,
        // {provide: FMX_ERRORS_VISIBILITY, useValue: config?.errorsVisibility ?? }
      ]
    }
  }
}
