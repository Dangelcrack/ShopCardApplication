import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente para mostrar mensajes de error de forma reutilizable.
 * Recibe un mensaje por input y lo muestra con un icono de advertencia.
 */
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
  /** Mensaje de error a mostrar */
  @Input() message: string | null = null;
}