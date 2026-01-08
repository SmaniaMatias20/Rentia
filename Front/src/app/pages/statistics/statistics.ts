import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.html',
  styleUrls: ['./statistics.css']
})
export class Statistics {

  constructor(private router: Router) {
  }

  goToHome() {
    this.router.navigateByUrl('/home');
  }

}
