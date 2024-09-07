import { Component } from '@angular/core';
import { Registro } from 'src/app/models/registro';
import { ActivatedRoute } from '@angular/router';
import { RegistrosService } from 'src/app/core/services/registros.service';
import { BadgeComponent } from 'src/app/shared/ui/badge/badge.component';
import { ButtonComponent } from 'src/app/shared/ui/button/button.component';
import { LabelComponent } from 'src/app/shared/ui/label/label.component';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [BadgeComponent, ButtonComponent, LabelComponent],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent {
  registro!: Registro | null;
  id!: string;
  editableIcon: string = 'heart';
  editableColor: string = '';

  categoriaMap: { [key: string]: { icon: string; color: string } } = {
    'Consulta general': { icon: 'user-md', color: '#FD5B71' },
    'Laboratorios': { icon: 'vial', color: '#6DDDFC' },
    'Consulta pediátrica': { icon: 'baby', color: '#A2BDFF' },
    'Vacunación': { icon: 'syringe', color: '#FF9110' },
    'Alergia e Inmunología': { icon: 'allergies', color: '#208AF2' },
    'Cardiología': { icon: 'heart', color: '#1BC5DD' },
  };

  constructor(
    private route: ActivatedRoute,
    private registroService: RegistrosService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.id = params['id'];
      this.fetchDetails(this.id);
      this.getCategory(this.id);
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

  getCategory(id: string) {
    const categoria = this.registro?.categoria;
    if (categoria) {
      const { icon, color } = this.categoriaMap[categoria];
      this.editableIcon = icon;
      this.editableColor = color;
    }
  }
}