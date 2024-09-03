import { Component, Input, OnChanges, SimpleChanges, ElementRef, Renderer2, ViewChild } from '@angular/core';
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
  @Input() severity: 'primary' | 'secondary' | 'tertiary' | 'neutral' | string = 'neutral';
  @Input() label?: string;
  @Input() subtitle?: string;
  @Input() prefix?: string;
  @Input() direction: 'horizontal' | 'vertical' = 'vertical';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';

  @ViewChild('labelColor', { static: true }) labelColor!: ElementRef;


  constructor() {}
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['severity']) {
      this.updateIconColor();
    }
  }

  // Reveer: aplica severity a todos los iconos presentes en la pantalla > Checkear card y uso de ElementRef
  private updateIconColor() {
    if (typeof this.severity === 'string') {
      if (['primary', 'secondary', 'tertiary', 'neutral'].includes(this.severity)) {
        this.labelColor.nativeElement.style.setProperty('--label__icon--color', `var(--${this.severity})`);
      } else {
        this.labelColor.nativeElement.style.setProperty('--label__icon--color', this.severity);
      }
    }
  }

// Posible solución
//   ngOnChanges() {
//     if (this.severity && this.severity.length > 0) {
//         this.labelColor.nativeElement.style.setProperty('--label__icon--color', `var(--${this.severity})`y);
//     }

//     if (this.severity && this.severity.length > 0 && this.custom === 'outlined') {
//         this.labelColor.nativeElement.style.setProperty('--label__icon--color', this.severity + '25');
//     }
// }


}
