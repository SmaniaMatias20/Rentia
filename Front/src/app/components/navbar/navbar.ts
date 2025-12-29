import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth/auth';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {

  username = 'Matías';

  constructor(private router: Router, private auth: Auth) { }

  logout() {
    console.log('Logout');
    this.auth.signOut();

  }

}
