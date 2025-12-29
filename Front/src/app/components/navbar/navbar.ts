import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {

  username = 'Matías';

  constructor(private router: Router) { }

  logout() {
    console.log('Logout');
    // limpiar token / session
    // redirigir a login
    this.router.navigateByUrl('/auth');

  }

}
