import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, ActivatedRoute } from '@angular/router';
import { MessageComponent } from './shared/ui/message/message.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    RouterOutlet,
    MessageComponent
  ],
})
export class AppComponent {
  private router = inject(Router);

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
    // Detectar parámetro de consulta y redirigir
    this.route.queryParams.subscribe(params => {
      const destino = params['destino'];
      if (destino === 'registrarse') {
        this.router.navigate(['/portal/registrarse']);
      } else if (destino === 'ingresar') {
        this.router.navigate(['/portal/ingresar']);
      }
    });
  }
}
