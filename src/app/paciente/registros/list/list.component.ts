import { Component, OnInit, inject, Input } from '@angular/core';
import { ItemComponent } from 'src/app/shared/ui/item/item.component';
import { LabelComponent } from 'src/app/shared/ui/label/label.component';
import { RegistrosService } from 'src/app/core/services/registros.service';
import { Registro } from 'src/app/models/registro';
import { Auth, authState } from '@angular/fire/auth';
import { Observable, debounceTime, distinctUntilChanged, switchMap, map, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardComponent } from 'src/app/shared/ui/card/card.component';
import { BadgeComponent } from 'src/app/shared/ui/badge/badge.component';
import { ButtonComponent } from 'src/app/shared/ui/button/button.component';
import { NavbarComponent } from 'src/app/shared/ui/navbar/navbar.component';
import { DropdownComponent } from 'src/app/shared/ui/dropdown/dropdown.component';
import { FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

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
    ReactiveFormsModule
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {

  registro!: Registro[];
  registros$!: Observable<Registro[]>;

  filteredRegistros$!: Observable<Registro[]>;
  searchControl = new FormControl('');
  selectedCategory: string = '';

  private auth: Auth = inject(Auth);
  readonly authState$ = authState(this.auth);
  
  @Input() type?: 'flex' | 'grid' = 'flex';
  @Input() direction?: 'horizontal' | 'vertical' = 'horizontal';


  categoriaMap: { [key: string]: { icon: string; color: string } } = {
    'Consulta general': { icon: 'user-md', color: '#FD5B71' },
    'Laboratorios': { icon: 'vial', color: '#6DDDFC' },
    'Consulta pediátrica': { icon: 'baby', color: '#A2BDFF' },
    'Vacunación': { icon: 'syringe', color: '#FF9110' },
    'Alergia e Inmunología': { icon: 'allergies', color: '#208AF2' },
    'Cardiología': { icon: 'heart', color: '#1BC5DD' },
  };

  menuItems = [
    { label: 'Editar', icon: 'user', action: this.navigateToEdit.bind(this) },
    { label: 'Destacar', icon: 'star', route: '/path-to-item2' },
    { label: 'Gestionar permisos', icon: 'star', route: '/path-to-item2' },
    { label: 'Asociar a registro', icon: 'star', route: '/path-to-item2' },
    { label: 'Eliminar', icon: 'trash', action: this.navigateToDelete.bind(this)}
  ];

  dropdownPosition = { top: '35px', left: '-90px' };

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
    private router: Router
  ) {
    
  }

  ngOnInit(): void {
    this.authState$.subscribe(user => {
      if (user) {
        this.registros$ = this.registroService.getRegistrosByUserId(user.uid);
                
        this.filteredRegistros$ = this.searchControl.valueChanges.pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap(searchTerm => this.filterRegistros(searchTerm ?? '', this.selectedCategory))
        );
      }
    });
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
      console.log('Registro deleted successfully');
     this.router.navigate(['/']);
    } catch (error) {
      console.error('Error deleting registro', error);
    }
  }


 // Search & filter
 onCategorySelected(category: string): void {
  this.selectedCategory = category;
  this.filteredRegistros$ = this.filterRegistros(this.searchControl.value ?? '', category);
}

private filterRegistros(searchTerm: string, category: string): Observable<Registro[]> {
  const term = searchTerm || '';
  return this.registros$.pipe(
    map(registros => registros.filter(registro => 
      registro.titulo.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (category === '' || registro.categoria === category)
    ))
  );
}

  // Dinamically change icons/colors
  getIconForCategoria(categoria: string): string {
    return this.categoriaMap[categoria]?.icon || 'question-circle'; // Default icon
  }

  getColorForCategoria(categoria: string): string {
    return this.categoriaMap[categoria]?.color || 'gray'; // Default color
  }

  trackByFn(index: number, item: Registro): string {
    return item.id;
  }
}
