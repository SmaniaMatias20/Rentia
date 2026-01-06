import { Component, NgZone } from '@angular/core';
import { PropertyService } from '../../services/property/property';
import { ActivatedRoute, Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { DatePipe } from '@angular/common';
import { Spinner } from '../../components/spinner/spinner';
import { environment } from '../../../environments/environment';


declare var google: any;

@Component({
  selector: 'app-property',
  imports: [NgClass, DatePipe, Spinner],
  templateUrl: './property.html',
  styleUrl: './property.css',
})
export class Property {
  loading = false;
  propertyData: any;
  map!: any;
  marker!: any;

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
    const initialPosition = { lat: -34.6037, lng: -58.3816 }; // Buenos Aires

    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    this.map = new google.maps.Map(mapElement, {
      center: initialPosition,
      zoom: 13,
      disableDefaultUI: true, // opcional (más limpio)
    });

    // 📍 marcador inicial
    this.setMarker(initialPosition);

    // 🖱️ click para mover marcador
    // this.map.addListener('click', (event: any) => {
    //   this.ngZone.run(() => this.setMarker(event.latLng));
    // });
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


}
