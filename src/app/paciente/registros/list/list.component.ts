import { Component, OnInit } from '@angular/core';
import { ItemComponent } from 'src/app/shared/ui/item/item.component';
import { LabelComponent } from 'src/app/shared/ui/label/label.component';
import { RegistrosService } from 'src/app/core/services/registros.service';
import { Registro } from 'src/app/models/registro';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [ItemComponent, LabelComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {

  records!: Registro[];
  
  constructor(private registroService: RegistrosService) {
  }

  ngOnInit(): void {
    this.registroService.getRegistros().subscribe(records => {
      this.records = records;
    })
  }

}


