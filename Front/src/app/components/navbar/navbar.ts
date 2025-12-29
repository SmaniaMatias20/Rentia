import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {

  username = 'Matías';

  logout() {
    console.log('Logout');
    // limpiar token / session
    // redirigir a login
  }

}
