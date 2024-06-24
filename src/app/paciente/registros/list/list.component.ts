import { Component, OnInit, inject } from '@angular/core';
import { ItemComponent } from 'src/app/shared/ui/item/item.component';
import { LabelComponent } from 'src/app/shared/ui/label/label.component';
import { RegistrosService } from 'src/app/core/services/registros.service';
import { Registro } from 'src/app/models/registro';
import { Auth, authState } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [ItemComponent, LabelComponent, CommonModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {

  records!: Registro[];
  registros$!: Observable<Registro[]>;
  private auth: Auth = inject(Auth);
  readonly authState$ = authState(this.auth);
  

  constructor(private registroService: RegistrosService) {
  }

  ngOnInit(): void {
    this.authState$.subscribe(user => {
      if (user) {
        this.registros$ = this.registroService.getRegistrosByUserId(user.uid);
      }
    });
  }
}
