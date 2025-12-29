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
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private auth: Auth) {
    this.loginForm = this.fb.group({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    });
  }


  onSubmit() {
    if (!this.loginForm.valid) {
      alert('Completá todos los campos');
      return;
    }
    console.log(this.loginForm.value);

    this.auth.signIn(this.loginForm.value.username, this.loginForm.value.password)
      .then(({ session }) => {
        if (session) {
          console.log('Login exitoso:', session.user.email);
        } else {
          console.error('Error al iniciar sesión:');
        }
      })
      .catch((error) => {
        console.error('Error al iniciar sesión:', error.message);
      });

  }

}
