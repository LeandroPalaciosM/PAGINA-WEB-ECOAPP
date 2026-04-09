/**
 * Autores: Todos
 * Fecha: 2026-02-04
 * Descripción: Rutas de la aplicación con Seguridad JWT y Roles estrictos.
 */
import { Routes } from '@angular/router';
import { IniciativasCrud } from './components/Iniciativas-crud/iniciativas-crud'; 
import { ActividadesCrud } from './components/Actividades-crud/actividades-crud';
import { Inicio } from './components/Inicio/inicio';
import { ReportesCrudComponent } from './components/reportes-crud/reportes-crud';
import { UsuariosCrud } from './components/usuarios-crud/usuarios-crud';
import { Perfil } from './components/perfil/perfil';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { MisInscripcionesComponent } from './components/mis-inscripciones/mis-inscripciones';
import { ParticipacionCrud } from './components/Participacion-crud/participacion-crud';
import { CategoriasCrud } from './components/categorias-crud/categorias-crud'; 
import { AuthGuard } from './guards/auth.guard'; 
import { ActividadesDisponiblesComponents } from './components/actividades-disponibles/actividades-disponibles';

export const routes: Routes = [

  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro }, 
  { path: 'inicio', component: Inicio }, 

  { 
    path: 'perfil', 
    component: Perfil, 
    canActivate: [AuthGuard] 
  },

  { 
    path: 'participaciones', 
    component: ParticipacionCrud, 
    canActivate: [AuthGuard],
    data: { roles: ['Administrador', 'Coordinador', 'Voluntario'] } 
  },
  
  {
    path: 'mis-inscripciones', 
    component: MisInscripcionesComponent, 
    canActivate: [AuthGuard],
    data: { roles: ['Voluntario', 'Coordinador', 'Administrador'] } 
  },

  {
    path: 'actividades-disponibles', 
    component: ActividadesDisponiblesComponents, 
    data: { roles: ['Voluntario', 'Administrador', 'Coordinador'] } 
  },

  {
    path: 'actividades-disponibles/:id', 
    component: ActividadesDisponiblesComponents, 
    data: { roles: ['Voluntario', 'Administrador', 'Coordinador'] } 
  },

  { 
    path: 'iniciativas', 
    component: IniciativasCrud, 
    canActivate: [AuthGuard],
    data: { roles: ['Administrador', 'Coordinador'] }
  },
  { 
    path: 'actividades', 
    component: ActividadesCrud, 
    canActivate: [AuthGuard],
    data: { roles: ['Administrador', 'Coordinador'] }
  },

  { 
    path: 'reportes', 
    component: ReportesCrudComponent, 
    canActivate: [AuthGuard],
    data: { roles: ['Administrador', 'Coordinador'] }
  },

  { 
    path: 'usuarios', 
    component: UsuariosCrud, 
    canActivate: [AuthGuard], 
    data: { roles: ['Administrador'] } 
  },
  
  { 
    path: 'categorias', 
    component: CategoriasCrud, 
    canActivate: [AuthGuard], 
    data: { roles: ['Administrador'] } 
  },

  { path: '**', redirectTo: 'inicio' }
];