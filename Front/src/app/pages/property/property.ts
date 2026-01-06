import { Component, NgZone } from '@angular/core';
import { PropertyService } from '../../services/property/property';
import { ActivatedRoute, Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { Spinner } from '../../components/spinner/spinner';
import { environment } from '../../../environments/environment';
import { FormEditProperty } from './components/form-edit-property/form-edit-property';


declare var google: any;
type EditType = 'value' | 'additional_costs' | 'address' | 'tenant' | 'name';

@Component({
  selector: 'app-property',
  imports: [NgClass, Spinner, FormEditProperty],
  templateUrl: './property.html',
  styleUrl: './property.css',
})
export class Property {
  loading = false;
  propertyData: any;
  map!: any;
  marker!: any;
  formEditProperty = false;
  editType!: any;
  editValue: any;

  constructor(
    private propertyService: PropertyService,
    private route: ActivatedRoute,
    private router: Router,
    private ngZone: NgZone,
  ) { }

  async ngOnInit() {
    try {
      this.loading = true;

      const id = this.route.snapshot.paramMap.get('id');
      this.propertyData = await this.propertyService.getProperty(id);

      await this.loadMapScript();

      // ⏱️ esperar a que Angular pinte el DOM
      setTimeout(() => {
        this.initMap();
      }, 0);

      this.loading = false;
    } catch (error) {
      console.error(error);
      this.loading = false;
    }
  }


  ngOnDestroy() {
    if (this.map) google.maps.event.clearInstanceListeners(this.map);
  }

  goToProperties() {
    this.router.navigateByUrl('/properties');
  }

  loadMapScript(): Promise<void> {
    return new Promise((resolve) => {
      if (document.getElementById('google-maps-script')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-maps-script';

      // 👇 usás la API Key desde environment
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.apiMaps}&libraries=places`;

      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  }

  initMap() {
    const fallbackPosition = { lat: -34.6037, lng: -58.3816 }; // Buenos Aires

    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    this.map = new google.maps.Map(mapElement, {
      center: fallbackPosition,
      zoom: 13,
      disableDefaultUI: true,
    });

    // 📍 Si hay dirección, la geocodificamos
    if (this.propertyData?.address) {
      this.geocodeAddress(this.propertyData.address);
    } else {
      // fallback
      this.setMarker(fallbackPosition);
    }
  }

  geocodeAddress(address: string) {
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;

        this.map.setCenter(location);
        this.map.setZoom(16);

        this.setMarker(location);
      } else {
        console.warn('No se pudo geocodificar la dirección:', address);
      }
    });
  }

  setMarker(position: any) {
    // Si ya existe un marcador, lo movemos
    if (this.marker) {
      this.marker.setPosition(position);
      return;
    }

    // Si no existe, lo creamos
    this.marker = new google.maps.Marker({
      position,
      map: this.map,
      animation: google.maps.Animation.DROP,
    });
  }

  openEdit(type: EditType, value: any) {
    this.editType = type;
    this.editValue = value;
    this.formEditProperty = true;
  }

  closeformEditProperty() {
    this.formEditProperty = false;
  }


  async onSave(newValue: any) {
    try {
      // this.loading = true;

      // await this.propertyService.updateProperty(
      //   this.propertyData.id,
      //   { [this.editType]: newValue }
      // );

      // // actualizar UI sin recargar
      // this.propertyData[this.editType] = newValue;

      // // si se editó la dirección, actualizar mapa
      // if (this.editType === 'address') {
      //   this.geocodeAddress(newValue);
      // }

      this.closeformEditProperty();
    } catch (error) {
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

}
