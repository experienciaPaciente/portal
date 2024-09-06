import { Component, Input, OnInit, inject, HostListener } from '@angular/core';
import { LabelComponent } from '../label/label.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { ButtonComponent } from '../button/button.component';
import { Auth, authState } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ButtonComponent, LabelComponent, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  isMobile = false;
  loggedUser = true;
  email: string | null = null;
  name: string | null = null;
  private auth: Auth = inject(Auth);
  readonly authState$ = authState(this.auth);
  @Input() imgBrand: String = '';
  location: any;

  // Listen for window resize events
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkIfMobile(event.target.innerWidth);
  }

  ngOnInit(): void {
    this.authState$.subscribe(user => {
      if (user) {
        this.email = user.email;
        this.name = user.displayName;
      } else {
        this.email = null;
        this.name = 'Usuario';
      }
    });

    this.checkIfMobile(window.innerWidth);
  }

  checkIfMobile(width: number): void {
    this.isMobile = width < 768; 
  }
  
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

  goBack() {
    this.location.back(); // Angular's Location service to navigate back
  }
  
}
