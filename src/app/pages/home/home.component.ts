import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  // Aquí puedes agregar propiedades y métodos específicos para la página de inicio
  welcomeMessage: string = '¡Bienvenido a Magic Card Haven! Explora nuestro catálogo de cartas y descubre el mundo de Magic: The Gathering.';
}