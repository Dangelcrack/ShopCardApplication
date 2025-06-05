import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente para la página "Sobre Nosotros".
 * Muestra información sobre las características y valores de la tienda.
 */
@Component({
  selector: 'app-sobre-nosotros',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sobre-nosotros.component.html',
  styleUrls: ['./sobre-nosotros.component.css']
})
export class SobreNosotrosComponent {
  /**
   * Lista de características destacadas de la tienda.
   * Cada elemento contiene un icono, título y descripción.
   */
  features = [
    {
      icon: 'verified',
      title: 'Autenticidad Garantizada',
      description: 'Todas nuestras cartas pasan por un riguroso proceso de autenticación por expertos.'
    },
    {
      icon: 'attach_money',
      title: 'Precios Competitivos',
      description: 'Ofrecemos los mejores precios del mercado y evaluaciones gratuitas de tu colección.'
    },
    {
      icon: 'local_shipping',
      title: 'Envío Seguro',
      description: 'Envíos certificados con protección total y seguimiento en tiempo real.'
    }
  ];
}