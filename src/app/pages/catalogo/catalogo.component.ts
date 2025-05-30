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

interface PriceRange {
  min: number;
  max: number;
}

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
  productos: Producto[] = [];
  filteredProductos: Producto[] = [];
  categorias: Categoria[] = [];
  colecciones: Coleccion[] = [];
  rarezas: Rareza[] = [];
  estadosProducto: EstadoProducto[] = [];
  
  // Filtros
  searchTerm: string = '';
  selectedCategories: number[] = [];
  selectedCollections: number[] = [];
  selectedRarities: number[] = [];
  selectedConditions: number[] = [];
  selectedRatings: number[] = [];
  priceRange: PriceRange = { min: 0, max: 1000 };
  currentPriceRange: PriceRange = { min: 0, max: 1000 };
  inStockOnly: boolean = false;
  sortOption: string = 'relevance';
  selectedYear: string = '';
  availableYears: number[] = [];
  
  // Estados
  isLoading: boolean = true;
  errorMessage: string | null = null;
  private subs: Subscription = new Subscription();
  defaultImage = 'assets/images/default-product.png';

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private coleccionService: ColeccionService,
    private rarezaService: RarezaService,
    private estadoProductoService: EstadoProductoService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

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

  updatePriceRange(): void {
    this.currentPriceRange.min = Math.max(this.currentPriceRange.min, this.priceRange.min);
    this.currentPriceRange.max = Math.min(this.currentPriceRange.max, this.priceRange.max);
    
    if (this.currentPriceRange.min > this.currentPriceRange.max) {
      [this.currentPriceRange.min, this.currentPriceRange.max] = 
        [this.currentPriceRange.max, this.currentPriceRange.min];
    }
    
    this.applyFilters();
  }

  calculateDiscount(currentPrice: number, originalPrice?: number): string {
    if (!originalPrice || originalPrice <= currentPrice) return '0';
    const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
    return Math.round(discount).toString();
  }

  getAverageRating(valoraciones: any[] | undefined): number {
    if (!valoraciones || valoraciones.length === 0) return 0;
    
    // Filtramos valoraciones inválidas (fuera del rango 1-5)
    const validRatings = valoraciones
      .filter(v => v.puntuacion >= 1 && v.puntuacion <= 5)
      .map(v => v.puntuacion);
      
    if (validRatings.length === 0) return 0;
    
    const sum = validRatings.reduce((total, val) => total + val, 0);
    const average = sum / validRatings.length;
    
    // Redondeamos al medio punto más cercano (0.5)
    return Math.round(average * 2) / 2;
  }

  getStarRating(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + 
           (hasHalfStar ? '½' : '') + 
           '☆'.repeat(emptyStars);
  }

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

  private matchesSearch(producto: Producto): boolean {
    if (!this.searchTerm) return true;
    const searchLower = this.searchTerm.toLowerCase();
    return producto.nombre.toLowerCase().includes(searchLower) ||
           (producto.descripcion?.toLowerCase().includes(searchLower) ?? false);
  }

  private matchesCategory(producto: Producto): boolean {
    return this.selectedCategories.length === 0 || 
           (producto.categoria?.id !== undefined && 
            this.selectedCategories.includes(producto.categoria.id));
  }

  private matchesPrice(producto: Producto): boolean {
    return producto.precio >= this.currentPriceRange.min && 
           producto.precio <= this.currentPriceRange.max;
  }

  private matchesStock(producto: Producto): boolean {
    return !this.inStockOnly || (producto.stock ?? 0) > 0;
  }

  private matchesCollection(producto: Producto): boolean {
    return this.selectedCollections.length === 0 || 
           (producto.coleccion?.id !== undefined && 
            this.selectedCollections.includes(producto.coleccion.id));
  }

  private matchesRarity(producto: Producto): boolean {
    return this.selectedRarities.length === 0 || 
           (producto.rareza?.id !== undefined && 
            this.selectedRarities.includes(producto.rareza.id));
  }

  private matchesCondition(producto: Producto): boolean {
    return this.selectedConditions.length === 0 || 
           (producto.estado?.id !== undefined && 
            this.selectedConditions.includes(producto.estado.id));
  }

  private matchesRating(producto: Producto): boolean {
    if (this.selectedRatings.length === 0) return true;
    
    const avgRating = this.getAverageRating(producto.valoraciones);
    
    // Si el usuario seleccionó estrellas específicas (ej. 4 estrellas)
    // Mostramos productos con rating igual o mayor a las seleccionadas
    return this.selectedRatings.some(selectedRating => {
      return avgRating >= selectedRating;
    });
  }

  private matchesYear(producto: Producto): boolean {
    if (!this.selectedYear) return true;
    if (!producto.fecha_creacion) return false;
    
    const productDate = new Date(producto.fecha_creacion);
    return !isNaN(productDate.getTime()) && 
           productDate.getFullYear().toString() === this.selectedYear;
  }

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
        // Orden por relevancia (por defecto)
        break;
    }
  }

  toggleFilter(array: number[], id: number): void {
    const index = array.indexOf(id);
    index === -1 ? array.push(id) : array.splice(index, 1);
    this.applyFilters();
  }

  toggleCategory = (id: number) => this.toggleFilter(this.selectedCategories, id);
  toggleCollection = (id: number) => this.toggleFilter(this.selectedCollections, id);
  toggleRarity = (id: number) => this.toggleFilter(this.selectedRarities, id);
  toggleCondition = (id: number) => this.toggleFilter(this.selectedConditions, id);

  toggleRating(rating: number): void {
    const index = this.selectedRatings.indexOf(rating);
    if (index === -1) {
      this.selectedRatings.push(rating);
    } else {
      this.selectedRatings.splice(index, 1);
    }
    this.applyFilters();
  }

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

  countProductsByCategory(categoryId: number): number {
    return this.productos.filter(p => p.categoria?.id === categoryId).length;
  }

  countProductsByCollection(collectionId: number): number {
    return this.productos.filter(p => p.coleccion?.id === collectionId).length;
  }

  countProductsByRarity(rarityId: number): number {
    return this.productos.filter(p => p.rareza?.id === rarityId).length;
  }

  countProductsByCondition(conditionId: number): number {
    return this.productos.filter(p => p.estado?.id === conditionId).length;
  }

  countProductsByRating(rating: number): number {
    return this.productos.filter(p => {
      const avgRating = this.getAverageRating(p.valoraciones);
      return Math.floor(avgRating) === rating;
    }).length;
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.src.includes(this.defaultImage)) {
      img.src = this.defaultImage;
      img.style.objectFit = 'contain';
    }
  }

  private handleError(message: string): void {
    console.error('Error:', message);
    this.errorMessage = message;
    this.isLoading = false;
  }
}