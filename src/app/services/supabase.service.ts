import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Producto } from '../models/producto.model';

/**
 * Servicio para interactuar con Supabase.
 * Permite obtener productos y gestionar imágenes en Supabase Storage.
 */
@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  /** Instancia del cliente de Supabase */
  private supabase: SupabaseClient;
  /** Nombre del bucket de imágenes en Supabase Storage */
  private bucketName = 'cartas-pokemon'; // Nombre de tu bucket en Supabase Storage

  /**
   * Inicializa el cliente de Supabase con las credenciales del environment.
   */
  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  /**
   * Obtiene todos los productos desde la tabla 'productos' de Supabase.
   * @returns Promesa con la lista de productos
   */
  async getAllProductos(): Promise<Producto[]> {
    const { data, error } = await this.supabase
      .from('productos')
      .select('*');
    
    if (error) throw error;
    
    return (data as any[]).map((producto: any) => ({
      ...producto,
      imagen_url: producto.imagen_path ? this.getImageUrl(producto.imagen_path) : null
    })) as Producto[];
  }

  /**
   * Busca productos por nombre usando ilike (búsqueda insensible a mayúsculas/minúsculas).
   * @param nombre Nombre a buscar
   * @returns Promesa con la lista de productos encontrados
   */
  async searchByNombre(nombre: string): Promise<Producto[]> {
    const { data, error } = await this.supabase
      .from('productos')
      .select('*')
      .ilike('nombre', `%${nombre}%`);
    
    if (error) throw error;
    
    return (data as any[]).map((producto: any) => ({
      ...producto,
      imagen_url: producto.imagen_path ? this.getImageUrl(producto.imagen_path) : null
    })) as Producto[];
  }

  /**
   * Obtiene la URL pública de una imagen almacenada en Supabase Storage.
   * @param path Ruta de la imagen en el bucket
   * @returns URL pública de la imagen
   */
  private getImageUrl(path: string): string {
    const { data: { publicUrl } } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(path);
    return publicUrl;
  }

  /**
   * Sube una imagen al bucket de Supabase Storage.
   * @param file Archivo a subir
   * @returns Promesa con el nombre del archivo subido (path)
   */
  async uploadImage(file: File): Promise<string> {
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(fileName, file);

    if (error) throw error;

    return fileName; // Retorna solo el path, no la URL completa
  }
}