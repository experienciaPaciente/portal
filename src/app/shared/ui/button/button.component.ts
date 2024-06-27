import { Component, Input } from '@angular/core';
import { LabelComponent } from '../label/label.component';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [LabelComponent],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})

export class ButtonComponent {

  buttonLabel = '';

  @Input() type?: 'primary' | 'secondary' | 'tertiary' = 'primary';
  @Input() icon? = false;
  @Input() btnIconLabel = '';
  @Input() btnLabel = '';
  @Input() severity?: 'warning' | 'danger' | 'info' | 'success' = 'info';
  @Input() fab = false;
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'sm';
}
