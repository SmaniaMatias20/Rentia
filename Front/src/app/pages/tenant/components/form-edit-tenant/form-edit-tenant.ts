import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-edit-tenant',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form-edit-tenant.html',
  styleUrl: './form-edit-tenant.css',
})
export class FormEditTenant implements OnInit {

  @Input() currentValue!: any;
  @Input() type!: any;

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
      case 'username':
        return [Validators.required, Validators.minLength(3)];

      case 'phone':
        return [Validators.pattern(/^\d{7,15}$/)];

      case 'email':
        return [Validators.email];

      default:
        return [];
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.save.emit(this.form.value.value);
  }
}
