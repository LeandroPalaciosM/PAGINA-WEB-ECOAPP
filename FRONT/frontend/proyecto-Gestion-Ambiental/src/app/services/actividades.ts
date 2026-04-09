//Autora:Lilibeth Torres
//Fecha: 20/01/2026
//Descripción: Servicio para gestionar las actividades ambientales
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Actividad } from '../models/Actividad';

@Injectable({
  providedIn: 'root'
})
export class ActividadService {

  private apiUrl = "http://localhost:5164/api/Actividads"; 

  constructor(private http: HttpClient) { }


  getActividades(): Observable<Actividad[]> {
    return this.http.get<Actividad[]>(this.apiUrl);
  }

  getActividadesActivas(): Observable<Actividad[]> {
    return this.http.get<Actividad[]>(`${this.apiUrl}/activas`);
  }

  getActividadById(id: number): Observable<Actividad> {
    return this.http.get<Actividad>(`${this.apiUrl}/${id}`);
  }

  getActividadConDetalles(id: number): Observable<Actividad> {
    return this.http.get<Actividad>(`${this.apiUrl}/detalles/${id}`);
  }


  searchActividades(nombre: string): Observable<Actividad[]> {
    return this.http.get<Actividad[]>(`${this.apiUrl}/buscar?nombre=${nombre}`);
  }

  getActividadesPorLugar(lugar: string): Observable<Actividad[]> {
    return this.http.get<Actividad[]>(`${this.apiUrl}/buscarPorLugar?lugar=${lugar}`);
  }


  createActividad(actividad: Actividad): Observable<Actividad> {
    return this.http.post<Actividad>(this.apiUrl, actividad);
  }

  updateActividad(id: number, actividad: Actividad): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, actividad);
  }


  deleteActividad(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getMisInscripciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/InscripcionesVoluntarios`);
  }

  inscribirse(idActividad: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${idActividad}/Inscribirse`, {});
  }

  getActividadesPorIniciativa(id: number): Observable<Actividad[]> {
    return this.http.get<Actividad[]>(`${this.apiUrl}/por-iniciativa/${id}`);
  }
}