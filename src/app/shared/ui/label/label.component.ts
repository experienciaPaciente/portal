import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-label',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss']
})
export class LabelComponent {
  @Input() icon?: string;
  @Input() iconLabel?: string;
  @Input() label?: string;
  @Input() subtitle?: string;
  @Input() prefix?: string;
  @Input() direction: 'horizontal' | 'vertical' = 'vertical';
  @Input() size: 'sm' | 'md' | 'lg' | 'full' = 'md';
}
