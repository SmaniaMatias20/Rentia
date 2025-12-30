import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-card-tenant',
  imports: [CommonModule],
  templateUrl: './card-tenant.html',
  styleUrl: './card-tenant.css',
})
export class CardTenant {

  @Input() icon!: string;
  @Input() title!: string;
  @Input() bgColor: string = 'bg-blue-600';
  @Input() backgroundImage: string = '';
  @Input() url!: string;
  @Input() tenant!: any;

  @Output() delete = new EventEmitter<number>(); // <-- emitir id al padre


  constructor(private router: Router) { }

  navigate() {
    if (this.url) {
      this.router.navigateByUrl(this.url);
    }
  }

  deleteTenant() {
    console.log('Eliminando inquilino:', this.tenant.id);
    this.delete.emit(this.tenant.id); // <-- emitir el id al padre
  }

}
