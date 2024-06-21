import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { publicGuard } from '../app/core/guards/auth.guards';
import { createRegistroComponent } from './paciente/registros/crear-registro/crear-registro.component';
import { ListComponent } from './paciente/registros/list/list.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./paciente/home/home.component')
  },
  {
    path: 'inicio',
    loadComponent: () => import('./paciente/home/home.component')
  },
  {
    path: 'registrar', component: createRegistroComponent
  },
  {
    path: 'registros', component: ListComponent
  },
  {
    path: 'auth',
    canActivate: [publicGuard],
    children: [
      {
        path: 'sign-in', loadComponent: () => import('./paciente/auth/sign-in/sign-in.component').then(m => m.default),
      },
      {
        path: 'sign-up', loadComponent: () => import('./paciente/auth/sign-up/sign-up.component').then(m => m.default),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
