import { Component } from '@angular/core';
import { Registro } from 'src/app/models/registro';
import { ActivatedRoute } from '@angular/router';
import { RegistrosService } from 'src/app/core/services/registros.service';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent {
  registro!: Registro | null;
  id!: string;

  constructor(
    private route: ActivatedRoute,
    private registroService: RegistrosService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.id = params['id'];
      this.fetchDetails(this.id);
    });
  }

  fetchDetails(id: string) {
    if (id) {
      this.loadRegistro(id);
    } else {
      this.registro = null;
    }
  }

  async loadRegistro(id: string): Promise<void> {
    try {
      const registro = await this.registroService.getRegistro(id);
      this.registro = registro || null;
    } catch (error) {
      this.registro = null;
      console.error('Error fetching registro:', error);
    }
  }
}