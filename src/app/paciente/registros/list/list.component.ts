import { Component, OnInit, inject, Input } from '@angular/core';
import { ItemComponent } from 'src/app/shared/ui/item/item.component';
import { LabelComponent } from 'src/app/shared/ui/label/label.component';
import { RegistrosService } from 'src/app/core/services/registros.service';
import { Registro } from 'src/app/models/registro';
import { Auth, authState } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardComponent } from 'src/app/shared/ui/card/card.component';
import { BadgeComponent } from 'src/app/shared/ui/badge/badge.component';
import { ButtonComponent } from 'src/app/shared/ui/button/button.component';
import { NavbarComponent } from 'src/app/shared/ui/navbar/navbar.component';
import { DropdownComponent } from 'src/app/shared/ui/dropdown/dropdown.component';

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
    DropdownComponent
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {

  registro!: Registro[];
  registros$!: Observable<Registro[]>;
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
    { label: 'Item 1', icon: 'user', route: '/path-to-item1' },
    { label: 'Item 2', icon: 'user', route: '/path-to-item2' },
    { label: 'Cerrar sesión', icon: 'user', route: '/auth/sign-in', subItems: [
        { label: 'Sub-item 1', route: '/path-to-subitem1' },
        { label: 'Sub-item 2', route: '/path-to-subitem2' }
    ]}
  ];

  dropdownPosition = { top: '35px', left: '-90px' };

  categoriaItems = Object.keys(this.categoriaMap).map(key => {
    return {
      label: key,
      icon: this.categoriaMap[key].icon,
      color: this.categoriaMap[key].color,
      path: `/categories/${key}`, // Assuming you want to have a path associated with each item
      selectable: false, // Default selectable state
    };
  });

  constructor(private registroService: RegistrosService, private router: Router) {
  }

  ngOnInit(): void {
    this.authState$.subscribe(user => {
      if (user) {
        this.registros$ = this.registroService.getRegistrosByUserId(user.uid);
      }
    });
  }
  
  onItemSelected(item: Registro): void {
    this.router.navigate([`/item/${item.id}`]);
    // Utilizar behavior subject para enviar el enviar el valor actualizado de isMobile
  }

  getIconForCategoria(categoria: string): string {
    return this.categoriaMap[categoria]?.icon || 'question-circle'; // Default icon
  }

  getColorForCategoria(categoria: string): string {
    return this.categoriaMap[categoria]?.color || 'gray'; // Default color
  }

  trackByFn(item: Registro): string {
    return item.id; // Or another unique identifier
  }
}
