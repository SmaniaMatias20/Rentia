import { Component } from '@angular/core';
import { CardOption } from './components/card-option/card-option';
import { AuthService } from '../../services/auth/auth';
import { Spinner } from '../../components/spinner/spinner';

@Component({
  selector: 'app-home',
  imports: [CardOption, Spinner],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  loading = false;
  currentUser: any;

  constructor(private auth: AuthService) { }

  async ngOnInit(): Promise<void> {
    this.loading = true;

    try {
      this.currentUser = await this.auth.getCurrentUser();
    } catch (error) {
      console.error('Error al obtener usuario:', error);
    } finally {
      this.loading = false;
    }
  }
}

