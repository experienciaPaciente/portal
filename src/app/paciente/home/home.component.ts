import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { createRegistroComponent } from '../registros/crear-registro/crear-registro.component';
import { ScanComponent } from '../registros/scan/scan.component';
import { ListComponent } from '../registros/list/list.component';
import { NavbarComponent } from './../../shared/ui/navbar/navbar.component';
import { HeaderComponent } from './../../shared/ui/header/header.component';
import { LabelComponent } from 'src/app/shared/ui/label/label.component';
import { CardComponent } from 'src/app/shared/ui/card/card.component';
import { ButtonComponent } from 'src/app/shared/ui/button/button.component';
import { BadgeComponent } from 'src/app/shared/ui/badge/badge.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    createRegistroComponent,
    ListComponent,
    ScanComponent,
    RouterOutlet, HeaderComponent, NavbarComponent,
    CardComponent,
    LabelComponent,
    ButtonComponent,
    BadgeComponent,
    CommonModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export default class HomeComponent {
  title = 'portal-paciente';
  imgSrc = './assets/img/experienciaPaciente__logo--h.svg';
  isMobile! : boolean;
  isDetailView: boolean = false;
  isRegistroView: boolean = false;
  isScanView  : boolean = false;

  constructor(private router: Router) {}

  // Listen for window resize events
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkIfMobile(event.target.innerWidth);
  }

  ngOnInit(): void {
    
  // Subscribe to routing events
  this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd) {
      const url = event.url;
      
      this.isDetailView = url.includes('/item/');
      
      this.isRegistroView = url.includes('/registrar');
      
      this.isScanView = url.includes('/scan');
    }
  });
    this.checkIfMobile(window.innerWidth);
  }

  checkIfMobile(width: number): void {
    this.isMobile = width < 768;
    this.updateViewState(this.router.url);
  }

  // Checkear funcionamiento
  updateViewState(url: string): void {
    this.isDetailView = url.includes('/item/');
    this.isRegistroView = url.includes('/registrar');
    this.isScanView = url.includes('/scan');
  }
}