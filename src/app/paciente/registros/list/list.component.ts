import { Component, OnInit, inject, Input } from '@angular/core';
import { ItemComponent } from 'src/app/shared/ui/item/item.component';
import { LabelComponent } from 'src/app/shared/ui/label/label.component';
import { RegistrosService } from 'src/app/core/services/registros.service';
import { Registro } from 'src/app/models/registro';
import { Auth, authState } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [ItemComponent, LabelComponent, CommonModule],
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
    'Consulta general': { icon: 'user-md', color: 'blue' },
    'Laboratorios': { icon: 'vial', color: 'purple' },
    'Consulta pediátrica': { icon: 'baby', color: 'green' },
    'Vacunación': { icon: 'syringe', color: 'orange' },
    'Alergia e Inmunología': { icon: 'allergies', color: 'yellow' },
    'Cardiología': { icon: 'heart', color: 'red' },
  };

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
