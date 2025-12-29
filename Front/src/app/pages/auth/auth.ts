import { Component } from '@angular/core';
import { Login } from './components/login/login';
import { Register } from './components/register/register';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [Login, Register],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css'],
})
export class Auth {
  isLoginVisible: boolean = true;

  showLogin(): void {
    this.isLoginVisible = true;
  }

  showRegister(): void {
    this.isLoginVisible = false;
  }
}