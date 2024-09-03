import { Component, Input, ViewChild, ElementRef, OnChanges } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent implements OnChanges {
  @Input() selected = false;
  @Input() aligned: 'start' | 'end' | 'center' = 'center';
  @Input() selectable = false;
  @Input() align: 'start' | 'end' | 'center' = 'center';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'block' = 'md';
  @Input() severity: 'info' | 'success' | 'warning' | 'danger' | 'neutral' = 'neutral';
  @Input() type: 'fill' | 'outline' = 'outline';
  @Input() color = '';

  // Ver de pasar direccionalidad desde la card al label

  @ViewChild('cardColor', { static: true }) cardColor!: ElementRef;

  get cssAlign() {
    return this.aligned === 'center' ? 'justify-content-center' : `justify-content-${this.aligned}`;
  }

  ngOnChanges() {
    if (this.color) {
      this.cardColor.nativeElement.style.setProperty('--card-color', this.color);

      if (this.type === 'outline') {
        this.cardColor.nativeElement.style.setProperty('--card-color', `${this.color}25`);
      }
    }
  }

  onCardClick() {
    if (this.selectable) {
      this.selected = !this.selected;
    }
  }
}