import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, interval, startWith, switchMap, catchError, of, tap, distinctUntilChanged, throwError, finalize } from 'rxjs';
import { ApiService } from './api.service';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService implements OnDestroy {
  private refreshInterval = 30000; // 30 segundos
  private productosSubject = new BehaviorSubject<Producto[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  
  public productos$ = this.productosSubject.asObservable().pipe(
    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
  );
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();
  
  private refreshSubscription: Subscription | null = null;

  constructor(private apiService: ApiService) {
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

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

  private stopAutoRefresh(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
      this.refreshSubscription = null;
    }
  }

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
  getAll(): Observable<Producto[]> {
    return this.fetchProductos();
  }

  refreshProductos(force: boolean = false): Observable<Producto[]> {
    if (force) {
      this.stopAutoRefresh();
      const result = this.fetchProductos();
      this.startAutoRefresh();
      return result;
    }
    return this.fetchProductos();
  }

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

  getByCategoria(categoriaId: number): Observable<Producto[]> {
    this.loadingSubject.next(true);
    return this.apiService.getByCategoria(categoriaId).pipe(
      finalize(() => this.loadingSubject.next(false))
    );
  }

  getByColeccion(coleccionId: number): Observable<Producto[]> {
    this.loadingSubject.next(true);
    return this.apiService.getByColeccion(coleccionId).pipe(
      finalize(() => this.loadingSubject.next(false))
    );
  }

  getByRareza(rarezaId: number): Observable<Producto[]> {
    this.loadingSubject.next(true);
    return this.apiService.getByRareza(rarezaId).pipe(
      finalize(() => this.loadingSubject.next(false))
    );
  }

  getByEstado(estadoId: number): Observable<Producto[]> {
    this.loadingSubject.next(true);
    return this.apiService.getByEstado(estadoId).pipe(
      finalize(() => this.loadingSubject.next(false))
    );
  }

  setRefreshInterval(ms: number): void {
    this.refreshInterval = ms;
    this.startAutoRefresh();
  }
}