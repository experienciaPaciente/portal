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

  constructor(
    private route: ActivatedRoute,
    private registroService: RegistrosService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
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
