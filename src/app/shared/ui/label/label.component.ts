import { Component, Input, OnChanges, SimpleChanges, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-label',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss']
})
export class LabelComponent implements OnChanges{
  @Input() icon?: string;
  @Input() iconLabel?: string;
  @Input() iconColor: 'primary' | 'secondary' | 'tertiary' | 'neutral' | string = 'neutral';
  @Input() label?: string;
  @Input() subtitle?: string;
  @Input() prefix?: string;
  @Input() direction: 'horizontal' | 'vertical' = 'vertical';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';

  constructor(private elRef: ElementRef, private renderer: Renderer2) {}
  ngOnChanges(changes: SimpleChanges) {
    if (changes['iconColor']) {
      this.updateIconColor();
    }
  }

  // Reveer: aplica color a todos los iconos presentes en la pantalla > Checkear card y uso de ElementRef
  private updateIconColor() {
    if (typeof this.iconColor === 'string') {
      if (['primary', 'secondary', 'tertiary', 'neutral'].includes(this.iconColor)) {
        document.documentElement.style.setProperty('--label__icon--color', `var(--${this.iconColor})`);
      } else {
        document.documentElement.style.setProperty('--label__icon--color', this.iconColor);
      }
    }
  }
}
