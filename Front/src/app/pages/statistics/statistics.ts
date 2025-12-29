import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, BarElement, LineElement, ArcElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend, Filler, BarController, LineController, PieController } from 'chart.js';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.html',
  styleUrls: ['./statistics.css']
})
export class Statistics implements AfterViewInit {

  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChart') lineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChart') pieChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutChart') doughnutChartRef!: ElementRef<HTMLCanvasElement>;

  constructor(private router: Router) {
    // Registramos todos los elementos y controladores necesarios
    Chart.register(
      BarController,
      LineController,
      PieController,
      BarElement,
      LineElement,
      ArcElement,
      PointElement,
      CategoryScale,
      LinearScale,
      Title,
      Tooltip,
      Legend,
      Filler
    );
  }

  ngAfterViewInit(): void {
    this.createBarChart();
    this.createLineChart();
    this.createPieChart();
    this.createDoughnutChart();
  }

  goToHome() {
    this.router.navigateByUrl('/home');
  }

  private createBarChart() {
    new Chart(this.barChartRef.nativeElement.getContext('2d')!, {
      type: 'bar',
      data: {
        labels: ['Propiedades'],
        datasets: [
          { label: 'Ocupadas', data: [15], backgroundColor: 'rgba(16, 185, 129, 0.8)' },
          { label: 'Libres', data: [5], backgroundColor: 'rgba(248, 113, 113, 0.8)' }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  private createLineChart() {
    new Chart(this.lineChartRef.nativeElement.getContext('2d')!, {
      type: 'line',
      data: {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
        datasets: [{
          label: 'Pagos recibidos ($)',
          data: [1200, 1500, 1000, 1700, 1300],
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          fill: true,
          tension: 0.3
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  private createPieChart() {
    new Chart(this.pieChartRef.nativeElement.getContext('2d')!, {
      type: 'pie',
      data: {
        labels: ['Al día', 'Morosos'],
        datasets: [{
          data: [18, 7],
          backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(248, 113, 113, 0.8)'],
          borderColor: ['white', 'white'],
          borderWidth: 2
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  // 4to grafico
  private createDoughnutChart() {
    new Chart(this.doughnutChartRef.nativeElement.getContext('2d')!, {
      type: 'doughnut',
      data: {
        labels: ['Al día', 'Morosos'],
        datasets: [{
          data: [18, 7],
          backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(248, 113, 113, 0.8)'],
          borderColor: ['white', 'white'],
          borderWidth: 2
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

}
