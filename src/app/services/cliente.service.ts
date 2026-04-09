import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Cliente {
  id?: string;
  nombre: string;
  apellido: string;
  tipoIdentificacion: string;
  numeroIdentificacion: string;
  email: string;
  fechaNacimiento: string;
}

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private apiUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  crearCliente(cliente: Cliente): Observable<Cliente> {
    console.log('[ClienteService] Creando cliente:', cliente);
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }

  obtenerClientes(): Observable<Cliente[]> {
    console.log('[ClienteService] Obteniendo listado de clientes');
    return this.http.get<Cliente[]>(this.apiUrl);
  }

  obtenerClientePorId(id: string): Observable<Cliente> {
    console.log('[ClienteService] Obteniendo cliente:', id);
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  actualizarCliente(id: string, cliente: Cliente): Observable<Cliente> {
    console.log('[ClienteService] Actualizando cliente:', id);
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, cliente);
  }

  eliminarCliente(id: string): Observable<void> {
    console.log('[ClienteService] Eliminando cliente:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
