import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormContract } from './components/form-contract/form-contract';
import { ContractService } from '../../services/contract/contract';
import { AuthService } from '../../services/auth/auth';
import { Spinner } from '../../components/spinner/spinner';
import { Toast } from '../../components/toast/toast';
import { TableContracts } from './components/table-contracts/table-contracts';

@Component({
  selector: 'app-contracts',
  imports: [FormContract, Spinner, Toast, TableContracts],
  templateUrl: './contracts.html',
  styleUrl: './contracts.css',
})
export class Contracts {
  formContract = false;
  contracts: any[] = [];
  currentUser: any;
  loading = false;
  @ViewChild('toast') toast!: Toast;

  constructor(private router: Router, private contract: ContractService, private auth: AuthService) {
  }

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    this.loadContracts();
  }

  async loadContracts() {
    try {
      if (!this.currentUser) return;
      this.loading = true;
      this.contracts = await this.contract.getContractsByUser(this.currentUser.id);
      this.toast.showToast('Contratos cargados correctamente', 'success');
      this.loading = false;
    } catch (error) {
      console.error('Error al cargar contratos:', error);
      this.toast.showToast('Error al cargar contratos', 'error');
      this.loading = false;
    }
  }

  goToHome() {
    this.router.navigateByUrl('/home');
  }

  openFormContract() {
    this.formContract = true;
  }

}
