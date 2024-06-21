import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/ui/navbar/navbar.component';
import { HeaderComponent } from './shared/ui/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, HeaderComponent, NavbarComponent],
})
export class AppComponent {
  title = 'portal-paciente';
  imgSrc = './assets/img/xp__picto.png'


  buttons = [
    {
      icon: 'heart',
      label: 'opcion A',
      path: 'inicio'
    },
    {
      icon: 'user',
      label: 'opcion B',
      path: 'registrar'
    },
    {
      icon: 'file-pdf',
      label: 'opcion C',
      path: 'auth/sign-in'
    },
    {
      icon: 'file',
      label: 'opcion D',
      path: 'auth/sign-up'
    }
  ]
}
