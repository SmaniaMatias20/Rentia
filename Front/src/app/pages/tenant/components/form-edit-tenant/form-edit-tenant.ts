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
      username: [
        this.currentValue?.username || '',
        [Validators.required, Validators.minLength(3)]
      ],
      phone: [
        this.currentValue?.phone || '',
        [Validators.required, Validators.pattern(/^[0-9+\s()-]+$/)]
      ],
      email: [
        this.currentValue?.email || '',
        [Validators.required, Validators.email]
      ],
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.save.emit(this.form.value);
  }
}
