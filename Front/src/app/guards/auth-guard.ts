import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth'; // ajustá la ruta

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(): boolean {
    const user = this.authService.getCurrentUser();

    if (user) {
      return true;
    }

    this.router.navigate(['/auth']);
    return false;
  }
}
