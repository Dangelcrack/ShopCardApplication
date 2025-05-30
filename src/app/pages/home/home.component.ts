import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  featuredCards = [
    { name: 'Black Lotus', price: '€15,000', rarity: 'Mítica' },
    { name: 'Blue-Eyes White Dragon', price: '€500', rarity: 'Ultra Rara' },
    { name: 'Charizard', price: '€350', rarity: 'Edición 1ª' }
  ];
}