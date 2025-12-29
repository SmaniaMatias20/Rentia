import { Component } from '@angular/core';
import { CardOption } from './components/card-option/card-option';

@Component({
  selector: 'app-home',
  imports: [CardOption],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
