import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
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
  @Input() iconColor?: 'primary' | 'secondary' | 'tertiary' | 'neutral' | string = 'neutral';
  @Input() label?: string;
  @Input() subtitle?: string;
  @Input() prefix?: string;
  @Input() direction: 'horizontal' | 'vertical' = 'vertical';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['iconColor']) {
      this.updateIconColor();
    }
  }

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
