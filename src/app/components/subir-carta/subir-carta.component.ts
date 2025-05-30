import { Component } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-subir-carta',
  template: `
    <input type="file" (change)="onFileSelected($event)" accept="image/*">
    <button (click)="uploadImage()">Subir Carta</button>
    <p *ngIf="uploadSuccess">¡Imagen subida con éxito!</p>
  `
})
export class SubirCartaComponent {
  selectedFile: File | null = null;
  uploadSuccess = false;

  constructor(private supabase: SupabaseService) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async uploadImage() {
    if (!this.selectedFile) return;
    
    try {
      const imageUrl = await this.supabase.uploadImage(
        this.selectedFile,
      );
      this.uploadSuccess = true;
      console.log('URL de la imagen:', imageUrl);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al subir la imagen');
    }
  }
}