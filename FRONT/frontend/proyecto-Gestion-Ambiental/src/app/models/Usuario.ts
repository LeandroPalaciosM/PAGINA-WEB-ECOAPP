//autor:Leandro Palacios
export interface Usuario {
    id_user: number;
    nombre: string;
    apellido: string;
    correo: string;
    contrasena: string;
    rol: 'Administrador' | 'Coordinador' | 'Voluntario';
    estado: string;
}