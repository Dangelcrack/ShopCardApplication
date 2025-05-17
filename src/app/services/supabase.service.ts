import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  async uploadImage(file: File, folder: string): Promise<string> {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await this.supabase.storage
      .from(folder)
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = this.supabase.storage
      .from(folder)
      .getPublicUrl(fileName);

    return publicUrl;
  }
}