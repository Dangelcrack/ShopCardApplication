import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Producto } from '../models/producto.model';
import { environment } from '../../environments/environment';

/**
 * Servicio general para interactuar con la API RESTful.
 * Proporciona métodos CRUD y de consulta para productos y relaciones.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  /** URL base de la API, definida en el environment */
  private apiUrl = environment.apiUrl; // https://monarch-sweeping-flounder.ngrok-free.app
  /** Encabezados HTTP por defecto para todas las peticiones */
  private defaultHeaders: HttpHeaders;

  /**
   * Inyecta HttpClient y configura los encabezados por defecto.
   */
  constructor(private http: HttpClient) { 
    this.defaultHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    });
  }

  /**
   * Maneja errores de las peticiones HTTP y devuelve mensajes personalizados.
   * @param error Error HTTP recibido
   * @returns Observable que lanza un error con mensaje amigable
   */
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

  /**
   * Obtiene todos los productos.
   * @returns Observable con la lista de productos
   */
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

  /**
   * Busca productos por nombre.
   * @param nombre Nombre a buscar
   * @returns Observable con la lista de productos encontrados
   */
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

  /**
   * Obtiene un producto por su ID.
   * @param id ID del producto
   * @returns Observable con el producto encontrado
   */
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

  /**
   * Crea un nuevo producto.
   * @param producto Objeto producto a crear
   * @returns Observable con el producto creado
   */
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

  /**
   * Actualiza un producto existente.
   * @param id ID del producto a actualizar
   * @param producto Objeto producto actualizado
   * @returns Observable con el producto actualizado
   */
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

  /**
   * Elimina un producto por su ID.
   * @param id ID del producto a eliminar
   * @returns Observable vacío
   */
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

  /**
   * Obtiene productos por categoría.
   * @param categoriaId ID de la categoría
   * @returns Observable con la lista de productos
   */
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

  /**
   * Obtiene productos por colección.
   * @param coleccionId ID de la colección
   * @returns Observable con la lista de productos
   */
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

  /**
   * Obtiene productos por rareza.
   * @param rarezaId ID de la rareza
   * @returns Observable con la lista de productos
   */
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

  /**
   * Obtiene productos por estado.
   * @param estadoId ID del estado
   * @returns Observable con la lista de productos
   */
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