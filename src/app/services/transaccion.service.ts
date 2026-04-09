import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Transaccion {
  id?: string;
  tipo: 'CONSIGNACION' | 'RETIRO';
  monto: number;
  numeroCuenta: string;
  descripcion: string;
  fecha?: string;
  saldoAnterior?: number;
  saldoNuevo?: number;
}

@Injectable({
  providedIn: 'root',
})
export class TransaccionService {
  private apiUrl = `${environment.apiUrl}/transacciones`;

  constructor(private http: HttpClient) {}

  registrarTransaccion(transaccion: Transaccion): Observable<Transaccion> {
    console.log('[TransaccionService] Registrando transacción:', transaccion);
    return this.http.post<Transaccion>(this.apiUrl, transaccion);
  }

  obtenerTransaccionesCuenta(numeroCuenta: string): Observable<Transaccion[]> {
    console.log(
      '[TransaccionService] Obteniendo transacciones de cuenta:',
      numeroCuenta
    );
    return this.http.get<Transaccion[]>(
      `${this.apiUrl}/cuenta/${numeroCuenta}`
    );
  }
}
