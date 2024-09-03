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
export class ButtonComponent{
  // Contemplar agregar inputs de posicionamiento para type=fab
  @Input() type: 'fill' | 'outline' | 'link' | 'fab' | 'icon' = 'fill';
  @Input() severity: 'success' | 'danger' | 'warning' | 'neutral' | 'info' = 'info';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
  @Input() icon?: string;
  @Input() label?: string;
  @Input() badgeCount?: number;
  @Input() prefix?: string;
  @Input() subtitle?: string;

  @Output() clickEvent = new EventEmitter<void>();


  public buttonStyle: { [key: string]: string } = {};
  public buttonIconClass: string = 'fa-regular fa-heart';

  handleClick() {
    this.clickEvent.emit();
  }
}
