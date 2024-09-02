import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelComponent } from '../label/label.component';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, LabelComponent],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit{
  // Contemplar agregar inputs de posicionamiento para type=fab
  @Input() type: 'fill' | 'outline' | 'link' | 'fab' | 'icon' = 'fill';
  @Input() severity: 'success' | 'danger' | 'warning' | 'neutral' | 'info' = 'info';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
  @Input() icon?: string;
  @Input() label?: string;
  @Input() badgeCount?: number;
  @Input() prefix?: string;
  @Input() subtitle?: string;
  @Input() direction: 'horizontal' | 'vertical' = 'vertical';

  @Output() clickEvent = new EventEmitter<void>();

  ngOnInit(): void {
    this.setButtonProperties;
  }

  public buttonStyle: { [key: string]: string } = {};
  public buttonIconClass: string = 'fa-regular fa-heart';

  handleClick() {
    this.clickEvent.emit();
  }

  private setButtonProperties(): void {
    switch (this.severity) {
      case 'success':
        this.buttonStyle = {
          'background-color': 'var(--success)',
          'color': 'white'
        };
        this.buttonIconClass = 'fa-regular fa-circle-check';
        break;
      case 'warning':
        this.buttonStyle = {
          'background-color': 'var(--warning)',
          'color': 'white'
        };
        this.buttonIconClass = 'fa-regular fa-circle-exclamation';
        break;
      case 'danger':
        this.buttonStyle = {
          'background-color': 'var(--danger)',
          'color': 'white'
        };
        this.buttonIconClass = 'fa-regular fa-triangle-exclamation';
        break;
      case 'info':
        this.buttonStyle = {
          'background-color': 'var(--info)',
          'color': 'white'
        };
        this.buttonIconClass = 'fa-regular fa-circle-info';
        break;
      case 'neutral':
        this.buttonStyle = {
          'background-color': '#e0e0e0', 
          'color': 'white'
        };
        this.buttonIconClass = 'fa-regular fa-circle-question';
        break;
      default:
        break;
    }
  }
}
