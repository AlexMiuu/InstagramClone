import { Component, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DividerModule } from 'primeng/divider';
import { FormBuilder, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgIf } from '@angular/common';
@Component({
  selector: 'app-register-form',
  imports: [NgIf,CommonModule,CardModule, ButtonModule,ReactiveFormsModule, InputTextModule, FormsModule, FloatLabelModule, DividerModule],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.css'
})
export class RegisterFormComponent {
  value2 = '';
  value3 = '';

  constructor() {}
  fb = inject(FormBuilder);
  
  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    fullName: ['', Validators.required],
    username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._]+$/)]],
  });

  onRegister(){
   
  }

}
