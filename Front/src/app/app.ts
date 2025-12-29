import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  showNavbar = true;

  onNavigationStart(event: NavigationStart) {
    if (event.url === '/') {
      this.showNavbar = false;
    } else {
      this.showNavbar = true;
    }
  }

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.onNavigationStart(event);
      }
    });
  }
}
