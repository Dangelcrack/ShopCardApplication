import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private bucketName = 'cartas-pokemon'; // Nombre de tu bucket en Supabase Storage

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

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

  private getImageUrl(path: string): string {
    const { data: { publicUrl } } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(path);
    return publicUrl;
  }

  async uploadImage(file: File): Promise<string> {
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(fileName, file);

    if (error) throw error;

    return fileName; // Retorna solo el path, no la URL completa
  }
}