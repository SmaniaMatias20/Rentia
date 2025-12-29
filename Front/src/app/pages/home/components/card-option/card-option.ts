import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-option',
  imports: [CommonModule],
  templateUrl: './card-option.html',
  styleUrl: './card-option.css',
})
export class CardOption {
  @Input() icon!: string;        // nombre del material icon
  @Input() title!: string;       // texto
  @Input() bgColor: string = 'bg-blue-600'; // clase tailwind

}
