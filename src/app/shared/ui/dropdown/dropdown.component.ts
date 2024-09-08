import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { LabelComponent } from '../label/label.component';
import { CardComponent } from '../card/card.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, ButtonComponent, LabelComponent, CardComponent],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss'
})
export class DropdownComponent {
  @Input() items: { label: string, icon?: string, subItems?: any[] }[] = [];
  @Input() position?: { top: string, left: string };
  @Input() buttonLabel: string = 'Dropdown';
  @Input() buttonIcon?: string;
  // agregar propiedad variant
  @Output() itemSelected = new EventEmitter<any>();

  constructor(private router: Router) {}
  
  isOpen = false;
  hasNestedItems = false;
  
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container') && this.isOpen) {
      this.close();
    }
  }
  
  toggle() {
    this.isOpen = !this.isOpen;
    this.hasNestedItems = this.items.some(item => item.subItems && item.subItems.length > 0);
  }
  
  handleItemClick(item: any) {
    if (item.route) {
      this.router.navigate([item.route], { queryParams: item.queryParams });
    }
    
    this.itemSelected.emit(item);
    this.close();
  }
  
  handleNestedItemClick(item: any) {
    this.itemSelected.emit(item);
    this.close();
  }
  
  close() {
    this.isOpen = false;
  }
}
