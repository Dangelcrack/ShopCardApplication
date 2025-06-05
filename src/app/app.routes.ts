import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CatalogoComponent } from './pages/catalogo/catalogo.component';
import { RarezasComponent } from './pages/rarezas/rarezas.component';
import { SobreNosotrosComponent } from './pages/sobre-nosotros/sobre-nosotros.component';

/**
 * Definición de las rutas principales de la aplicación.
 * Cada ruta asocia una URL con un componente y un título de página.
 */
export const routes: Routes = [
  { 
    path: '', 
    component: HomeComponent,
    pathMatch: 'full',
    title: 'Inicio - Magic Card Haven' 
  },
  { 
    path: 'catalogo', 
    component: CatalogoComponent,
    title: 'Catálogo de Cartas',
  },
  { 
    path: 'rarezas', 
    component: RarezasComponent,
    title: 'Niveles de Rareza',
  },
  { 
    path: 'nosotros', 
    component: SobreNosotrosComponent,
    title: 'Sobre Nosotros',
  },
  { 
    path: '**', 
    redirectTo: '',
    pathMatch: 'full' 
  }
];