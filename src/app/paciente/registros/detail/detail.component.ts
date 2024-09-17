import { Component } from '@angular/core';
import { Registro } from 'src/app/models/registro';
import { ActivatedRoute } from '@angular/router';
import { RegistrosService } from 'src/app/core/services/registros.service';
import { BadgeComponent } from 'src/app/shared/ui/badge/badge.component';
import { ButtonComponent } from 'src/app/shared/ui/button/button.component';
import { LabelComponent } from 'src/app/shared/ui/label/label.component';
import { SwitcherComponent } from 'src/app/shared/ui/switcher/switcher.component';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    BadgeComponent,
    ButtonComponent,
    LabelComponent,
    SwitcherComponent
  ],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent {
  registro!: Registro | null;
  id!: string;
  editableIcon!: string;
  editableColor!: string;
  qrCodeUrl?: string;

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
    });
  }

  generateQRCode(data: any) {
    if (data) {
      const formattedData = 
      `Título: ${data.titulo}\nDescripción: ${data.descripcion}\nFecha: ${data.fecha}\nHora: ${data.hora}\nCategoria: ${data.categoria}\nValidado: ${data.validado}\nEstado: ${data.estado}\nEmisor: ${data.emisor}\nAdjuntos: ${data.adjuntos}`;
      const encodedData = encodeURIComponent(formattedData);
      this.qrCodeUrl = `https://quickchart.io/qr?text=${encodedData}`;
    }
  }

  fetchDetails(id: string) {
    if (id) {
      this.loadRegistro(id);
      if (this.registro) {
        this.generateQRCode(this.registro);
      }
    } else {
      this.registro = null;
    }
  }

  async loadRegistro(id: string): Promise<void> {
    try {
      const registro = await this.registroService.getRegistro(id);
      this.registro = registro || null;
      this.generateQRCode(registro);
    } catch (error) {
      this.registro = null;
      console.error('Error fetching registro:', error);
    }
  }

  getIconForCategoria(categoria: string): string {
    return this.categoriaMap[categoria]?.icon || 'question-circle'; // Default icon
  }

  getColorForCategoria(categoria: string): string {
    return this.categoriaMap[categoria]?.color || 'gray'; // Default color
  }

  trackByFn(item: any): any {
    return item.id;
  }
}