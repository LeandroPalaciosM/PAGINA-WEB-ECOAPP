/**Autor:Gabriela Gonzalez
  * Fecha: 2026/01/27
  * Descripción: Modelo para representar participación en proyectos.
  */

export interface Participacion {
  id_participacion?: number; 
  id_user: number;
  id_actividad: number;
  fecha_inscripcion: string; 
  rol_en_actividad: string;
  observaciones?: string;   
  estado: string;             
  
  id_userNavigation?: {
    nombre: string;
    apellido: string;
    correo: string;
  };

  id_actividadNavigation?: {
    nombre: string;
    descripcion: string;
    lugar: string;
  };
}
