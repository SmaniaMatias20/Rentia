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
  user: any = null; // inicializar como null

  constructor(private router: Router, private auth: Auth) { }

  ngOnInit(): void {
    // 🔹 Obtener usuario async al iniciar el componente
    this.loadUser();
  }

  async loadUser() {
    this.user = await this.auth.getCurrentUser();
    console.log(this.user);
  }

  async logout() {
    console.log('Logout');
    await this.auth.signOut();
    this.user = null;
  }

}
