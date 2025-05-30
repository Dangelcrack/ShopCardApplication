import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Rareza } from '../models/rareza.model';

@Injectable({
  providedIn: 'root'
})
export class RarezaService {
  private apiUrl = `${environment.apiUrl}/rarezas`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todas las rarezas disponibles
   * @returns Observable con array de Rareza
   */
  getAll(): Observable<Rareza[]> {
    return this.http.get<Rareza[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error al obtener rarezas:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene una rareza específica por ID
   * @param id ID de la rareza
   * @returns Observable con Rareza o null si hay error
   */
  getById(id: number): Observable<Rareza | null> {
    return this.http.get<Rareza>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Error al obtener rareza con ID ${id}:`, error);
        return of(null);
      })
    );
  }
}