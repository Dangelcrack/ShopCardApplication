import { Component, OnInit } from '@angular/core';
import { RarezaService } from '../../services/rareza.service';
import { ProductoService } from '../../services/producto.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Rareza } from '../../models/rareza.model';
import { Producto } from '../../models/producto.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';

/**
 * Componente para mostrar las rarezas y productos más raros.
 */
@Component({
  selector: 'app-rarezas',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent
  ],
  templateUrl: './rarezas.component.html',
  styleUrls: ['./rarezas.component.css']
})
export class RarezasComponent implements OnInit {
  /** Lista de rarezas obtenidas del servicio */
  rarezas: Rareza[] = [];
  /** Lista de productos con las rarezas más altas */
  productosRaros: Producto[] = [];
  /** Indica si los datos están cargando */
  isLoading: boolean = true;
  /** Mensaje de error a mostrar en caso de fallo */
  errorMessage: string | null = null;
  /** Imagen por defecto para productos sin imagen */
  defaultImage = 'assets/images/default-product.png';

  /**
   * Constructor que inyecta los servicios de rareza y producto.
   */
  constructor(
    private rarezaService: RarezaService,
    private productoService: ProductoService
  ) {}

  /**
   * Inicializa el componente y carga rarezas y productos.
   */
  ngOnInit(): void {
    this.loadRarezasAndProducts();
  }

  /**
   * Carga todas las rarezas y luego los productos más raros.
   */
  loadRarezasAndProducts(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.rarezaService.getAll().subscribe({
      next: (rarezas) => {
        this.rarezas = rarezas.sort((a, b) => b.id - a.id);
        this.loadProductosRaros();
      },
      error: (err) => {
        this.handleError('Error cargando rarezas');
        console.error('Error loading rarities:', err);
      }
    });
  }

  /**
   * Carga los productos que tienen las rarezas más altas.
   */
  loadProductosRaros(): void {
    const topRarezas = this.rarezas.slice(0, 3).map(r => r.id);
    
    this.productoService.getAll().subscribe({
      next: (productos) => {
        this.productosRaros = productos
          .filter(p => p.rareza && topRarezas.includes(p.rareza.id))
          .sort((a, b) => (b.rareza.id) - (a.rareza.id));
        
        this.isLoading = false;
      },
      error: (err) => {
        this.handleError('Error cargando productos raros');
        console.error('Error loading rare products:', err);
      }
    });
  }

  /**
   * Devuelve una representación en estrellas según el nivel de rareza.
   * @param rarityId ID de la rareza
   * @returns String con estrellas llenas y vacías
   */
  getRarityStars(rarityId: number): string {
    const starCount = Math.min(5, Math.max(1, rarityId));
    return '★'.repeat(starCount) + '☆'.repeat(5 - starCount);
  }

  /**
   * Maneja el error de carga de imagen y coloca una imagen por defecto.
   * @param event Evento de error de imagen
   */
  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.src.includes(this.defaultImage)) {
      img.src = this.defaultImage;
      img.style.objectFit = 'contain';
    }
  }

  /**
   * Maneja errores generales y actualiza el mensaje de error.
   * @param message Mensaje de error a mostrar
   */
  private handleError(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
  }
}