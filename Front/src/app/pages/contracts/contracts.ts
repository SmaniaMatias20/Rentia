import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contracts',
  imports: [],
  templateUrl: './contracts.html',
  styleUrl: './contracts.css',
})
export class Contracts {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  goToHome() {
    this.router.navigateByUrl('/home');
  }

  openFormContract() {
    console.log('openFormContract');
  }

}
