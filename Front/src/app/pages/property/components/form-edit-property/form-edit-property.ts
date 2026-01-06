import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';


type EditType = 'value' | 'additional_costs' | 'tenant' | 'address' | 'name';

@Component({
  selector: 'app-form-edit-property',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form-edit-property.html',
  styleUrl: './form-edit-property.css',
})
export class FormEditProperty implements OnInit {

  @Input() type!: EditType;
  @Input() currentValue: any;

  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      value: [this.currentValue, this.getValidatorsByType()],
    });
  }

  private getValidatorsByType() {
    switch (this.type) {
      case 'value':
      case 'additional_costs':
        return [Validators.required, Validators.pattern(/^\d+$/)];

      case 'tenant':
        return [Validators.required];

      default:
        return [];
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.save.emit(this.form.value.value);
  }
}
