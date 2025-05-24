import { Component, inject } from "@angular/core"
import { CardModule } from "primeng/card"
import { ButtonModule } from "primeng/button"
import { InputTextModule } from "primeng/inputtext"
import { FormBuilder,FormGroup, FormsModule, Validators, ReactiveFormsModule } from "@angular/forms"
import { FloatLabelModule } from "primeng/floatlabel"
import { DividerModule } from "primeng/divider"
import  { Router } from "@angular/router"
import  { AuthService } from "../../services/auth.service"
import { MessageService } from "primeng/api"
import { ToastModule } from "primeng/toast"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-login-form",
  templateUrl: "./login-form.component.html",
  styleUrls: ["./login-form.component.css"],
  imports: [
    CardModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    FloatLabelModule,
    DividerModule,
    ToastModule,
    CommonModule,
  ],
  providers: [MessageService],
  standalone: true,
})
export class LoginFormComponent {
  loginForm: FormGroup
  errorMessage = ""
  isLoading=false
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
    })
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value
      this.authService.login(email, password).subscribe({
        next: () => {
          this.router.navigate(["/feed"])
        },
        error: (error) => {
          this.errorMessage = "Invalid credentials"
          console.error("Login error:", error)
        },
      })
    }
  }
}
