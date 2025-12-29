import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CardProperty } from './components/card-property/card-property';

@Component({
  selector: 'app-properties',
  imports: [CardProperty],
  templateUrl: './properties.html',
  styleUrl: './properties.css',
})
export class Properties {
  constructor(private router: Router) { }

  goToHome() {
    this.router.navigateByUrl('/home');
  }

  goToNewProperty() {
    console.log('go to new property');
  }

}
