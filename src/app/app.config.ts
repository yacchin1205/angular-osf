import { provideStore } from '@ngxs/store';

import { TranslateModule } from '@ngx-translate/core';

import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { DialogService } from 'primeng/dynamicdialog';

import { APP_BASE_HREF } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, ErrorHandler, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { STATES } from '@core/constants/ngxs-states.constant';
import { provideTranslation } from '@core/helpers/i18n.helper';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { viewOnlyInterceptor } from '@core/interceptors/view-only.interceptor';
import { APPLICATION_INITIALIZATION_PROVIDER } from '@core/provider/application.initialization.provider';
import { ENVIRONMENT } from '@core/provider/environment.provider';
import { SENTRY_PROVIDER } from '@core/provider/sentry.provider';
import { EnvironmentModel } from '@osf/shared/models/environment.model';

import CustomPreset from './core/theme/custom-preset';
import { routes } from './app.routes';

import * as Sentry from '@sentry/angular';

export const appConfig: ApplicationConfig = {
  providers: [
    APPLICATION_INITIALIZATION_PROVIDER,
    ConfirmationService,
    DialogService,
    MessageService,
    {
      provide: ErrorHandler,
      useFactory: () => Sentry.createErrorHandler({ showDialog: false }),
    },
    importProvidersFrom(TranslateModule.forRoot(provideTranslation())),
    provideAnimations(),
    providePrimeNG({
      theme: {
        preset: CustomPreset,
        options: {
          darkModeSelector: false,
          cssLayer: {
            name: 'primeng',
            order: 'reset, base, primeng',
          },
        },
      },
    }),
    provideHttpClient(withInterceptors([authInterceptor, viewOnlyInterceptor, errorInterceptor])),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })),
    provideStore(STATES),
    provideZoneChangeDetection({ eventCoalescing: true }),
    {
      provide: APP_BASE_HREF,
      deps: [ENVIRONMENT],
      useFactory: (environment: EnvironmentModel) => environment.routerBaseHref ?? '/',
    },
    SENTRY_PROVIDER,
  ],
};
