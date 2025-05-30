import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { Coleccion } from '../models/coleccion.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ColeccionService {
  private apiUrl = `${environment.apiUrl}/colecciones`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Coleccion[]> {
    return this.http.get<Coleccion[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error al obtener colecciones:', error);
        return of([]);
      })
    );
  }
}