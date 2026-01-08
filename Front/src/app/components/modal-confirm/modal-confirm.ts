import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-confirm',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-confirm.html',
  styleUrls: ['./modal-confirm.css'],
})
export class ModalConfirm {
  @Input() message: string = '¿Estás seguro?'; // mensaje que recibe el modal
  @Output() confirm = new EventEmitter<void>(); // evento para confirmar
  @Output() cancel = new EventEmitter<void>();  // evento para cancelar

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
