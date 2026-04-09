// Autora: Dominica Torres

export interface Actividad {
  id_actividad?: number;     
  id_iniciativa: number;     

  nombre: string;           
  descripcion: string;      
  fecha: string;            
  lugar: string;           
  cupo_maximo: number;       
  estado: string;          
}