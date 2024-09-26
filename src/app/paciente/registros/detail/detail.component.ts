import { Component, HostListener } from '@angular/core';
import { Registro } from 'src/app/models/registro';
import { ActivatedRoute, Router } from '@angular/router';
import { RegistrosService } from 'src/app/core/services/registros.service';
import { BadgeComponent } from 'src/app/shared/ui/badge/badge.component';
import { ButtonComponent } from 'src/app/shared/ui/button/button.component';
import { LabelComponent } from 'src/app/shared/ui/label/label.component';
import { SwitcherComponent } from 'src/app/shared/ui/switcher/switcher.component';
import { CommonModule, Location } from '@angular/common';
import { DropdownComponent } from 'src/app/shared/ui/dropdown/dropdown.component';
import { ModalComponent } from 'src/app/shared/ui/modal/modal.component';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    BadgeComponent,
    ButtonComponent,
    LabelComponent,
    SwitcherComponent,
    DropdownComponent,
    ModalComponent,
    CommonModule
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
  disabled = false;
  isMobile!: boolean;
  isModalOpen: boolean = false;
  selectedFile?: string;

  categoriaMap: { [key: string]: { icon: string; color: string } } = {
    'Consulta general': { icon: 'user-md', color: '#FD5B71' },
    'Laboratorios': { icon: 'vial', color: '#6DDDFC' },
    'Consulta pediátrica': { icon: 'baby', color: '#A2BDFF' },
    'Vacunación': { icon: 'syringe', color: '#FF9110' },
    'Alergia e Inmunología': { icon: 'allergies', color: '#208AF2' },
    'Cardiología': { icon: 'heart', color: '#1BC5DD' },
  };

  // Función que devuelve un array en lugar del array per-sé
  getMenuItems(data: Registro): { label: string, icon?: string, subItems?: any[], path?: string, disabled: boolean, callback?: () => void } [] {
    return [
      { label: 'Editar', icon: 'user', disabled: false, callback: () => this.navigateToEdit(data) },
      { label: 'Gestionar permisos', icon: 'star', disabled: true },
      { label: 'Eliminar', icon: 'trash', disabled: false, callback: () => this.navigateToDelete(data)  }
    ]
  }

  dropdownPosition = { top: '35px', left: '-190px' };

  constructor(
    private route: ActivatedRoute,
    private registroService: RegistrosService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.id = params['id'];
      this.fetchDetails(this.id);
    });
    this.checkIfMobile(window.innerWidth)
  }

  // Listen for window resize events
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkIfMobile(event.target.innerWidth);
  }

  checkIfMobile(width: number): void {
    this.isMobile = width < 980; 
  }

  generateQRCode(data: any) {
    if (data) {
      const formattedData = 
      `Título: ${data.titulo}\nDescripción: ${data.descripcion}\nFecha: ${data.fecha}\nHora: ${data.hora}\nCategoria: ${data.categoria}\nValidado: ${data.validado}\nEstado: ${data.estado}\nEmisor: ${data.validador}\nAdjuntos: ${data.adjuntos}`;
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

  goBack(): void {
    console.log('Historial:', window.history.length);
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    } 
  }

  navigateToEdit(item: Registro): void {
    this.router.navigate([`/actualizar/${item.id}`]);
  }

  async navigateToDelete(item: Registro): Promise<void> {
      console.log('emitting!');
    try {
      await this.registroService.deleteRegistro(item.id);
      console.log('Registro deleted successfully');
     this.router.navigate(['/']);
    } catch (error) {
      console.error('Error deleting registro', error);
    }
  }

  openModal(file: string): void {
    this.selectedFile = file;
    this.isModalOpen = !this.isModalOpen;
  }

}