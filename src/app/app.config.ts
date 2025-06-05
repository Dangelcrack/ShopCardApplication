import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch, HTTP_INTERCEPTORS } from '@angular/common/http';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ 
      eventCoalescing: true,
      runCoalescing: true // Mejor rendimiento para eventos
    }),
    provideRouter(
      routes,
      withComponentInputBinding(), // Habilita el binding de inputs desde la ruta
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled' // Para scroll a anclas
      })
    ),
    provideClientHydration(),
    provideHttpClient(
      withFetch(), // Usa fetch API para HTTP
    )
  ]
};