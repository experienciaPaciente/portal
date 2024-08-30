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
  registro!: Registro;

  constructor(
    private route: ActivatedRoute,
    private registroService: RegistrosService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.registroService.getRegistrosByUserId(id).subscribe(data => {
        this.registro = this.registro;
      });
    }
  }
}
