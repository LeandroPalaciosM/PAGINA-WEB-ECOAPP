//  <!--Nombre del autor: Sebastian Mendoza-->
export interface Iniciativa {
  id_iniciativa: number;
  nombre: string;
  descripcion: string;        
  fecha_inicio: string;
  fecha_fin: string;                  
  estado: 'Planificada' | 'En Progreso' | 'Finalizada' | 'Activo'; 
  id_categoria: number; 
  
  id_categoriaNavigation?: {
    nombre: string;
    descripcion: string;
    estado: string;
  };
}