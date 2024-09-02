import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { createRegistroComponent } from '../registros/crear-registro/crear-registro.component';
import { ListComponent } from '../registros/list/list.component';
import { NavbarComponent } from './../../shared/ui/navbar/navbar.component';
import { HeaderComponent } from './../../shared/ui/header/header.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    createRegistroComponent,
    ListComponent,
    RouterOutlet, HeaderComponent, NavbarComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export default class HomeComponent {
  title = 'portal-paciente';
  imgSrc = './assets/img/experienciaPaciente__logo--h.svg'

  isDetailView: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isDetailView = event.url.includes('/item/');
      }
    });
  }


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
      path: '/auth/sign-in'
    },
    {
      icon: 'file',
      label: 'opcion D',
      path: '/auth/sign-up'
    }
  ]

  private _router = inject(Router);

  private authservice = inject(AuthService);

  async logOut(): Promise<void> {
    try {
      await this.authservice.logOut();
      this._router.navigateByUrl('/auth/sign-in');
    } catch (error) {
      console.log(error);
    }
  }
  
}
