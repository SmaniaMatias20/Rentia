import { Component } from '@angular/core';
import { PropertyService } from '../../services/property/property';
import { ActivatedRoute } from '@angular/router';
import { NgClass } from '@angular/common';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-property',
  imports: [NgClass, DatePipe],
  templateUrl: './property.html',
  styleUrl: './property.css',
})
export class Property {

  propertyData: any;  // <-- variable para los datos

  constructor(
    private propertyService: PropertyService,
    private route: ActivatedRoute
  ) { }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('id:', id);

    this.propertyData = await this.propertyService.getProperty(id);
    console.log('propertyData:', this.propertyData);
  }

}
