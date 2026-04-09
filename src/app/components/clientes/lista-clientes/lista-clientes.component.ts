import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ClienteService, Cliente } from '../../../services/cliente.service';

@Component({
  selector: 'app-lista-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './lista-clientes.component.html',
  styleUrls: ['./lista-clientes.component.css'],
})
export class ListaClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  busqueda: string = '';
  mostrarFormulario: boolean = false;
  clienteEdicion: Cliente | null = null;
  msgError: string = '';
  msgExito: string = '';
  cargando: boolean = false;

  nuevoCliente: Cliente = {
    nombre: '',
    apellido: '',
    tipoIdentificacion: '',
    numeroIdentificacion: '',
    email: '',
    fechaNacimiento: '',
  };

  constructor(
    private clienteService: ClienteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.cargando = true;
    this.msgError = '';
    this.clienteService.obtenerClientes().subscribe({
      next: (data) => {
        this.clientes = data;
        this.clientesFiltrados = data;
        this.cargando = false;
        this.cdr.detectChanges();
        console.log('[ListaClientesComponent] Clientes cargados:', data.length);
      },
      error: (err) => {
        this.msgError =
          'Error al cargar clientes: ' +
          (err.error?.mensaje || err.statusText);
        this.cargando = false;
        this.cdr.detectChanges();
        console.error('[ListaClientesComponent] Error cargando:', err);
      },
    });
  }

  buscar(): void {
    const termino = this.busqueda.toLowerCase();
    this.clientesFiltrados = this.clientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(termino) ||
        c.apellido.toLowerCase().includes(termino) ||
        c.email.toLowerCase().includes(termino) ||
        c.numeroIdentificacion.includes(termino) ||
        (c.id && c.id.includes(termino))
    );
  }

  abrirFormularioCrear(): void {
    this.mostrarFormulario = true;
    this.clienteEdicion = null;
    this.nuevoCliente = {
      nombre: '',
      apellido: '',
      tipoIdentificacion: '',
      numeroIdentificacion: '',
      email: '',
      fechaNacimiento: '',
    };
  }

  abrirFormularioEditar(cliente: Cliente): void {
    this.mostrarFormulario = true;
    this.clienteEdicion = cliente;
    this.nuevoCliente = { ...cliente };
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.clienteEdicion = null;
    this.msgExito = '';
  }

  guardarCliente(): void {
    this.msgError = '';
    this.msgExito = '';

    if (!this.validarFormulario()) {
      this.cdr.detectChanges();
      return;
    }

    if (this.clienteEdicion?.id) {
      // Actualizar
      this.clienteService
        .actualizarCliente(this.clienteEdicion.id, this.nuevoCliente)
        .subscribe({
          next: () => {
            this.msgExito = 'Cliente actualizado exitosamente';
            this.cdr.detectChanges();
            this.cargarClientes();
            this.cerrarFormulario();
          },
          error: (err) => {
            this.msgError =
              'Error al actualizar: ' + (err.error?.mensaje || err.statusText);
            this.cdr.detectChanges();
            console.error('[ListaClientesComponent] Error actualizando:', err);
          },
        });
    } else {
      // Crear
      this.clienteService.crearCliente(this.nuevoCliente).subscribe({
        next: () => {
          this.msgExito = 'Cliente creado exitosamente';
          this.cdr.detectChanges();
          this.cargarClientes();
          this.cerrarFormulario();
        },
        error: (err) => {
          this.msgError =
            'Error al crear: ' + (err.error?.mensaje || err.statusText);
          this.cdr.detectChanges();
          console.error('[ListaClientesComponent] Error creando:', err);
        },
      });
    }
  }

  confirmarEliminar(cliente: Cliente): void {
    if (
      confirm(
        `¿Está seguro de eliminar a ${cliente.nombre} ${cliente.apellido}?`
      )
    ) {
      if (cliente.id) {
        this.clienteService.eliminarCliente(cliente.id).subscribe({
          next: () => {
            this.msgExito = 'Cliente eliminado exitosamente';
            this.cdr.detectChanges();
            this.cargarClientes();
          },
          error: (err) => {
            this.msgError =
              'Error al eliminar: ' + (err.error?.mensaje || err.statusText);
            this.cdr.detectChanges();
            console.error('[ListaClientesComponent] Error eliminando:', err);
          },
        });
      }
    }
  }

  private validarFormulario(): boolean {
    if (!this.nuevoCliente.nombre.trim()) {
      this.msgError = 'El nombre es requerido';
      return false;
    }
    if (!this.nuevoCliente.apellido.trim()) {
      this.msgError = 'El apellido es requerido';
      return false;
    }
    if (!this.nuevoCliente.email.trim()) {
      this.msgError = 'El email es requerido';
      return false;
    }
    if (!this.validarEmail(this.nuevoCliente.email)) {
      this.msgError = 'El email no es válido';
      return false;
    }
    if (!this.nuevoCliente.numeroIdentificacion.trim()) {
      this.msgError = 'El número de identificación es requerido';
      return false;
    }
    if (!this.nuevoCliente.fechaNacimiento) {
      this.msgError = 'La fecha de nacimiento es requerida';
      return false;
    }

    const edad = this.calcularEdad(this.nuevoCliente.fechaNacimiento);
    if (edad < 18) {
      this.msgError = 'El cliente debe ser mayor de 18 años';
      return false;
    }

    return true;
  }

  private validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  private calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const fecha = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const mes = hoy.getMonth() - fecha.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
      edad--;
    }

    return edad;
  }
}
