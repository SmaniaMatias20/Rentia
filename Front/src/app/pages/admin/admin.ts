import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TableAdmin } from './components/table-admin';

@Component({
  selector: 'app-admin',
  imports: [TableAdmin],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  constructor(private router: Router) { }

  goToHome() {
    this.router.navigate(['/home']);
  }
}
