import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-comment',
  imports: [FormsModule],
  templateUrl: './create-comment.html',
  styleUrl: './create-comment.css',
})
export class CreateComment {

  @Input() initialComment: string = '';  // Comentario inicial (si existe)
  @Output() saveComment = new EventEmitter<string>();

  comment: string = '';

  ngOnInit() {
    this.comment = this.initialComment;
  }

  onSave() {
    this.saveComment.emit(this.comment);
  }
}
