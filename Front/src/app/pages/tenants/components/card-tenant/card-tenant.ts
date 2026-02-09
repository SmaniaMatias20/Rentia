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
  message = '¿Estás seguro que quieres desactivar este inquilino?';
  @Input() icon!: string;
  @Input() title!: string;
  @Input() bgColor: string = 'bg-blue-600';
  @Input() backgroundImage: string = '';
  @Input() url!: string;
  @Input() tenant!: any;
  @Output() isEnabled = new EventEmitter<any>(); // <-- emitir id al padre

  constructor(private router: Router) { }

  navigate() {
    if (this.url) {
      this.router.navigateByUrl(this.url);
    }
  }

  isTenanrEnabled() {
    this.isEnabled.emit(this.tenant); // <-- emitir el id al padre
  }

  openModal(isEnabled: boolean) {
    if (isEnabled) {
      this.message = '¿Estás seguro que quieres desactivar este inquilino?';
      this.openConfirmModal = true;
      this.tenant.is_enabled = false;
      return;
    }

    this.message = '¿Estás seguro que quieres activar este inquilino?';
    this.openConfirmModal = true;
    this.tenant.is_enabled = true;
  }

}
