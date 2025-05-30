import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './Service/AuthServices/auth.service';



export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    {
      provide: 'APP_INITIALIZER',
      useFactory: (authService: AuthService) => () => {
        console.log('APP_INITIALIZER: Starting token validation');
        return authService.validateToken() //return hatana ha lazmi or console bhi
      },
      deps: [AuthService],
      multi: true,
    },
  ],
};
