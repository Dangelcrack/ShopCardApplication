import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductoService } from '../../services/producto.service';
import { CategoriaService } from '../../services/categoria.service';
import { ColeccionService } from '../../services/coleccion.service';
import { RarezaService } from '../../services/rareza.service';
import { EstadoProductoService } from '../../services/estado-producto.service';
import { Producto } from '../../models/producto.model';
import { Categoria } from '../../models/categoria.model';
import { Coleccion } from '../../models/coleccion.model';
import { Rareza } from '../../models/rareza.model';
import { EstadoProducto } from '../../models/estado-producto.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RouterModule } from '@angular/router';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { TruncatePipe } from '../../shared/pipes/truncate.pipe';

/**
 * Interfaz para definir el rango de precios.
 */
interface PriceRange {
  min: number;
  max: number;
}

/**
 * Componente principal del catálogo de productos.
 * Permite filtrar, ordenar y visualizar productos, así como ver detalles en un modal.
 */
@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    TruncatePipe
  ],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.css']
})
export class CatalogoComponent implements OnInit, OnDestroy {
  /** Lista completa de productos obtenidos del servicio */
  productos: Producto[] = [];
  /** Lista de productos filtrados según los filtros aplicados */
  filteredProductos: Producto[] = [];
  /** Listado de categorías disponibles */
  categorias: Categoria[] = [];
  /** Listado de colecciones disponibles */
  colecciones: Coleccion[] = [];
  /** Listado de rarezas disponibles */
  rarezas: Rareza[] = [];
  /** Listado de estados de producto disponibles */
  estadosProducto: EstadoProducto[] = [];
  
  // Filtros
  /** Término de búsqueda por nombre o descripción */
  searchTerm: string = '';
  /** Categorías seleccionadas para filtrar */
  selectedCategories: number[] = [];
  /** Colecciones seleccionadas para filtrar */
  selectedCollections: number[] = [];
  /** Rarezas seleccionadas para filtrar */
  selectedRarities: number[] = [];
  /** Estados seleccionados para filtrar */
  selectedConditions: number[] = [];
  /** Valoraciones seleccionadas para filtrar */
  selectedRatings: number[] = [];
  /** Rango de precios global */
  priceRange: PriceRange = { min: 0, max: 1000 };
  /** Rango de precios actual seleccionado */
  currentPriceRange: PriceRange = { min: 0, max: 1000 };
  /** Mostrar solo productos en stock */
  inStockOnly: boolean = false;
  /** Opción de ordenamiento seleccionada */
  sortOption: string = 'relevance';
  /** Año seleccionado para filtrar */
  selectedYear: string = '';
  /** Años disponibles extraídos de los productos */
  availableYears: number[] = [];
  
  // Estados
  /** Indica si los datos están cargando */
  isLoading: boolean = true;
  /** Mensaje de error a mostrar en caso de fallo */
  errorMessage: string | null = null;
  /** Suscripciones activas para limpiar al destruir el componente */
  private subs: Subscription = new Subscription();
  /** Imagen por defecto para productos sin imagen */
  defaultImage = 'assets/images/default-product.png';

  // Modal
  /** Producto seleccionado para mostrar en el modal */
  selectedProduct: Producto | null = null;
  /** Indica si el modal de detalles está abierto */
  showModal: boolean = false;

