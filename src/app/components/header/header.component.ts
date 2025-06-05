import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  isMenuCollapsed = true;
  cartItems = 3; // Valor de ejemplo - deberías obtenerlo de tu servicio de carrito

  // Método para alternar el menú en dispositivos móviles
  toggleMenu() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  // Método para cerrar el menú después de seleccionar una opción
  closeMenu() {
    this.isMenuCollapsed = true;
  }
}