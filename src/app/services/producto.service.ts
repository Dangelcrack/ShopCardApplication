import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, interval, startWith, switchMap, catchError, of, tap, distinctUntilChanged, throwError, finalize } from 'rxjs';
import { ApiService } from './api.service';
import { Producto } from '../models/producto.model';

/**
 * Servicio para gestionar productos.
 * Proporciona métodos reactivos para CRUD, búsqueda y refresco automático de productos.
 */
@Injectable({
  providedIn: 'root'
})
export class ProductoService implements OnDestroy {
  /** Intervalo de refresco automático en milisegundos */
  private refreshInterval = 30000; // 30 segundos
  /** Subject para la lista de productos */
  private productosSubject = new BehaviorSubject<Producto[]>([]);
  /** Subject para el estado de carga */
  private loadingSubject = new BehaviorSubject<boolean>(false);
  /** Subject para mensajes de error */
  private errorSubject = new BehaviorSubject<string | null>(null);
  
  /** Observable de productos con distinción de cambios */
  public productos$ = this.productosSubject.asObservable().pipe(
    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
  );
  /** Observable de estado de carga */
  public loading$ = this.loadingSubject.asObservable();
  /** Observable de errores */
  public error$ = this.errorSubject.asObservable();
  
  /** Suscripción al refresco automático */
  private refreshSubscription: Subscription | null = null;

  /**
   * Inyecta ApiService y arranca el refresco automático.
   */
  constructor(private apiService: ApiService) {
    this.startAutoRefresh();
  }

  /**
   * Limpia la suscripción al destruir el servicio.
   */
  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  /**
   * Inicia el refresco automático de productos.
   */
  private startAutoRefresh(): void {
    this.stopAutoRefresh();
    this.refreshSubscription = interval(this.refreshInterval).pipe(
      startWith(0),
      tap(() => this.loadingSubject.next(true)),
      switchMap(() => this.fetchProductos().pipe(
        catchError(() => of([]))
      )),
      tap(() => this.loadingSubject.next(false))
    ).subscribe({
      error: (err) => {
        this.loadingSubject.next(false);
        this.errorSubject.next(err.message || 'Error al cargar productos');
      }
    });
  }

  /**
   * Detiene el refresco automático.
   */
  private stopAutoRefresh(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
      this.refreshSubscription = null;
    }
  }

  /**
   * Obtiene productos desde la API y actualiza los subjects.
   * @returns Observable con la lista de productos
   */
  private fetchProductos(): Observable<Producto[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    return this.apiService.getAllProductos().pipe(
      tap({
        next: (productos) => {
          this.productosSubject.next(productos);
          this.errorSubject.next(null);
        },
        error: (error) => {
          this.errorSubject.next(error.message || 'Error al cargar productos');
          this.productosSubject.next([]);
        }
      }),
      catchError((error) => {
        this.errorSubject.next(error.message || 'Error al cargar productos');
        return of([]);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  // Métodos públicos

  /**
   * Obtiene todos los productos.
   * @returns Observable con la lista de productos
   */
  getAll(): Observable<Producto[]> {
    return this.fetchProductos();
  }

  /**
   * Fuerza el refresco de productos y reinicia el refresco automático.
   * @param force Si es true, reinicia el refresco automático
   * @returns Observable con la lista de productos
   */
  refreshProductos(force: boolean = false): Observable<Producto[]> {
    if (force) {
      this.stopAutoRefresh();
      const result = this.fetchProductos();
      this.startAutoRefresh();
      return result;
    }
    return this.fetchProductos();
  }

  /**
   * Obtiene un producto por su ID.
   * @param id ID del producto
   * @returns Observable con el producto encontrado
   */
  getById(id: number): Observable<Producto> {
    this.loadingSubject.next(true);
    return this.apiService.getProductoById(id).pipe(
      tap(() => this.errorSubject.next(null)),
      catchError(error => {
        this.errorSubject.next(error.message || 'Error al obtener el producto');
        return throwError(() => error);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Crea un nuevo producto.
   * @param producto Objeto producto a crear
   * @returns Observable con el producto creado
   */
  create(producto: Producto): Observable<Producto> {
    this.loadingSubject.next(true);
    return this.apiService.createProducto(producto).pipe(
      tap({
        next: () => {
          this.errorSubject.next(null);
          this.refreshProductos(true);
        },
        error: (error) => {
          this.errorSubject.next(error.message || 'Error al crear el producto');
        }
      }),
      catchError(error => {
        return throwError(() => error);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Actualiza un producto existente.
   * @param id ID del producto a actualizar
   * @param producto Objeto producto actualizado
   * @returns Observable con el producto actualizado
   */
  update(id: number, producto: Producto): Observable<Producto> {
    this.loadingSubject.next(true);
    return this.apiService.updateProducto(id, producto).pipe(
      tap({
        next: () => {
          this.errorSubject.next(null);
          this.refreshProductos(true);
        },
        error: (error) => {
          this.errorSubject.next(error.message || 'Error al actualizar el producto');
        }
      }),
      catchError(error => {
        return throwError(() => error);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Elimina un producto por su ID.
   * @param id ID del producto a eliminar
   * @returns Observable vacío
   */
  delete(id: number): Observable<void> {
    this.loadingSubject.next(true);
    return this.apiService.deleteProducto(id).pipe(
      tap({
        next: () => {
          this.errorSubject.next(null);
          this.refreshProductos(true);
        },
        error: (error) => {
          this.errorSubject.next(error.message || 'Error al eliminar el producto');
        }
      }),
      catchError(error => {
        return throwError(() => error);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Busca productos por nombre.
   * @param nombre Nombre a buscar
   * @returns Observable con la lista de productos encontrados
   */
  searchByNombre(nombre: string): Observable<Producto[]> {
    if (!nombre.trim()) {
      return this.productos$;
    }

    this.loadingSubject.next(true);
    return this.apiService.searchByNombre(nombre).pipe(
      tap({
        next: (productos) => {
          this.productosSubject.next(productos);
          this.errorSubject.next(null);
        },
        error: (error) => {
          this.errorSubject.next(error.message || 'Error en la búsqueda');
          this.productosSubject.next([]);
        }
      }),
      catchError(error => {
        return throwError(() => error);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Obtiene productos por categoría.
   * @param categoriaId ID de la categoría
   * @returns Observable con la lista de productos
   */
  getByCategoria(categoriaId: number): Observable<Producto[]> {
    this.loadingSubject.next(true);
    return this.apiService.getByCategoria(categoriaId).pipe(
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Obtiene productos por colección.
   * @param coleccionId ID de la colección
   * @returns Observable con la lista de productos
   */
  getByColeccion(coleccionId: number): Observable<Producto[]> {
    this.loadingSubject.next(true);
    return this.apiService.getByColeccion(coleccionId).pipe(
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Obtiene productos por rareza.
   * @param rarezaId ID de la rareza
   * @returns Observable con la lista de productos
   */
  getByRareza(rarezaId: number): Observable<Producto[]> {
    this.loadingSubject.next(true);
    return this.apiService.getByRareza(rarezaId).pipe(
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Obtiene productos por estado.
   * @param estadoId ID del estado
   * @returns Observable con la lista de productos
   */
  getByEstado(estadoId: number): Observable<Producto[]> {
    this.loadingSubject.next(true);
    return this.apiService.getByEstado(estadoId).pipe(
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Cambia el intervalo de refresco automático.
   * @param ms Intervalo en milisegundos
   */
  setRefreshInterval(ms: number): void {
    this.refreshInterval = ms;
    this.startAutoRefresh();
  }
}