import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(), // Habilita el binding de inputs desde la ruta
      withInMemoryScrolling({
        scrollPositionRestoration: 'top', // Mejor UX para scroll
        anchorScrolling: 'enabled'
      })
    ),
    provideClientHydration(),
    provideHttpClient(
      withFetch(), // Usa fetch API para HTTP
      // withInterceptors([]) // Descomenta para añadir interceptores si es necesario
    )
  ]
};