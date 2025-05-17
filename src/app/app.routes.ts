import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { HelloWorldComponent } from './pages/hello-world/hello-world.component';
import { CatalogoComponent } from './pages/catalogo/catalogo.component';

export const routes: Routes = [
    { 
        path: '', 
        component: HomeComponent,
        pathMatch: 'full' // Añadido para mejor precisión en la ruta raíz
    },
    { 
        path: 'catalogo', 
        component: CatalogoComponent,
        title: 'Catálogo de Productos' // Mejor práctica: añadir título de página
    },
    { 
        path: 'hola-mundo', 
        component: HelloWorldComponent,
        title: 'Hola Mundo'
    },
    { 
        path: '**', 
        redirectTo: '', // Manejo de rutas no encontradas
        pathMatch: 'full'
    }
];