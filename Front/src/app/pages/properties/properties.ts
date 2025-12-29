import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-properties',
  imports: [],
  templateUrl: './properties.html',
  styleUrl: './properties.css',
})
export class Properties {
  constructor(private router: Router) { }

  goToHome() {
    this.router.navigateByUrl('/home');
  }


}
