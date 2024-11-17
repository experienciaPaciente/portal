import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageComponent } from './shared/ui/message/message.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    RouterOutlet,
    MessageComponent
  ],
})
export class AppComponent {
}
