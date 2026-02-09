import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-card-statistic',
  imports: [FormsModule, NgClass],
  templateUrl: './card-statistic.html',
  styleUrl: './card-statistic.css',
})
export class CardStatistic {
  @Input() icon: string = '';
  @Input() title: string = '';
  @Input() value: any = '';
  @Input() description: string = '';
  @Input() iconColor: string = '';
  @Input() descriptionColor: string = '';

  constructor() { }

}
