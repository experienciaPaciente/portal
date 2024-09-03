import { Component, Input, OnInit, inject } from '@angular/core';
import { LabelComponent } from '../label/label.component';
import { ButtonComponent } from '../button/button.component';
import { Auth, authState } from '@angular/fire/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ButtonComponent, LabelComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  loggedUser = true;
  email: string | null = null;
  name: string | null = null;
  private auth: Auth = inject(Auth);
  readonly authState$ = authState(this.auth);
  @Input() imgBrand: String = '';

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
  }
}
