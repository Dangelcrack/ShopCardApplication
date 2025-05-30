import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-message" [class.hidden]="!message">
      <span class="error-icon">⚠️</span>
      <span class="error-text">{{ message }}</span>
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./error-message.component.css']
})
export class ErrorMessageComponent {
  @Input() message: string | null = null;
}