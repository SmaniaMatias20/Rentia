import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-card-property',
  imports: [CommonModule],
  templateUrl: './card-property.html',
  styleUrl: './card-property.css',
})
export class CardProperty {

  @Input() icon!: string;
  @Input() title!: string;
  @Input() bgColor: string = 'bg-blue-600';
  @Input() backgroundImage: string = '';
  @Input() url!: string;
  @Input() property!: any;

  @Output() delete = new EventEmitter<number>(); // <-- emitir id al padre

  constructor(private router: Router) { }

  navigate() {
    if (this.url) {
      this.router.navigateByUrl(this.url);
    }
  }

  deleteProperty() {
    console.log('Eliminando propiedad:', this.property.id);
    this.delete.emit(this.property.id); // <-- emitir el id al padre
  }

}
