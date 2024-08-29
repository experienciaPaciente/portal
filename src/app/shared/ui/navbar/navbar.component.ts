import { Component, Input } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { LabelComponent } from '../label/label.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, ButtonComponent, LabelComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  @Input() items:any = [];

  onSubmit() {
    console.log('Submit button clicked');
  }

}

