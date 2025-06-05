import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EstadoProducto } from '../models/estado-producto.model';

/**
 * Servicio para gestionar los estados de los productos.
 * Permite obtener todos los estados o uno específico desde la API.
 */
@Injectable({
  providedIn: 'root'
})
export class EstadoProductoService {
  /** URL base para los estados de producto en la API */
  private apiUrl = `${environment.apiUrl}/estados-producto`;

  /**
   * Inyecta HttpClient para realizar peticiones HTTP.
   */
  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los estados de producto desde la API.
   * @returns Observable con la lista de estados de producto
   */
  getAll(): Observable<EstadoProducto[]> {
    return this.http.get<EstadoProducto[]>(this.apiUrl);
  }

  /**
   * Obtiene un estado de producto por su ID.
   * @param id ID del estado de producto
   * @returns Observable con el estado de producto encontrado
   */
  getById(id: number): Observable<EstadoProducto> {
    return this.http.get<EstadoProducto>(`${this.apiUrl}/${id}`);
  }
}