import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

declare var google: any;

type EditType =
  | 'value'
  | 'additional_costs'
  | 'tenant'
  | 'address'
  | 'name'
  | 'rooms'
  | 'type'
  | 'floor';

@Component({
  selector: 'app-form-edit-property',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form-edit-property.html',
  styleUrl: './form-edit-property.css',
})
export class FormEditProperty implements OnInit, AfterViewInit {

  @Input() type!: EditType;
  @Input() currentValue: any;

  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('addressInput') addressInput!: ElementRef;

  form!: FormGroup;
  addressValid = false;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    // Base
    this.form = this.fb.group({
      value: [this.currentValue, this.getValidatorsByType()],
    });

    // Si es dirección, agregamos el control address
    if (this.type === 'address') {
      this.form.addControl(
        'address',
        this.fb.control(this.currentValue, [
          Validators.required,
          Validators.minLength(5),
        ])
      );
    }
  }

  ngAfterViewInit(): void {
    if (this.type !== 'address') return;

    setTimeout(() => {
      const autocomplete = new google.maps.places.Autocomplete(
        this.addressInput.nativeElement,
        {
          types: ['address'],
          componentRestrictions: { country: 'ar' },
        }
      );

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();

        if (!place.geometry) {
          this.addressValid = false;
          return;
        }

        this.addressValid = true;

        this.form.patchValue({
          address: place.formatted_address,
        });
      });
    }, 300);
  }

  private getValidatorsByType() {
    switch (this.type) {
      case 'value':
      case 'additional_costs':
      case 'rooms':
        return [Validators.required, Validators.pattern(/^\d+$/)];

      case 'tenant':
      case 'name':
      case 'type':
        return [Validators.required];

      case 'address':
        return []; // se valida con el control address

      default:
        return [];
    }
  }

  submit() {
    if (this.type === 'address') {
      if (this.form.get('address')?.invalid || !this.addressValid) {
        this.form.markAllAsTouched();
        return;
      }

      this.save.emit(this.form.value.address);
      return;
    }

    if (this.form.invalid) return;
    this.save.emit(this.form.value.value);
  }

  // Getters útiles para el template
  get address() {
    return this.form.get('address');
  }
}
