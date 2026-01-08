import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ModalConfirm } from '../../../../components/modal-confirm/modal-confirm';

@Component({
  selector: 'app-card-tenant',
  imports: [CommonModule, ModalConfirm],
  templateUrl: './card-tenant.html',
  styleUrl: './card-tenant.css',
})
export class CardTenant {
  openConfirmModal = false;
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
    this.delete.emit(this.tenant.id); // <-- emitir el id al padre
  }

}