  /**
   * Constructor que inyecta los servicios necesarios para obtener datos.
   */
  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private coleccionService: ColeccionService,
    private rarezaService: RarezaService,
    private estadoProductoService: EstadoProductoService
  ) {}

  /**
   * Inicializa el componente y carga los datos iniciales.
   */
  ngOnInit(): void {
    this.loadInitialData();
  }

  /**
   * Limpia las suscripciones al destruir el componente.
   */
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  /**
   * Carga los datos iniciales de productos, categorías, colecciones, rarezas y estados.
   * Maneja errores y actualiza los estados de carga.
   */
  loadInitialData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const requests = {
      productos: this.productoService.getAll().pipe(
        catchError(error => {
          console.error('Error loading products:', error);
          return of([] as Producto[]);
        })),
      categorias: this.categoriaService.getAll().pipe(
        catchError(error => {
          console.error('Error loading categories:', error);
          return of([] as Categoria[]);
        })),
      colecciones: this.coleccionService.getAll().pipe(
        catchError(error => {
          console.error('Error loading collections:', error);
          return of([] as Coleccion[]);
        })),
      rarezas: this.rarezaService.getAll().pipe(
        catchError(error => {
          console.error('Error loading rarities:', error);
          return of([] as Rareza[]);
        })),
      estados: this.estadoProductoService.getAll().pipe(
        catchError(error => {
          console.error('Error loading product states:', error);
          return of([] as EstadoProducto[]);
        }))
    };

    const loadSub = forkJoin(requests).subscribe({
      next: ({ productos, categorias, colecciones, rarezas, estados }) => {
        this.productos = productos;
        this.filteredProductos = [...productos];
        this.categorias = categorias;
        this.colecciones = colecciones;
        this.rarezas = rarezas;
        this.estadosProducto = estados;
        
        if (productos.length > 0) {
          this.calculatePriceRange();
          this.extractAvailableYears();
        } else {
          this.errorMessage = 'No se encontraron productos disponibles.';
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error en carga inicial:', error);
        this.handleError(
          'Error al cargar los datos. Por favor, verifica tu conexión o intenta más tarde.'
        );
        this.isLoading = false;
      }
    });

    this.subs.add(loadSub);
  }

  /**
   * Abre el modal de detalles para el producto seleccionado.
   * @param producto Producto a mostrar en el modal
   */
  openProductModal(producto: Producto): void {
    this.selectedProduct = producto;
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  /**
   * Cierra el modal de detalles y limpia la selección.
   */
  closeModal(): void {
    this.showModal = false;
    this.selectedProduct = null;
    document.body.style.overflow = 'auto';
  }

  /**
   * Extrae los años disponibles de la fecha de creación de los productos.
   * Se utiliza para el filtro por año.
   */
  private extractAvailableYears(): void {
    const years = new Set<number>();
    this.productos.forEach(producto => {
      if (producto.fecha_creacion) {
        const date = new Date(producto.fecha_creacion);
        if (!isNaN(date.getTime())) {
          years.add(date.getFullYear());
        }
      }
    });
    this.availableYears = Array.from(years).sort((a, b) => b - a);
  }

  /**
   * Calcula el rango de precios mínimo y máximo de los productos.
   */
  private calculatePriceRange(): void {
    if (this.productos.length === 0) return;
    
    const prices = this.productos.map(p => p.precio).filter(p => p != null);
    if (prices.length === 0) return;
    
    this.priceRange = {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices))
    };
    this.currentPriceRange = { ...this.priceRange };
  }

  /**
   * Actualiza el rango de precios seleccionado y aplica los filtros.
   */
  updatePriceRange(): void {
    this.currentPriceRange.min = Math.max(this.currentPriceRange.min, this.priceRange.min);
    this.currentPriceRange.max = Math.min(this.currentPriceRange.max, this.priceRange.max);
    
    if (this.currentPriceRange.min > this.currentPriceRange.max) {
      [this.currentPriceRange.min, this.currentPriceRange.max] = 
        [this.currentPriceRange.max, this.currentPriceRange.min];
    }
    
    this.applyFilters();
  }

  /**
   * Calcula el porcentaje de descuento entre el precio actual y el original.
   * @param currentPrice Precio actual del producto
   * @param originalPrice Precio original del producto
   * @returns Porcentaje de descuento como string
   */
  calculateDiscount(currentPrice: number, originalPrice?: number): string {
    if (!originalPrice || originalPrice <= currentPrice) return '0';
    const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
    return Math.round(discount).toString();
  }

  /**
   * Calcula la valoración promedio de un producto.
   * @param valoraciones Array de valoraciones del producto
   * @returns Valoración promedio redondeada a 0.5
   */
  getAverageRating(valoraciones: any[] | undefined): number {
    if (!valoraciones || valoraciones.length === 0) return 0;
    
    const validRatings = valoraciones
      .filter(v => v.puntuacion >= 1 && v.puntuacion <= 5)
      .map(v => v.puntuacion);
      
    if (validRatings.length === 0) return 0;
    
    const sum = validRatings.reduce((total, val) => total + val, 0);
    const average = sum / validRatings.length;
    
    return Math.round(average * 2) / 2;
  }

  /**
   * Devuelve una representación en estrellas de la valoración.
   * @param rating Valoración promedio
   * @returns String con estrellas llenas, medias y vacías
   */
  getStarRating(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + 
           (hasHalfStar ? '½' : '') + 
           '☆'.repeat(emptyStars);
  }

  /**
   * Aplica todos los filtros seleccionados a la lista de productos.
   */
  applyFilters(): void {
    this.filteredProductos = this.productos.filter((producto: Producto) => {
      return this.matchesSearch(producto) &&
             this.matchesCategory(producto) &&
             this.matchesPrice(producto) &&
             this.matchesStock(producto) &&
             this.matchesCollection(producto) &&
             this.matchesRarity(producto) &&
             this.matchesCondition(producto) &&
             this.matchesRating(producto) &&
             this.matchesYear(producto);
    });

    this.sortProducts();
  }

  /**
   * Verifica si el producto coincide con el término de búsqueda.
   * @param producto Producto a evaluar
   */
  private matchesSearch(producto: Producto): boolean {
    if (!this.searchTerm) return true;
    const searchLower = this.searchTerm.toLowerCase();
    return producto.nombre.toLowerCase().includes(searchLower) ||
           (producto.descripcion?.toLowerCase().includes(searchLower) ?? false);
  }

  /**
   * Verifica si el producto pertenece a alguna de las categorías seleccionadas.
   * @param producto Producto a evaluar
   */
  private matchesCategory(producto: Producto): boolean {
    return this.selectedCategories.length === 0 || 
           (producto.categoria?.id !== undefined && 
            this.selectedCategories.includes(producto.categoria.id));
  }

  /**
   * Verifica si el producto está dentro del rango de precios seleccionado.
   * @param producto Producto a evaluar
   */
  private matchesPrice(producto: Producto): boolean {
    return producto.precio >= this.currentPriceRange.min && 
           producto.precio <= this.currentPriceRange.max;
  }

  /**
   * Verifica si el producto está en stock si el filtro está activado.
   * @param producto Producto a evaluar
   */
  private matchesStock(producto: Producto): boolean {
    return !this.inStockOnly || (producto.stock ?? 0) > 0;
  }

  /**
   * Verifica si el producto pertenece a alguna de las colecciones seleccionadas.
   * @param producto Producto a evaluar
   */
  private matchesCollection(producto: Producto): boolean {
    return this.selectedCollections.length === 0 || 
           (producto.coleccion?.id !== undefined && 
            this.selectedCollections.includes(producto.coleccion.id));
  }

  /**
   * Verifica si el producto pertenece a alguna de las rarezas seleccionadas.
   * @param producto Producto a evaluar
   */
  private matchesRarity(producto: Producto): boolean {
    return this.selectedRarities.length === 0 || 
           (producto.rareza?.id !== undefined && 
            this.selectedRarities.includes(producto.rareza.id));
  }

  /**
   * Verifica si el producto tiene alguno de los estados seleccionados.
   * @param producto Producto a evaluar
   */
  private matchesCondition(producto: Producto): boolean {
    return this.selectedConditions.length === 0 || 
           (producto.estado?.id !== undefined && 
            this.selectedConditions.includes(producto.estado.id));
  }

  /**
   * Verifica si el producto tiene alguna de las valoraciones seleccionadas.
   * @param producto Producto a evaluar
   */
  private matchesRating(producto: Producto): boolean {
    if (this.selectedRatings.length === 0) return true;
    
    const avgRating = this.getAverageRating(producto.valoraciones);
    
    return this.selectedRatings.some(selectedRating => {
      return avgRating >= selectedRating;
    });
  }

  /**
   * Verifica si el producto fue creado en el año seleccionado.
   * @param producto Producto a evaluar
   */
  private matchesYear(producto: Producto): boolean {
    if (!this.selectedYear) return true;
    if (!producto.fecha_creacion) return false;
    
    const productDate = new Date(producto.fecha_creacion);
    return !isNaN(productDate.getTime()) && 
           productDate.getFullYear().toString() === this.selectedYear;
  }

  /**
   * Ordena los productos filtrados según la opción seleccionada.
   */
  sortProducts(): void {
    switch (this.sortOption) {
      case 'price-asc':
        this.filteredProductos.sort((a, b) => (a.precio ?? 0) - (b.precio ?? 0));
        break;
      case 'price-desc':
        this.filteredProductos.sort((a, b) => (b.precio ?? 0) - (a.precio ?? 0));
        break;
      case 'name-asc':
        this.filteredProductos.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'name-desc':
        this.filteredProductos.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
      case 'date-asc':
        this.filteredProductos.sort((a, b) => 
          (new Date(a.fecha_creacion ?? 0).getTime()) - 
          (new Date(b.fecha_creacion ?? 0).getTime()));
        break;
      case 'date-desc':
        this.filteredProductos.sort((a, b) => 
          (new Date(b.fecha_creacion ?? 0).getTime()) - 
          (new Date(a.fecha_creacion ?? 0).getTime()));
        break;
      case 'rating-desc':
        this.filteredProductos.sort((a, b) => 
          this.getAverageRating(b.valoraciones) - this.getAverageRating(a.valoraciones));
        break;
      default:
        break;
    }
  }

  /**
   * Alterna la selección de un filtro (categoría, colección, rareza, estado).
   * @param array Array de IDs seleccionados
   * @param id ID a alternar
   */
  toggleFilter(array: number[], id: number): void {
    const index = array.indexOf(id);
    index === -1 ? array.push(id) : array.splice(index, 1);
    this.applyFilters();
  }

  /** Alterna la selección de una categoría */
  toggleCategory = (id: number) => this.toggleFilter(this.selectedCategories, id);
  /** Alterna la selección de una colección */
  toggleCollection = (id: number) => this.toggleFilter(this.selectedCollections, id);
  /** Alterna la selección de una rareza */
  toggleRarity = (id: number) => this.toggleFilter(this.selectedRarities, id);
  /** Alterna la selección de un estado */
  toggleCondition = (id: number) => this.toggleFilter(this.selectedConditions, id);

  /**
   * Alterna la selección de una valoración.
   * @param rating Valoración a alternar
   */
  toggleRating(rating: number): void {
    const index = this.selectedRatings.indexOf(rating);
    if (index === -1) {
      this.selectedRatings.push(rating);
    } else {
      this.selectedRatings.splice(index, 1);
    }
    this.applyFilters();
  }

  /**
   * Restablece todos los filtros a sus valores por defecto.
   */
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategories = [];
    this.selectedCollections = [];
    this.selectedRarities = [];
    this.selectedConditions = [];
    this.selectedRatings = [];
    this.selectedYear = '';
    this.currentPriceRange = { ...this.priceRange };
    this.inStockOnly = false;
    this.sortOption = 'relevance';
    this.applyFilters();
  }

  /**
   * Cuenta la cantidad de productos por categoría.
   * @param categoryId ID de la categoría
   */
  countProductsByCategory(categoryId: number): number {
    return this.productos.filter(p => p.categoria?.id === categoryId).length;
  }

  /**
   * Cuenta la cantidad de productos por colección.
   * @param collectionId ID de la colección
   */
  countProductsByCollection(collectionId: number): number {
    return this.productos.filter(p => p.coleccion?.id === collectionId).length;
  }

  /**
   * Cuenta la cantidad de productos por rareza.
   * @param rarityId ID de la rareza
   */
  countProductsByRarity(rarityId: number): number {
    return this.productos.filter(p => p.rareza?.id === rarityId).length;
  }

  /**
   * Cuenta la cantidad de productos por estado.
   * @param conditionId ID del estado
   */
  countProductsByCondition(conditionId: number): number {
    return this.productos.filter(p => p.estado?.id === conditionId).length;
  }

  /**
   * Cuenta la cantidad de productos por valoración.
   * @param rating Valoración a contar
   */
  countProductsByRating(rating: number): number {
    return this.productos.filter(p => {
      const avgRating = this.getAverageRating(p.valoraciones);
      return Math.floor(avgRating) === rating;
    }).length;
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
    console.error('Error:', message);
    this.errorMessage = message;
    this.isLoading = false;
  }
}