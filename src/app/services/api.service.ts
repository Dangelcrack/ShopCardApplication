import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Producto } from '../models/producto.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl; // https://monarch-sweeping-flounder.ngrok-free.app
  private defaultHeaders: HttpHeaders;

  constructor(private http: HttpClient) { 
    this.defaultHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido en la comunicación con el servidor';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status) {
      errorMessage = `Código ${error.status}: ${error.error?.message || error.statusText}`;
      
      if (error.status === 0) {
        errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
      } else if (error.status >= 500) {
        errorMessage = 'Error interno del servidor. Por favor, intente más tarde.';
      } else if (error.status === 404) {
        errorMessage = 'Recurso no encontrado.';
      } else if (error.status === 401 || error.status === 403) {
        errorMessage = 'No autorizado. Por favor, autentíquese.';
      }
    }

    console.error('Error en la solicitud HTTP:', error);
    return throwError(() => new Error(errorMessage));
  }

  // Métodos para productos
  getAllProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/api/productos`, {
      headers: this.defaultHeaders,
      observe: 'response'
    }).pipe(
      map(response => {
        if (!response.body) {
          throw new Error('La respuesta del servidor está vacía');
        }
        return response.body;
      }),
      catchError(this.handleError)
    );
  }

  searchByNombre(nombre: string): Observable<Producto[]> {
    if (!nombre || nombre.trim().length === 0) {
      return throwError(() => new Error('El término de búsqueda no puede estar vacío'));
    }

    const params = new HttpParams().set('nombre', nombre.trim());
    
    return this.http.get<Producto[]>(`${this.apiUrl}/api/productos/search`, {
      headers: this.defaultHeaders,
      params: params,
      observe: 'response'
    }).pipe(
      map(response => {
        if (!response.body) {
          return [];
        }
        return response.body;
      }),
      catchError(this.handleError)
    );
  }

  getProductoById(id: number): Observable<Producto> {
    if (!id || id <= 0) {
      return throwError(() => new Error('ID de producto inválido'));
    }

    return this.http.get<Producto>(`${this.apiUrl}/api/productos/${id}`, {
      headers: this.defaultHeaders,
      observe: 'response'
    }).pipe(
      map(response => {
        if (!response.body) {
          throw new Error('Producto no encontrado');
        }
        return response.body;
      }),
      catchError(this.handleError)
    );
  }

  createProducto(producto: Producto): Observable<Producto> {
    if (!producto) {
      return throwError(() => new Error('Datos del producto no proporcionados'));
    }

    return this.http.post<Producto>(`${this.apiUrl}/api/productos`, producto, {
      headers: this.defaultHeaders,
      observe: 'response'
    }).pipe(
      map(response => {
        if (!response.body) {
          throw new Error('No se recibió respuesta del servidor');
        }
        return response.body;
      }),
      catchError(this.handleError)
    );
  }

  updateProducto(id: number, producto: Producto): Observable<Producto> {
    if (!id || id <= 0) {
      return throwError(() => new Error('ID de producto inválido'));
    }
    if (!producto) {
      return throwError(() => new Error('Datos del producto no proporcionados'));
    }

    return this.http.put<Producto>(`${this.apiUrl}/api/productos/${id}`, producto, {
      headers: this.defaultHeaders,
      observe: 'response'
    }).pipe(
      map(response => {
        if (!response.body) {
          throw new Error('No se recibió respuesta del servidor');
        }
        return response.body;
      }),
      catchError(this.handleError)
    );
  }

  deleteProducto(id: number): Observable<void> {
    if (!id || id <= 0) {
      return throwError(() => new Error('ID de producto inválido'));
    }

    return this.http.delete<void>(`${this.apiUrl}/api/productos/${id}`, {
      headers: this.defaultHeaders,
      observe: 'response'
    }).pipe(
      map(() => { return; }),
      catchError(this.handleError)
    );
  }

  // Métodos para relaciones
  getByCategoria(categoriaId: number): Observable<Producto[]> {
    if (!categoriaId || categoriaId <= 0) {
      return throwError(() => new Error('ID de categoría inválido'));
    }

    return this.http.get<Producto[]>(`${this.apiUrl}/api/productos/categoria/${categoriaId}`, {
      headers: this.defaultHeaders,
      observe: 'response'
    }).pipe(
      map(response => {
        if (!response.body) {
          return [];
        }
        return response.body;
      }),
      catchError(this.handleError)
    );
  }

  getByColeccion(coleccionId: number): Observable<Producto[]> {
    if (!coleccionId || coleccionId <= 0) {
      return throwError(() => new Error('ID de colección inválido'));
    }

    return this.http.get<Producto[]>(`${this.apiUrl}/api/productos/coleccion/${coleccionId}`, {
      headers: this.defaultHeaders,
      observe: 'response'
    }).pipe(
      map(response => {
        if (!response.body) {
          return [];
        }
        return response.body;
      }),
      catchError(this.handleError)
    );
  }

  getByRareza(rarezaId: number): Observable<Producto[]> {
    if (!rarezaId || rarezaId <= 0) {
      return throwError(() => new Error('ID de rareza inválido'));
    }

    return this.http.get<Producto[]>(`${this.apiUrl}/api/rarezas/${rarezaId}/productos`, {
      headers: this.defaultHeaders,
      observe: 'response'
    }).pipe(
      map(response => {
        if (!response.body) {
          return [];
        }
        return response.body;
      }),
      catchError(this.handleError)
    );
  }

  getByEstado(estadoId: number): Observable<Producto[]> {
    if (!estadoId || estadoId <= 0) {
      return throwError(() => new Error('ID de estado inválido'));
    }

    return this.http.get<Producto[]>(`${this.apiUrl}/api/productos/estado/${estadoId}`, {
      headers: this.defaultHeaders,
      observe: 'response'
    }).pipe(
      map(response => {
        if (!response.body) {
          return [];
        }
        return response.body;
      }),
      catchError(this.handleError)
    );
  }
}