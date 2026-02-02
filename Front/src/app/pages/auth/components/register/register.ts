import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder
} from '@angular/forms';
import { AuthService } from '../../../../services/auth/auth';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.registerForm = this.fb.group({
      username: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      role: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required])
    });
  }

  onSubmit() {
    if (!this.registerForm.valid) {
      alert('Completá todos los campos');
      return;
    }

    this.auth.signUp(
      this.registerForm.value.username,
      this.registerForm.value.email,
      this.registerForm.value.password,
      this.registerForm.value.role
    )
      .then(({ user, error }) => {
        if (error) {
          console.error('Error al registrarse:', error);
          return;
        }

        if (user) {
          console.log('Registro exitoso:', user.email);
        } else {
          console.error('Registro falló sin error explícito');
        }
      })
      .catch((error) => {
        console.error('Error inesperado:', error);
      });
  }


  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

}
