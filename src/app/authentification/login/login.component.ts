import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginFormComponent } from "../../components/login-form/login-form.component";
import { LoginFormBannerComponent } from "../../components/login-form-banner/login-form-banner.component";
@Component({
  selector: 'app-login',
  imports: [RouterOutlet, LoginFormComponent, LoginFormBannerComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: true
})
export class LoginComponent {

}
