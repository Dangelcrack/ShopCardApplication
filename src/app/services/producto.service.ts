import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'http://localhost:8080/api/productos'; // Cambia esta URL en producción

  constructor(private http: HttpClient) { }

  // Obtener todos los productos
  getAllProductos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Buscar por nombre
  searchByNombre(nombre: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search/${nombre}`);
  }

  // Obtener por categoría
  getByCategoria(categoriaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categoria/${categoriaId}`);
  }
}