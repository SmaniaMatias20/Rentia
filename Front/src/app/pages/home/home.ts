import { Component } from '@angular/core';
import { CardOption } from './components/card-option/card-option';
import { AuthService } from '../../services/auth/auth';

@Component({
  selector: 'app-home',
  imports: [CardOption],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  currentUser: any;

  constructor(private auth: AuthService) { }

  ngOnInit(): void {
    this.auth.getCurrentUser().then((user) => {
      this.currentUser = user;
    });
  }

}
