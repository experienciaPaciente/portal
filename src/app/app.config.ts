import { ApplicationConfig } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withViewTransitions,
} from '@angular/router';

import { routes } from './app-routing.module';
import { firebaseProviders } from './firebase.config';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions(), withComponentInputBinding()),
    firebaseProviders, ZXingScannerModule
  ],
};
