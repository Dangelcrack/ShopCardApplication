import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductoService } from '../../services/producto.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.css']
})
export class CatalogoComponent implements OnInit, OnDestroy {
  productos: any[] = [];
  filteredProductos: any[] = [];
  searchTerm: string = '';
  isLoading: boolean = true;
  errorMessage: string | null = null;
  private subs: Subscription = new Subscription();

  // Imagen por defecto como SVG inline
  defaultImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23eee"><rect width="100" height="100"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-family="Arial" font-size="12">Imagen no disponible</text></svg>';

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.loadProductos();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadProductos(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const loadSub = this.productoService.getAllProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.filteredProductos = [...data];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.errorMessage = 'Error al cargar los productos. Por favor, intente más tarde.';
        this.isLoading = false;
      }
    });

    this.subs.add(loadSub);
  }

  searchProductos(): void {
    if (!this.productos.length) return;

    this.isLoading = true;
    const term = this.searchTerm.toLowerCase().trim();

    if (term) {
      this.filteredProductos = this.productos.filter(producto => 
        producto.nombre.toLowerCase().includes(term)
      );
    } else {
      this.filteredProductos = [...this.productos];
    }

    setTimeout(() => this.isLoading = false, 300); // Pequeño delay para mejor UX
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.defaultImage;
    imgElement.onerror = null; // Prevenir bucles infinitos
  }
}