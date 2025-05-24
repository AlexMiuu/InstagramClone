import { NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { BrowserAnimationsModule } from "@angular/platform-browser/animations"
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http"
import { AppComponent } from "./app.component"
import { AuthInterceptor } from "./interceptors/auth.interceptor"
import { RouterModule } from "@angular/router"
import { routes } from "./app.routes"

@NgModule({
  imports: [BrowserModule, BrowserAnimationsModule, HttpClientModule, RouterModule.forRoot(routes)],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useValue: AuthInterceptor,
      multi: true,
    },
  ]
})
export class AppModule {}
