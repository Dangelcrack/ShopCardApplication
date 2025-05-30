import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { Categoria } from '../models/categoria.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = `${environment.apiUrl}/categorias`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las categorías disponibles
   * @returns Observable con array de Categoria
   */
  getAll(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error al obtener categorías:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene una categoría específica por ID
   * @param id ID de la categoría
   * @returns Observable con Categoria o null si hay error
   */
  getById(id: number): Observable<Categoria | null> {
    return this.http.get<Categoria>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Error al obtener categoría con ID ${id}:`, error);
        return of(null);
      })
    );
  }
}