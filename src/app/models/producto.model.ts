export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  imagenUrl?: string;
  numeroCarta?: number;
  categoria: Categoria;
  coleccion: Coleccion;
  rareza: Rareza;
  estado: EstadoProducto;
  precioOriginal?: number;
  valoraciones?: Valoracion[];
  fecha_creacion: Date;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  imagenUrl?: string;
}

export interface Coleccion {
  id: number;
  nombre: string;
  fechaLanzamiento: Date;
  imagenUrl?: string;
  descripcion?: string;
}

export interface Rareza {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface EstadoProducto {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Valoracion {
  id: number; // Cambiado a requerido
  usuario: { // Objeto usuario en lugar de solo ID
    id: number;
    nombre: string;
    avatarUrl?: string;
  };
  productoId: number;
  puntuacion: number; // Debería ser entre 1 y 5
  comentario: string; // Cambiado a requerido (o string vacío si no hay comentario)
  fecha: Date; // Cambiado a requerido
  actualizado?: Date; // Opcional para ediciones
}