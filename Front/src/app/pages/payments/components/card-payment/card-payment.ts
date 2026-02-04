import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-payment',
  imports: [NgClass, CommonModule],
  templateUrl: './card-payment.html',
  styleUrl: './card-payment.css',
})
export class CardPayment {
  @Input() month: any;

}
