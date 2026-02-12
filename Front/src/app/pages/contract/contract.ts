import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contract',
  imports: [],
  templateUrl: './contract.html',
  styleUrl: './contract.css',
})
export class Contract {

  constructor(private router: Router) { }

  goToContracts() {
    this.router.navigate(['contracts']);
  }

}
