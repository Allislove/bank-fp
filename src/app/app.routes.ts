import { Routes } from '@angular/router';
import { ListaClientesComponent } from './components/clientes/lista-clientes/lista-clientes.component';
import { DetalleClienteComponent } from './components/clientes/detalle-cliente/detalle-cliente.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'clientes',
    pathMatch: 'full',
  },
  {
    path: 'clientes',
    component: ListaClientesComponent,
  },
  {
    path: 'cliente/:id',
    component: DetalleClienteComponent,
  },
];
