import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EstadoProducto } from '../models/estado-producto.model';

@Injectable({
  providedIn: 'root'
})
export class EstadoProductoService {
  private apiUrl = `${environment.apiUrl}/estados-producto`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<EstadoProducto[]> {
    return this.http.get<EstadoProducto[]>(this.apiUrl);
  }

  getById(id: number): Observable<EstadoProducto> {
    return this.http.get<EstadoProducto>(`${this.apiUrl}/${id}`);
  }
}