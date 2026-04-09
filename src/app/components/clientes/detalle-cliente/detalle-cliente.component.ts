import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClienteService, Cliente } from '../../../services/cliente.service';
import { CuentaService, Cuenta } from '../../../services/cuenta.service';
import { TransaccionService, Transaccion } from '../../../services/transaccion.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-detalle-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './detalle-cliente.component.html',
  styleUrls: ['./detalle-cliente.component.css'],
})
export class DetalleClienteComponent implements OnInit, OnDestroy {
  cliente: Cliente | null = null;
  cuentas: Cuenta[] = [];
  transacciones: Transaccion[] = [];
  msgError: string = '';
  msgExito: string = '';
  cargando: boolean = false;

  cuentaSeleccionada: Cuenta | null = null;
  tipoTransaccion: 'CONSIGNACION' | 'RETIRO' = 'CONSIGNACION';
  monto: number = 0;
  descripcion: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clienteService: ClienteService,
    private cuentaService: CuentaService,
    private transaccionService: TransaccionService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe({
      next: (params) => {
        const clienteId = params['id'];
        this.cargarCliente(clienteId);
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarCliente(clienteId: string): void {
    this.cargando = true;
    this.clienteService
      .obtenerClientePorId(clienteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.cliente = data;
          this.cargarCuentas(clienteId);
          this.cdr.detectChanges();
          console.log(
            '[DetalleClienteComponent] Cliente cargado:',
            data
          );
        },
        error: (err) => {
          this.msgError =
            'Error al cargar cliente: ' +
            (err.error?.mensaje || err.statusText);
          this.cargando = false;
          this.cdr.detectChanges();
          console.error('[DetalleClienteComponent] Error:', err);
        },
      });
  }

  cargarCuentas(clienteId: string): void {
    this.cuentaService
      .obtenerCuentasPorCliente(clienteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.cuentas = data;
          if (data.length > 0) {
            // Intentar mantener la cuenta seleccionada actual
            if (
              this.cuentaSeleccionada?.numeroCuenta &&
              data.find((c) => c.numeroCuenta === this.cuentaSeleccionada?.numeroCuenta)
            ) {
              // Actualizar la cuenta con los nuevos datos (saldo actualizado)
              this.cuentaSeleccionada = data.find(
                (c) => c.numeroCuenta === this.cuentaSeleccionada?.numeroCuenta
              )!;
              this.cargarTransacciones(this.cuentaSeleccionada.numeroCuenta!);
            } else {
              // Si no hay seleccionada o no existe, usar la primera
              this.cuentaSeleccionada = data[0];
              this.cargarTransacciones(data[0].numeroCuenta!);
            }
          }
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.msgError =
            'Error al cargar cuentas: ' +
            (err.error?.mensaje || err.statusText);
          this.cargando = false;
          this.cdr.detectChanges();
          console.error('[DetalleClienteComponent] Error cuentas:', err);
        },
      });
  }

  cargarTransacciones(numeroCuenta: string): void {
    this.transaccionService
      .obtenerTransaccionesCuenta(numeroCuenta)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          // Mostrar solo los últimos 5 movimientos
          this.transacciones = data.slice(0, 5);
          this.cdr.detectChanges();
          console.log(
            '[DetalleClienteComponent] Transacciones cargadas:',
            this.transacciones.length
          );
        },
        error: (err) => {
          console.error(
            '[DetalleClienteComponent] Error transacciones:',
            err
          );
          this.transacciones = [];
          this.cdr.detectChanges();
        },
      });
  }

  alCambiarCuenta(): void {
    if (this.cuentaSeleccionada?.numeroCuenta) {
      this.cargarTransacciones(this.cuentaSeleccionada.numeroCuenta);
    }
  }

  realizarTransaccion(): void {
    this.msgError = '';
    this.msgExito = '';

    if (!this.cuentaSeleccionada?.numeroCuenta) {
      this.msgError = 'Debe seleccionar una cuenta';
      return;
    }

    if (this.monto <= 0) {
      this.msgError = 'El monto debe ser mayor a 0';
      return;
    }

    if (!this.descripcion.trim()) {
      this.msgError = 'La descripción es requerida';
      return;
    }

    const transaccion: Transaccion = {
      tipo: this.tipoTransaccion,
      monto: this.monto,
      numeroCuenta: this.cuentaSeleccionada.numeroCuenta,
      descripcion: this.descripcion,
    };

    this.transaccionService
      .registrarTransaccion(transaccion)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const tipoNombre = this.tipoTransaccion === 'CONSIGNACION' ? 'Consignación' : 'Retiro';
          this.msgExito = `${tipoNombre} registrada exitosamente`;
          this.monto = 0;
          this.descripcion = '';
          this.cdr.detectChanges();

          // Recargar cuentas para actualizar el saldo
          if (this.cliente?.id) {
            this.cargarCuentas(this.cliente.id);
            // También recargar transacciones de la cuenta actual
            if (this.cuentaSeleccionada?.numeroCuenta) {
              setTimeout(() => {
                this.cargarTransacciones(this.cuentaSeleccionada!.numeroCuenta!);
              }, 500);
            }
          }
        },
        error: (err) => {
          this.msgError =
            'Error al registrar transacción: ' +
            (err.error?.mensaje || err.statusText);
          this.cdr.detectChanges();
          console.error('[DetalleClienteComponent] Error transacción:', err);
        },
      });
  }

  volver(): void {
    this.router.navigate(['/clientes']);
  }
}
