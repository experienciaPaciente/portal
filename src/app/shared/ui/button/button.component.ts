import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LabelComponent } from '../label/label.component';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, LabelComponent],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent{
  // Contemplar agregar inputs de posicionamiento para type=fab
  @Input() variant: 'fill' | 'outline' | 'link' | 'fab' | 'icon' = 'fill';
  @Input() type?: 'submit';
  @Input() severity: 'success' | 'danger' | 'warning' | 'neutral' | 'info' = 'info';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
  @Input() icon?: string;
  @Input() label?: string;
  @Input() badgeCount?: number;
  @Input() prefix?: string;
  @Input() subtitle?: string;
  @Input() path?: string;
  @Input() direction: 'row' | 'column' | 'none' = 'column';
  @Output() clickEvent = new EventEmitter<void>();

  constructor(private router: Router) {}

  // Method to emit the event
  handleClick() {
    this.clickEvent.emit();

    // If path is defined, handle navigation
    if (this.path) {
      this.router.navigate([this.path]).catch((error) => {
        console.error('Navigation error:', error);
      });
    }
  }
}
