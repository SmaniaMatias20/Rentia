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
  @Input() icon!: string;
  @Input() title!: string;
  @Input() bgColor: string = 'bg-blue-600';
  @Input() backgroundImage: string = '';
  @Input() url!: string;
  @Input() property!: any;

  @Output() delete = new EventEmitter<number>();

  constructor(private router: Router) { }

  navigate() {
    if (this.url) {
      this.router.navigateByUrl(this.url);
    }
  }

  deleteProperty() {
    this.delete.emit(this.property.id);
  }

}
