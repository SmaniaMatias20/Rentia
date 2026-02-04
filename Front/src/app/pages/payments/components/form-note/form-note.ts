import { Component, Input, Output, EventEmitter } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-note',
  imports: [CommonModule, FormsModule],
  templateUrl: './form-note.html',
  styleUrl: './form-note.css',
})
export class FormNote {

  @Input() note: string = '';
  @Output() saveNote = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  constructor() { }

  close() {
    this.note = '';
    this.cancel.emit();
  }

  save() {
    this.saveNote.emit(this.note);
  }

}
