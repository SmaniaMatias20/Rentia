import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth';
import { Spinner } from '../../components/spinner/spinner';
import { Toast } from '../../components/toast/toast';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [Spinner, Toast, DatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  loading = false;
  currentUser: any;
  @ViewChild('toast') toast!: Toast;

  constructor(private auth: AuthService, private router: Router) { }

  async ngOnInit(): Promise<void> {
    this.loading = true;

    try {
      this.currentUser = await this.auth.getCurrentUser();
      this.toast.showToast('Datos del usuario obtenidos', 'success');
      console.log(this.currentUser);
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      this.toast.showToast('Error al obtener tu perfil', 'error');
    } finally {
      this.loading = false;
    }
  }

  goToHome() {
    this.router.navigateByUrl('/home');
  }

}
