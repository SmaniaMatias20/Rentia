import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth/auth';
import { Toast } from '../../../../components/toast/toast';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder
} from '@angular/forms';


@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, Toast],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup;
  showPassword = false;
  @ViewChild('toast') toast!: Toast;

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.loginForm = this.fb.group({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    });
  }


  onSubmit() {
    try {
      if (!this.loginForm.valid) {
        alert('Completá todos los campos');
        return;
      }

      this.auth.signIn(
        this.loginForm.value.username,
        this.loginForm.value.password
      )
        .then(({ user, error }) => {

          if (error) {
            this.toast.showToast('Usuario o contraseña incorrectos', 'error');
            return;
          }

          if (user) {
            this.toast.showToast('Sesión iniciada', 'success');
          }

        })
        .catch((error) => {
          console.error('Error al iniciar sesión:', error.message);
        });

    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  }


  togglePassword() {
    this.showPassword = !this.showPassword;
  }

}
