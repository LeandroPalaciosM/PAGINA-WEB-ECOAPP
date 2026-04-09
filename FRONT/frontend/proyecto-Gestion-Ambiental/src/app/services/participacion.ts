/**
 * Autora: Gabriela Solange Gonzalez Roman
 * Fecha: 2026-01-27
 * Descripción: Servicio para manejar Participaciones.
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Participacion } from '../models/Participacion'; 

@Injectable({
  providedIn: 'root',
})
export class ParticipacionService {
  
  private participacionUrl = "http://localhost:5164/api/Participacions"; 
  
  constructor(private http: HttpClient){}

  getParticipacion(): Observable<Participacion[]>{
      return this.http.get<Participacion[]>(this.participacionUrl);
  }

  getParticipacionesConfirmadas(): Observable<Participacion[]>{
      return this.http.get<Participacion[]>(this.participacionUrl)
      .pipe(map(                                  
        (lista) => lista.filter(p => p.estado === 'Confirmado')
    ));
  } 

  searchParticipacions(termino: string): Observable<Participacion[]>{
      return this.http.get<Participacion[]>(this.participacionUrl)
      .pipe(map(                                              
        (lista) => lista.filter(p => 
            p.rol_en_actividad.toLowerCase().includes(termino.toLowerCase()) || 
            (p.observaciones && p.observaciones.toLowerCase().includes(termino.toLowerCase()))
        )
    ));
  } 

  getParticipacionById(id: number): Observable<Participacion>{
    return this.http.get<Participacion>(`${this.participacionUrl}/${id}`);
  }
  
  addParticipacion(participacion: Participacion): Observable<Participacion>{
    return this.http.post<Participacion>(this.participacionUrl, participacion);
  }

  updateParticipacion(participacion: Participacion): Observable<Participacion>{
    const urlEditar = `${this.participacionUrl}/${participacion.id_participacion}`;
    return this.http.put<Participacion>(urlEditar, participacion);
  }

  deleteParticipacion(id: number): Observable<void>{
    const urlEliminar = `${this.participacionUrl}/${id}`;
    return this.http.delete<void>(urlEliminar);
  }

  getMisInscripciones(): Observable<Participacion[]> {
    return this.http.get<Participacion[]>(`${this.participacionUrl}/mis-inscripciones`);
  }

  registrarInscripcion(datos: any): Observable<any> {
  return this.http.post(this.participacionUrl, datos);
}
}