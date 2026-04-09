// Nombre del autor: Leandro Rene Palacios Moriel
// Fecha: 20/01/2026

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Usuario } from '../models/Usuario';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private usuarioUrl = "http://localhost:5164/api/Usuarios";

  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.usuarioUrl);
  }

  addUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.usuarioUrl, usuario);
  }

  crearNuevoUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.usuarioUrl, usuario);
  }

  updateUsuario(usuario: Usuario): Observable<any> {
      return this.http.put(`${this.usuarioUrl}/${usuario.id_user}`, usuario);
  }

  deleteUsuario(id_user: number): Observable<void> {
      return this.http.delete<void>(`${this.usuarioUrl}/${id_user}`);
  }

  searchUsuarios(termino: string): Observable<Usuario[]> {
      return this.http.get<Usuario[]>(this.usuarioUrl).pipe(
        map(usuarios =>
          usuarios.filter(u =>
            u.nombre.toLowerCase().includes(termino) ||
            u.apellido.toLowerCase().includes(termino)
        )
      )
    );
  }

  desactivarUsuario(id_user: number): Observable<any> {
    const url = `${this.usuarioUrl}/deactivate/${id_user}`;
    
    return this.http.put(url, {}); 
  }

  searchUsuariosServer(nombre?: string, apellido?: string, rol?: string): Observable<Usuario[]> {
    let params = new HttpParams();

    if (nombre) {
      params = params.set('nombre', nombre);
    }
    if (apellido) {
      params = params.set('apellido', apellido);
    }
    if (rol) {
      params = params.set('rol', rol);
    }

    return this.http.get<Usuario[]>(`${this.usuarioUrl}/search`, { params });
  }

  getUsuarioById(id_user: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.usuarioUrl}/${id_user}`);
  }

}