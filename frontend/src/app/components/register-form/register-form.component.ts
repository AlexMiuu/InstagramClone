import { Component, inject } from "@angular/core"
import { CardModule } from "primeng/card"
import { ButtonModule } from "primeng/button"
import { InputTextModule } from "primeng/inputtext"
import { FloatLabelModule } from "primeng/floatlabel"
import { DividerModule } from "primeng/divider"
import { FormBuilder, FormsModule, Validators, ReactiveFormsModule, FormGroup } from "@angular/forms"
import { CommonModule } from "@angular/common"
import  { Router } from "@angular/router"
import  { AuthService } from "../../services/auth.service"
import { MessageService } from "primeng/api"
import { ToastModule } from "primeng/toast"

@Component({
  selector: "app-register-form",
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ReactiveFormsModule,
    InputTextModule,
    FormsModule,
    FloatLabelModule,
    DividerModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: "./register-form.component.html",
  styleUrl: "./register-form.component.css",
})
export class RegisterFormComponent {
  registerForm: FormGroup
  errorMessage = ""
  isLoading=false 
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = this.fb.group(
      {
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", Validators.required],
        dateOfBirth: ["", Validators.required],
      },
      { validators: this.passwordMatchValidator },
    )
  }
    passwordMatchValidator(form: FormGroup) {
    const password = form.get("password")
    const confirmPassword = form.get("confirmPassword")
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true })
    } else {
      confirmPassword?.setErrors(null)
    }
    return null
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      const { email, password, dateOfBirth } = this.registerForm.value
      const user = {
        email,
        password,
        date_of_birth: new Date(dateOfBirth),
        is_admin: false,
        is_blocked: false,
      }

      this.authService.register(user).subscribe({
        next: () => {
          this.router.navigate(["/login"])
        },
        error: (error) => {
          this.errorMessage = "Registration failed. Please try again."
          console.error("Registration error:", error)
        },
      })
    }
  }
}
