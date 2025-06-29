import { Component, OnInit, inject, Input, HostListener } from '@angular/core';
import { ItemComponent } from 'src/app/shared/ui/item/item.component';
import { LabelComponent } from 'src/app/shared/ui/label/label.component';
import { RegistrosService } from 'src/app/core/services/registros.service';
import { Registro } from 'src/app/models/registro';
import { Auth, authState } from '@angular/fire/auth';
import { Observable, map, startWith, combineLatest, of, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardComponent } from 'src/app/shared/ui/card/card.component';
import { BadgeComponent } from 'src/app/shared/ui/badge/badge.component';
import { ButtonComponent } from 'src/app/shared/ui/button/button.component';
import { NavbarComponent } from 'src/app/shared/ui/navbar/navbar.component';
import { DropdownComponent } from 'src/app/shared/ui/dropdown/dropdown.component';
import { FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalComponent } from 'src/app/shared/ui/modal/modal.component';
import { NotificationService } from './../../../core/services/mensajes.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    ItemComponent,
    LabelComponent,
    CommonModule,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
    NavbarComponent,
    DropdownComponent,
    ReactiveFormsModule,
    ModalComponent
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {

  registro!: Registro[];
  registros$!: Observable<Registro[]>;
  loggedUser = true;
  isMobile!: boolean;
  email: string | null = null;
  name: string | null = null;
  filteredRegistros$!: Observable<Registro[]>;
  searchControl = new FormControl('');
  selectedCategory: string = '';
  medCategories!: boolean;
  selectedItemId: string | null = null;
  isModalOpen: boolean = false;
  // Store selected item for deletion
  itemToDelete: Registro | null = null;

  onCardSelected(data: { id: string }) {
    this.selectedItemId = data.id;
  }

  private auth: Auth = inject(Auth);
  readonly authState$ = authState(this.auth);
  
  @Input() type?: 'flex' | 'grid' = 'flex';
  @Input() direction?: 'horizontal' | 'vertical' = 'horizontal';

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

  // Función que devuelve un array en lugar del array per-sé
  getMenuItems(data: Registro): { label: string, icon?: string, subItems?: any[], path?: string, disabled: boolean, callback?: (event?: MouseEvent) => void } [] {
    return [
      { label: 'Ver detalle', icon: 'file-lines', disabled: false, callback: () => this.onItemSelected(data) },
      { label: 'Editar', icon: 'pencil', disabled: false, callback: () => this.navigateToEdit(data) },
      { label: 'Destacar', icon: 'star', disabled: true },
      { label: 'Gestionar permisos', icon: 'user-lock', disabled: true },
      { label: 'Asociar a registro', icon: 'link', disabled: true },
      { label: 'Eliminar', icon: 'trash', disabled: false, callback: (event?: MouseEvent) => this.openModal(event, data) }
    ]
  }

  getRegistroOptions(item: void): { label: string, icon?: string, subItems?: any[], path?: string, disabled: boolean, callback?: () => void } [] {
    return [
      { label: 'Registro manual', icon: 'file-lines', path: '/registrar', disabled: false },
      { label: 'Registro QR', icon: 'qrcode', path: '/scan', disabled: false },
    ]
  }
  
  dropdownPosition = { top: '35px', left: '-170px' };
  splitButtonPosition = { top: '45px', left: '-160px' };

  categoriaItems = Object.keys(this.categoriaMap).map(key => {
    return {
      label: key,
      icon: this.categoriaMap[key].icon,
      color: this.categoriaMap[key].color,
      path: `/categories/${key}`,
      selectable: false,
    };
  });

  constructor(
    private registroService: RegistrosService, 
    private router: Router,
    private notificationService: NotificationService
  ) {}

  // Notificaciones
  triggerSuccess() {
    this.notificationService.addNotification('Registro eliminado!', 'danger');
  }

  triggerError() {
    this.notificationService.addNotification('Error al eliminar registro', 'warning');
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

    this.authState$.subscribe(user => {
      if (user) {
        this.registros$ = this.authState$.pipe(
          switchMap((user) => {
            if (user) {
              return this.registroService.getRegistrosByUserId(user.uid).pipe(
                map(registros => registros.sort((a, b) => {
                  const dateA = new Date(a.fecha);
                  const dateB = new Date(b.fecha);
                  return dateB.getTime() - dateA.getTime();
                })),
                startWith([])
              );
            }
            return of([]);
          })
        );        
        
        this.filteredRegistros$ = combineLatest([
          this.searchControl.valueChanges.pipe(startWith('')),
          this.registros$,
        ]).pipe(
          map(([searchTerm, registros]) =>
            registros.filter(registro =>
              registro.titulo.toLowerCase().includes((searchTerm ?? '').toLowerCase()) &&
              (this.selectedCategory === '' || registro.categoria === this.selectedCategory)
            )
            .sort((a, b) => {
              const dateA = new Date(a.fecha);
              const dateB = new Date(b.fecha);
              return dateB.getTime() - dateA.getTime();
            })
          )
        );
      }
    });
    
    this.checkIfMobile(window.innerWidth);
  }

  // Listen for window resize events
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkIfMobile(event.target.innerWidth);
  }

  checkIfMobile(width: number): void {
    this.isMobile = width < 768; 
  }

  onItemSelected(item: Registro): void {
    this.router.navigate([`/item/${item.id}`]);
  }

  navigateToEdit(item: Registro): void {
    this.router.navigate([`/actualizar/${item.id}`]);
  }

  async navigateToDelete(item: Registro): Promise<void> {
    try {
      await this.registroService.deleteRegistro(item.id);
    } catch (error) {
      console.error('Error deleting registro', error);
    }
  }

 // Search & filter
  onCategorySelected(category: string): void {
    this.selectedCategory = category;
    this.filteredRegistros$ = this.filterRegistros(this.searchControl.value || '', this.selectedCategory);
  }

  filterRegistros(searchTerm: string, category: string): Observable<Registro[]> {
    const term = searchTerm.toLowerCase() || '';
    return this.registros$.pipe(
      map(registros => registros
        .filter(registro =>
          registro.titulo.toLowerCase().includes(term) &&
          (category === '' || registro.categoria === category)
        )
        // Cambiar ordenamiento alfabético por cronológico
        .sort((a, b) => {
          const dateA = new Date(a.fecha);
          const dateB = new Date(b.fecha);
          return dateB.getTime() - dateA.getTime();
        })
      )
    );
  }

  formatDate(date: Date): string {
    if (!date) return '';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - dateObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    
    return dateObj.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }

  getIconForCategoria(categoria: string): string {
    return this.categoriaMap[categoria]?.icon || 'question-circle';
  }

  getColorForCategoria(categoria: string): string {
    return this.categoriaMap[categoria]?.color || 'gray';
  }

  trackByFn(index: number, item: Registro): string {
    return item.id;
  }

  showMedCategories(event: any) {
    this.medCategories = !this.medCategories;
  }

  // Open the modal and store the item
  openModal(event: MouseEvent | undefined, item: Registro) {
    event?.stopPropagation();
    this.selectedItemId = item.id;
    // Store the actual item for deletion
    this.itemToDelete = item;
    this.isModalOpen = true;
  }
  
  // Handle the confirm action
  async onConfirm(): Promise<void> {
    this.isModalOpen = false;
    
    if (this.itemToDelete) {
      try {
        await this.registroService.deleteRegistro(this.itemToDelete.id);
        this.triggerSuccess();
      } catch (error) {
        this.triggerError();
      } finally {
        this.itemToDelete = null;
        this.selectedItemId = null;
      }
    }
  }
  
  // Close modal without action
  onCancel(): void {
    this.isModalOpen = false;
    this.itemToDelete = null;
  }
}