//Autor:Eduardo Chavez
export interface Reporte {
    id_reporte?: number;
    descripcion: string;
    fecha?: string | Date; 
    observaciones?: string;
    aprobado?: boolean;
        
    id_actividad?: number;
    id_user?: number;       
    id_iniciativa?: number; 

    id_actividadNavigation?: any;
    id_iniciativaNavigation?: any;
    id_userNavigation?: any;
}