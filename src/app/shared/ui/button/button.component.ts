import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelComponent } from '../label/label.component';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, LabelComponent],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() type: 'fill' | 'outline' | 'link' | 'fab' | 'icon' = 'fill';
  @Input() size: 'sm' | 'md' | 'lg' | 'full' = 'md';
  @Input() icon?: string;
  @Input() label?: string;
  @Input() badgeCount?: number;
  @Input() prefix?: string;
  @Input() subtitle?: string;
  @Input() direction: 'horizontal' | 'vertical' = 'vertical';

  @Output() clickEvent = new EventEmitter<void>();

  handleClick() {
    this.clickEvent.emit();
  }
}
