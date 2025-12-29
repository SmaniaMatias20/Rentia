import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder
} from '@angular/forms';
import { Auth } from '../../../../services/auth/auth';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private auth: Auth) {
    this.registerForm = this.fb.group({
      username: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required])
    });
  }

  onSubmit() {
    if (!this.registerForm.valid) {
      alert('Completá todos los campos');
      return;
    }
    console.log(this.registerForm.value);

    this.auth.signUp(this.registerForm.value.username, this.registerForm.value.email, this.registerForm.value.password)
      .then(({ user }) => {
        if (user) {
          console.log('Registro exitoso:', user.email);
        } else {
          console.error('Error al registrarse:');
        }
      })
      .catch((error) => {
        console.error('Error al registrarse:', error.message);
      });
  }

}
