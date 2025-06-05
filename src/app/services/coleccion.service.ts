import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { Coleccion } from '../models/coleccion.model';
import { environment } from '../../environments/environment';

/**
 * Servicio para gestionar las colecciones de productos.
 * Permite obtener todas las colecciones desde la API.
 */
@Injectable({
  providedIn: 'root'
})
export class ColeccionService {
  /** URL base para las colecciones en la API */
  private apiUrl = `${environment.apiUrl}/colecciones`;

  /**
   * Inyecta HttpClient para realizar peticiones HTTP.
   */
  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las colecciones desde la API.
   * @returns Observable con la lista de colecciones o un array vacío en caso de error
   */
  getAll(): Observable<Coleccion[]> {
    return this.http.get<Coleccion[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error al obtener colecciones:', error);
        return of([]);
      })
    );
  }
}