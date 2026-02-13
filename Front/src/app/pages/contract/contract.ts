import { Component } from '@angular/core';
import { Router } from '@angular/router';
import html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-contract',
  imports: [],
  templateUrl: './contract.html',
  styleUrl: './contract.css',
})
export class Contract {

  constructor(private router: Router) { }

  goToContracts() {
    this.router.navigate(['contracts']);
  }

  downloadPDF() {
    const element = document.getElementById('contract-content');
    if (!element) return;

    const options = {
      margin: 10,
      filename: 'contrato-alquiler.pdf',
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    html2pdf().set(options).from(element).save();
  }

}
