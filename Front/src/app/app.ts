import { Component } from '@angular/core';
import { RouterOutlet, NavigationEnd, Router } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { filter } from 'rxjs';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {


  showNavbar: boolean = false;
  constructor(private router: Router) { }

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.showNavbar = event.url.includes('/home') || event.url.includes('/profile') || event.url.includes('/statistics') || event.url.includes('/payments') || event.url.includes('/tenants') || event.url.includes('/properties') || event.url.includes('/contracts');
    });


  }


}
