import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ModalConfirm } from '../../../../components/modal-confirm/modal-confirm';

@Component({
  selector: 'app-card-property',
  imports: [CommonModule, ModalConfirm],
  templateUrl: './card-property.html',
  styleUrl: './card-property.css',
})
export class CardProperty {
  openConfirmModal = false;
  message = '¿Estás seguro que quieres eliminar esta propiedad?';
  @Input() icon!: string;
  @Input() title!: string;
  @Input() bgColor: string = 'bg-blue-600';
  @Input() backgroundImage: string = '';
  @Input() url!: string;
  @Input() property!: any;

  @Output() isEnabled = new EventEmitter<void>();

  constructor(private router: Router) { }

  navigate() {
    if (this.url) {
      this.router.navigateByUrl(this.url);
    }
  }

  deleteProperty() {
    this.isEnabled.emit(this.property);
  }

  openModal(isEnabled: boolean) {
    if (isEnabled) {
      this.message = '¿Estás seguro que quieres desactivar esta propiedad?';
      this.openConfirmModal = true;
      this.property.is_enabled = false;
      return;
    }

    this.message = '¿Estás seguro que quieres activar esta propiedad?';
    this.openConfirmModal = true;
    this.property.is_enabled = true;
  }

}
