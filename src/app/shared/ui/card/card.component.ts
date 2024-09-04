import { Component, Input, ViewChild, ElementRef, OnChanges, AfterViewInit, SimpleChanges } from '@angular/core';
import { LabelComponent } from '../label/label.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [LabelComponent, CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})

export class CardComponent implements OnChanges, AfterViewInit {
  @Input() selected = false;
  @Input() aligned: 'start' | 'end' | 'center' = 'center';
  @Input() selectable = false;
  @Input() align: 'start' | 'end' | 'center' = 'center';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'block' = 'md';
  @Input() severity: 'info' | 'success' | 'warning' | 'danger' | 'neutral' | 'custom' = 'neutral';
  @Input() type: 'fill' | 'outline' = 'outline';
  @Input() direction: 'column' | 'row' = 'column';
  @Input() color = '';
  
  // Ver de pasar direccionalidad desde la card al label
  @ViewChild('cardColor', { static: true }) cardColor!: ElementRef;
  @ViewChild(LabelComponent, { static: true}) label?: LabelComponent;


  get cssDirection() {
    return this.direction === 'row' ? 'card__wrapper--row' : 'card__wrapper--column';
  }

  ngAfterViewInit(): void {
    if (this.label) {
      this.label.direction = this.direction;
    }
    if (this.severity === 'custom' && this.color) {
      this.applyCustomColor();
    }
  }

  private applyCustomColor(): void {
    this.cardColor.nativeElement.style.setProperty('--card__border--color', this.color);
    this.cardColor.nativeElement.style.setProperty('--card__bg--color', `${this.color}25`);
    
    if (this.label) {
      this.label.severity = this.color;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {

    // Util para comportamietno mobile o sidebar retráctil 
    if (changes['direction'] && this.label) {
      this.label.direction = this.direction;
    }
  }

  onCardClick() {
    if (this.selectable) {
      this.selected = !this.selected;
    }
  }
}