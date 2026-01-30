import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-show-comment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './show-comment.html',
  styleUrls: ['./show-comment.css']
})
export class ShowComment {

  @Input() comment: string = '';  // Comentario a mostrar

}
