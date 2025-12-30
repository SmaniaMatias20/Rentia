import { Component } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-toast',
  imports: [NgClass],
  templateUrl: './toast.html',
  styleUrls: ['./toast.css'], // corregido
})
export class Toast {
  show = false;
  message = '';
  type: 'success' | 'warning' | 'error' = 'success'; // nuevo

  showToast(message: string, type: 'success' | 'warning' | 'error' = 'success', duration: number = 3000) {
    this.message = message;
    this.type = type;
    this.show = true;

    setTimeout(() => {
      this.show = false;
    }, duration);
  }
}
