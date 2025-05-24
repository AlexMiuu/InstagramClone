import { bootstrapApplication } from "@angular/platform-browser"
import { AppComponent } from "./app/app.component"
import { appConfig } from "./app/app.config"

// Remove any CSP meta tags before bootstrapping
const cspMetaTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]')
cspMetaTags.forEach((tag) => tag.remove())

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err))
