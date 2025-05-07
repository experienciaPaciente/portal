import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard, publicGuard } from '../app/core/guards/auth.guards';
import { createRegistroComponent } from './paciente/registros/crear-registro/crear-registro.component';
import { ListComponent } from './paciente/registros/list/list.component';
import { DetailComponent } from './paciente/registros/detail/detail.component';
import { ScanComponent } from './paciente/registros/scan/scan.component';
import SignUpComponent from './paciente/auth/sign-up/sign-up.component';
import LogInComponent from './paciente/auth/sign-in/sign-in.component';

export const routes: Routes = [
  {
    path: '', canActivate: [authGuard],
    loadComponent: () => import('./paciente/home/home.component'),
    children: [
      { path: 'item/:id', component: DetailComponent },
      { path: 'registrar', component: createRegistroComponent },
      { path: 'scan', component: ScanComponent },
      { path: 'registros', component: ListComponent },
      { path: 'actualizar/:id', component: createRegistroComponent },
    ]
  },
  { path: 'registrarse', component: SignUpComponent },
  { path: 'ingresar', component: LogInComponent },
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
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth/sign-up'
  },
  {
    path: '**',
    redirectTo: 'auth/sign-in'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }