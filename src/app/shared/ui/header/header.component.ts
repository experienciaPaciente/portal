import { Component, Input, OnInit, inject, HostListener } from '@angular/core';
import { LabelComponent } from '../label/label.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { ButtonComponent } from '../button/button.component';
import { Auth, authState } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { DropdownComponent } from '../dropdown/dropdown.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ButtonComponent, LabelComponent, CommonModule, DropdownComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  @Input() imgBrand: String = '';

  isMobile = false;
  loggedUser = true;
  email: string | null = null;
  name: string | null = null;
  private auth: Auth = inject(Auth);
  readonly authState$ = authState(this.auth);
  private _router = inject(Router);
  private authservice = inject(AuthService);

  menuItems = [
    { label: 'Item 1', icon: 'user', route: '/path-to-item1' },
    { label: 'Item 2', icon: 'user', route: '/path-to-item2' },
    { label: 'Item 3', icon: 'user', subItems: [
        { label: 'Sub-item 1', route: '/path-to-subitem1' },
        { label: 'Sub-item 2', route: '/path-to-subitem2' }
    ]}
  ];

  dropdownPosition = { top: '50px', left: '0' };

  constructor(  
    private router: Router,
    private location: Location
  ) {}
 
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

  async logOut(): Promise<void> {
    try {
      await this.authservice.logOut();
      this._router.navigateByUrl('/auth/sign-in');
    } catch (error) {
      console.log(error);
    }
  }

  goBack(): void {
    console.log('History length:', window.history.length);
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    } 
  }
  
}
