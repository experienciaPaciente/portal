import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-label',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss']
})
export class LabelComponent implements OnChanges{
  @Input() icon?: string;
  @Input() img?: string;
  @Input() iconLabel?: string;
  @Input() severity: 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'custom' | string = 'neutral';
  @Input() color!: string;
  @Input() label?: string | Date;
  @Input() subtitle?: string;
  @Input() prefix?: string;
  @Input() direction: 'row' | 'column' | 'none' = 'column';
  @Input() size: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';

  @ViewChild('labelColor', { static: true }) labelColor!: ElementRef;

  constructor(private sanitizer: DomSanitizer) {}
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['severity'], ['color']) {
      this.updateIconColor();
    }
  }

  // Check if icon is an SVG file path
  isSvgIcon(): boolean {
    return this.icon ? this.icon.endsWith('.svg') : false;
  }

  // Get safe URL for SVG icon
  getSvgUrl(): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.icon || '');
  }

  // Reveer color icono
  private updateIconColor() {
    if (typeof this.severity === 'string') {
      if (['primary', 'secondary', 'tertiary', 'neutral'].includes(this.severity)) {
        this.labelColor.nativeElement.style.setProperty('--label__icon--color', `var(--${this.severity})`);
      } else {
        this.labelColor.nativeElement.style.setProperty('--label__icon--color', this.color);
      }
    }
  }
}
