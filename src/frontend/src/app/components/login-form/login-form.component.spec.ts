import { type ComponentFixture, TestBed } from "@angular/core/testing"
import { LoginFormComponent } from "./login-form.component"
import { ReactiveFormsModule } from "@angular/forms"
import { CardModule } from "primeng/card"
import { ButtonModule } from "primeng/button"
import { InputTextModule } from "primeng/inputtext"
import { FloatLabelModule } from "primeng/floatlabel"
import { DividerModule } from "primeng/divider"
import { NoopAnimationsModule } from "@angular/platform-browser/animations"

describe("LoginFormComponent", () => {
  let component: LoginFormComponent
  let fixture: ComponentFixture<LoginFormComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        CardModule,
        ButtonModule,
        InputTextModule,
        FloatLabelModule,
        DividerModule,
        NoopAnimationsModule,
        LoginFormComponent,
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(LoginFormComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it("should create", () => {
    expect(component).toBeTruthy()
  })

  it("should initialize with an empty form", () => {
    expect(component.loginForm.get("email")?.value).toBe("")
    expect(component.loginForm.get("password")?.value).toBe("")
  })

  it("should validate email input", () => {
    const emailControl = component.loginForm.get("email")

    // Empty email should be invalid
    emailControl?.setValue("")
    expect(emailControl?.valid).toBeFalsy()
    expect(emailControl?.hasError("required")).toBeTruthy()

    // Invalid email format should be invalid
    emailControl?.setValue("invalid-email")
    expect(emailControl?.valid).toBeFalsy()
    expect(emailControl?.hasError("email")).toBeTruthy()

    // Valid email should be valid
    emailControl?.setValue("test@example.com")
    expect(emailControl?.valid).toBeTruthy()
  })

  it("should validate password input", () => {
    const passwordControl = component.loginForm.get("password")

    // Empty password should be invalid
    passwordControl?.setValue("")
    expect(passwordControl?.valid).toBeFalsy()
    expect(passwordControl?.hasError("required")).toBeTruthy()

    // Valid password should be valid
    passwordControl?.setValue("password123")
    expect(passwordControl?.valid).toBeTruthy()
  })

  it("should have a valid form when all fields are filled correctly", () => {
    component.loginForm.setValue({
      email: "test@example.com",
      password: "password123",
    })

    expect(component.loginForm.valid).toBeTruthy()
  })

  it("should render the Instagram header text", () => {
    const compiled = fixture.nativeElement
    expect(compiled.querySelector(".header-container").textContent).toContain("Instagram")
  })

  it("should render the login button", () => {
    const compiled = fixture.nativeElement
    const button = compiled.querySelector("p-button")
    expect(button).toBeTruthy()
  })

  it("should render the sign up link", () => {
    const compiled = fixture.nativeElement
    const signupLink = compiled.querySelector(".signup-link a")
    expect(signupLink).toBeTruthy()
    expect(signupLink.textContent).toContain("Sign up")
    expect(signupLink.getAttribute("href")).toBe("register")
  })
})
