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
  title = 'portal';
  imgSrc = './assets/img/ep__marca--row.svg';
  isMobile: boolean = false;
  currentView: 'list' | 'detail' | 'registrar' | 'scan' | 'update' = 'list';

  constructor(private router: Router) {}
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkIfMobile(event.target.innerWidth);
  }

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.determineCurrentView(event.url);
      }
    });
    this.checkIfMobile(window.innerWidth);
  }

  checkIfMobile(width: number): void {
    this.isMobile = width < 768;
  }

  determineCurrentView(url: string): void {
    if (url.includes('/item/')) {
      this.currentView = 'detail';
    } else if (url.includes('/registrar')) {
      this.currentView = 'registrar';
    } else if (url.includes('/scan')) {
      this.currentView = 'scan';
    } else if (url.includes('/actualizar/')) {
      this.currentView = 'update';
    } else {
      this.currentView = 'list';
    }
  }

  shouldShowPanel(panel: 'list' | 'detail' | 'registrar' | 'scan' | 'update'): boolean {
    return this.isMobile ? this.currentView === panel : true;
  }

  shouldShowMainPanel(): boolean {
    return this.isMobile ? this.currentView !== 'list' : true;
  }
}
