import { Component, ViewChild, Output, EventEmitter, AfterViewInit, ElementRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Toast } from '../../../../components/toast/toast';
import { AuthService } from '../../../../services/auth/auth';
import { PropertyService } from '../../../../services/property/property';
import { environment } from '../../../../../../src/environments/environment';

declare var google: any;

@Component({
  selector: 'app-form-property',
  imports: [Toast, ReactiveFormsModule],
  templateUrl: './form-property.html',
  styleUrls: ['./form-property.css'],
})
export class FormProperty implements AfterViewInit {
  @ViewChild('toast') toast!: Toast;
  @ViewChild('addressInput') addressInput!: ElementRef;
  propertyForm: FormGroup;
  submitting = false;
  addressValid = false;
  @Output() closeForm = new EventEmitter<void>();
  @Output() createProperty = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private property: PropertyService,
  ) {
    // Inicializamos el formulario reactivo
    this.propertyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      value: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      additional_costs: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    });
  }

  // Getters para acceder a los controles desde el template
  get name() { return this.propertyForm.get('name'); }
  get address() { return this.propertyForm.get('address'); }
  get value() { return this.propertyForm.get('value'); }
  get additional_costs() { return this.propertyForm.get('additional_costs'); }

  // Guardar propiedad
  async submit() {
    if (this.propertyForm.invalid || !this.addressValid) {
      this.propertyForm.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const currentUser = await this.auth.getCurrentUser();
    if (!currentUser) {
      this.toast.showToast('No hay usuario logueado', 'error');
      this.submitting = false;
      return;
    }

    const user_id = currentUser.id;
    const { name, address, value, additional_costs } = this.propertyForm.value;

    const { error } = await this.property.createProperty({ user_id, name, address, value, additional_costs });

    if (error) {
      this.toast.showToast('Error al guardar la propiedad', 'error');
      this.submitting = false;
      return;
    }

    this.toast.showToast('Propiedad creada correctamente', 'success');
    this.propertyForm.reset();
    this.submitting = false;

    setTimeout(() => {
      this.createProperty.emit();
      this.close();
    }, 3000);
  }

  close() {
    this.propertyForm.reset();
    this.closeForm.emit();
  }

  ngAfterViewInit() {
    this.loadGoogleMaps()
      .then(() => {
        const input: HTMLInputElement = this.addressInput.nativeElement;

        // ✅ Verifica que exista google.maps.places
        if (!(window as any).google?.maps?.places) {
          console.error('Google Maps Places API no cargó correctamente.');
          return;
        }

        // Usamos siempre el Autocomplete clásico
        const autocomplete = new google.maps.places.Autocomplete(input, {
          types: ['address'],
          componentRestrictions: { country: 'ar' },
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();

          if (!place.geometry) {
            this.addressValid = false;
            return;
          }

          this.addressValid = true;
          this.propertyForm.patchValue({
            address: place.formatted_address,
          });
        });
      })
      .catch(err => {
        console.error('Error cargando Google Maps:', err);
      });
  }


  loadGoogleMaps(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).google?.maps?.places) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.apiMaps}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;

      script.onload = () => resolve();
      script.onerror = () => reject('Google Maps failed to load');

      document.body.appendChild(script);
    });
  }





}
