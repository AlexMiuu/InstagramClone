import { type ApplicationConfig, provideZoneChangeDetection } from "@angular/core"
import { provideRouter, withComponentInputBinding } from "@angular/router"
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async"
import { providePrimeNG } from "primeng/config"
import { routes } from "./app.routes"
import Aura from "@primeng/themes/aura"
import { provideHttpClient, withInterceptors } from "@angular/common/http"
import { AuthInterceptor } from "./interceptors/auth.interceptor"
import { DOCUMENT } from "@angular/common"
import { APP_INITIALIZER, inject } from "@angular/core"

// Function to remove CSP meta tag during initialization
function removeCspMetaTag() {
  return () => {
    const document = inject(DOCUMENT)
    const metaTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]')
    metaTags.forEach((tag) => tag.remove())
    return Promise.resolve()
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([AuthInterceptor])),
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
    // Add initializer to remove CSP meta tag
    {
      provide: APP_INITIALIZER,
      useFactory: removeCspMetaTag,
      multi: true,
    },
  ],
}
