import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/ui/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, NavbarComponent],
})
export class AppComponent {
  title = 'portal-paciente';

  buttons = [
    {
      icon: 'heart',
      label: 'opcion A'
    },
    {
      icon: 'user',
      label: 'opcion B'
    },
    {
      icon: 'file-pdf',
      label: 'opcion C'
    },
    {
      icon: 'file',
      label: 'opcion D'
    }
  ]
}
