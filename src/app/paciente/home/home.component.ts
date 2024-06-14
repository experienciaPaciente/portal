import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { createRegistroComponent } from '../registros/crear-registro/crear-registro.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    createRegistroComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export default class HomeComponent {
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
