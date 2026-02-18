import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-form-services-amount',
  imports: [ReactiveFormsModule],
  templateUrl: './form-services-amount.html',
  styleUrl: './form-services-amount.css',
})
export class FormServicesAmount implements OnChanges {
  @Input() services_amount: any = {
    electricity: 0,
    gas: 0,
    hoa_fees: 0,
    water: 0
  };

  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<any>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      electricity: [0, [Validators.required, Validators.min(0)]],
      gas: [0, [Validators.required, Validators.min(0)]],
      hoa_fees: [0, [Validators.required, Validators.min(0)]],
      water: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['services_amount'] && this.services_amount) {
      this.form.patchValue(this.services_amount);
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.save.emit(this.form.value);
  }

}
