import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth';
import { ModalConfirm } from '../modal-confirm/modal-confirm';

@Component({
  selector: 'app-navbar',
  imports: [ModalConfirm],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  user: any = null;
  openConfirmModal = false;

  constructor(private router: Router, private auth: AuthService) { }

  ngOnInit(): void {
    this.loadUser();
  }

  async loadUser() {
    this.user = await this.auth.getCurrentUser();
  }

  async logout() {
    await this.auth.signOut();
    this.user = null;
  }

}
