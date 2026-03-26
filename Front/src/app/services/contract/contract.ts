import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContractService {

  private API_URL = 'http://localhost:3000/contracts';

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<any[]>(`${this.API_URL}`);
  }

  async createContract(contract: any) {
    const response = await firstValueFrom(this.http.post(`${this.API_URL}/create`, contract));
    return response;
  }

  async getContractsByUser(userId: string, filter: string = 'all') {
    const response = await firstValueFrom(this.http.get<any[]>(
      `${this.API_URL}/user/${userId}?filter=${filter}`
    ));
    return response;
  }

  async deleteContract(id: string) {
    const response = await firstValueFrom(this.http.delete(`${this.API_URL}/${id}`));
    return response;
  }

  async updateContractStatus(id: string, status: boolean) {
    const response = await firstValueFrom(this.http.put(`${this.API_URL}/status/${id}`, { status }));
    return response;
  }
}
