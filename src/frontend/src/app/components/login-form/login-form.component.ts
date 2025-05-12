import { Component, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormBuilder, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css'],
  imports: [CardModule, ButtonModule, InputTextModule, FormsModule, ReactiveFormsModule, FloatLabelModule, DividerModule],
  standalone: true
})
export class LoginFormComponent {
  value2 = '';
  value3 = '';
  
  fb = inject(FormBuilder);
  
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  constructor() {}
}
