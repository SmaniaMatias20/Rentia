import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-show-comment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './show-comment.html',
  styleUrls: ['./show-comment.css']
})
export class ShowComment {

  @Input() comment: any;
  @Output() delete = new EventEmitter<any>();
  @Output() toggle = new EventEmitter<any>();

  constructor() { }

  // Borrar comentario
  async deleteComment(id: string) {
    this.delete.emit(id);
  }

  // Mostrar o no mostrar comentario
  async toggleComment(id: string) {
    this.toggle.emit(id);
  }

}
