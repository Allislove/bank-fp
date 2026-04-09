import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Cuenta {
  numeroCuenta?: string;
  tipo: string;
  clienteId: string;
  saldo?: number;
}

@Injectable({
  providedIn: 'root',
})
export class CuentaService {
  private apiUrl = `${environment.apiUrl}/cuentas`;

  constructor(private http: HttpClient) {}

  crearCuenta(cuenta: Cuenta): Observable<Cuenta> {
    console.log('[CuentaService] Creando cuenta:', cuenta);
    return this.http.post<Cuenta>(this.apiUrl, cuenta);
  }

  obtenerCuentasPorCliente(clienteId: string): Observable<Cuenta[]> {
    console.log('[CuentaService] Obteniendo cuentas del cliente:', clienteId);
    return this.http.get<Cuenta[]>(`${this.apiUrl}/cliente/${clienteId}`);
  }

  consultarSaldo(numeroCuenta: string): Observable<{ saldo: number }> {
    console.log('[CuentaService] Consultando saldo de cuenta:', numeroCuenta);
    return this.http.get<{ saldo: number }>(
      `${this.apiUrl}/${numeroCuenta}/saldo`
    );
  }
}
