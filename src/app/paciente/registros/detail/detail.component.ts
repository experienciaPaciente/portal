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
import { NotificationService } from './../../../core/services/mensajes.service';

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
  modalDelete: boolean = false;
  selectedFile?: string;
  selectedItemId: string | null = null;
  displayFileName: string = '';


  categoriaMap: { [key: string]: { icon: string; color: string } } = {
    'Acción médica': { icon: 'user-nurse', color: '#00bcd4' },             
    'Alteración de la salud': { icon: 'person-dots-from-line', color: '#ff5722' }, 
    'Atención virtual': { icon: 'laptop-medical', color: '#00bcd4' },
    'Consulta de salud': { icon: 'hand-holding-medical', color: '#17a2b8' },               
    'Consulta ginecológica': { icon: 'venus', color: '#e83e8c' },              
    'Consulta odontológica': { icon: 'tooth', color: '#d3d3d3' },              
    'Consulta pediátrica': { icon: 'child', color: '#F5C451' },               
    'Control de salud': { icon: 'notes-medical', color: '#17a2b8' },               
    'Dispositivo': { icon: 'crutch', color: '#6c757d' },                     
    'Emergencia médica': { icon: 'square-h', color: '#f44336' },
    'Estudios por imagen': { icon: 'x-ray', color: '#00bcd4' },
    'Internación': { icon: 'bed-pulse', color: '#212529' },
    'Laboratorio': { icon: 'flask', color: '#8e44ad' },
    'Medicamento': { icon: 'pills', color: '#6f42c1' },         
    'Prescripción': { icon: 'file-medical', color: '#007bff' },
    'Salud mental': { icon: 'comments', color: '#20c997' },
    'Sesión kinesiológica': { icon: 'dumbbell', color: '#20c997' },
    'Tratamiento': { icon: 'hand-holding-heart', color: '#20c997' },                 
    'Turno': { icon: 'calendar-day', color: '#28a745' },                     
    'Vacuna': { icon: 'syringe', color: '#00bcd4' },
    'Cardiología': { icon: 'heart', color: '#dc3545' },
    'Dermatología': { icon: 'hand-dots', color: '#fd7e14' }
  };  

  getMenuItems(data: Registro): { label: string, icon?: string, subItems?: any[], path?: string, disabled: boolean, callback?: () => void } [] {
    return [
      { label: 'Editar', icon: 'pencil', disabled: false, callback: () => this.navigateToEdit(data) },
      { label: 'Gestionar permisos', icon: 'star', disabled: true },
      { label: 'Eliminar', icon: 'trash', disabled: false, 
        callback: (event?: MouseEvent) => {
          this.openDeleteModal(event);
      },
    }
    ]
  }

  dropdownPosition = { top: '35px', left: '-190px' };

  constructor(
    private route: ActivatedRoute,
    private registroService: RegistrosService,
    private router: Router,
    private location: Location,
    private notificationService: NotificationService
  ) {}

  // Notificaciones
  triggerSuccess() {
    this.notificationService.addNotification('Registro eliminado con éxito!', 'danger');
  }

  triggerError() {
    this.notificationService.addNotification('Error al generar el registro', 'warning');
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.id = params['id'];
      if (this.id) {
        this.fetchDetails(this.id);
      } else {
        console.error('ID no localizado');
      }
    });
    this.checkIfMobile(window.innerWidth)
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkIfMobile(event.target.innerWidth);
  }

  checkIfMobile(width: number): void {
    this.isMobile = width < 768; 
  }

  generateQRCode(data: any) {
    if (data) {
      const formattedData = 
      `Título: ${data.titulo}\nDescripción: ${data.descripcion}\nFecha: ${data.fecha}\nHora: ${data.hora}\nCategoria: ${data.categoria}\nValidado: ${data.validado}\nEstado: ${data.estado}\nEmisor: ${data.validador}\nAdjuntos: ${data.adjuntos}`;
      const encodedData = encodeURIComponent(formattedData);
      this.qrCodeUrl = `https://quickchart.io/qr?text=${encodedData}`;
    }
  }

  async fetchDetails(id: string) {
    if (id) {
      try {
        await this.loadRegistro(id); 
        if (this.registro) {
          this.generateQRCode(this.registro);
        }
      } catch (error) {
        console.error('Error al cargar registro:', error);
        this.registro = null; 
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
      console.error('Error recuperando registro:', error);
    }
  }

  getFileName(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/');
      const filename = pathSegments[pathSegments.length - 1];
      return filename.includes('_') ? filename.split('_').slice(1).join('_') : filename;
    } catch {
      return 'Archivo adjunto';
    }
  }

  getIconForCategoria(categoria: string): string {
    return this.categoriaMap[categoria]?.icon || 'question-circle';
  }

  getColorForCategoria(categoria: string): string {
    return this.categoriaMap[categoria]?.color || 'gray';
  }

  trackByFn(item: any): any {
    return item.id;
  }

  goBack(): void {
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
    try {
      await this.registroService.deleteRegistro(item.id);
     this.router.navigate(['/']);
    } catch (error) {
      console.error('Error eliminando registro', error);
    }
  }

  openDeleteModal(event: MouseEvent | undefined) {
    event?.stopPropagation();
    this.modalDelete = true; 
  }

  openModal(file: string): void {
    this.selectedFile = file;
    try {
      const urlObj = new URL(file);
      const pathSegments = urlObj.pathname.split('/');
      const filename = pathSegments[pathSegments.length - 1];
      this.displayFileName = filename.includes('_') ? 
        filename.split('_').slice(1).join('_') : filename;
    } catch {
      this.displayFileName = 'Archivo adjunto';
    }
    this.isModalOpen = !this.isModalOpen;
  }

  async onConfirm(): Promise<void> {
    const itemId = this.id;

    if (itemId) {
      try {
        this.modalDelete = false;
        await this.registroService.deleteRegistro(itemId);
        this.router.navigate(['/']);
        this.triggerSuccess();
      } catch (error) {
        this.triggerError();
      }
    }
  }
}
