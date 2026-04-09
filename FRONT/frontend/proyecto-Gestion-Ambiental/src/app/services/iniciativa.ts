//Autor:Sebastian Mendoza
//Fecha: 20/01/2026
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Iniciativa } from '../models/Iniciativa';

@Injectable({
  providedIn: 'root'
})
export class IniciativaService {
  
  private iniciUrl = "http://localhost:5164/api/Iniciativas";

  constructor(private http: HttpClient) {}

  getIniciativas(): Observable<Iniciativa[]> {
    return this.http.get<Iniciativa[]>(this.iniciUrl);
  }

  getIniciativaById(id: number): Observable<Iniciativa> {
    return this.http.get<Iniciativa>(`${this.iniciUrl}/${id}`);
  }

  createIniciativa(iniciativa: Iniciativa): Observable<Iniciativa> {
    return this.http.post<Iniciativa>(this.iniciUrl, iniciativa);
  }

  updateIniciativa(id: number, iniciativa: Iniciativa): Observable<any> {
    return this.http.put(`${this.iniciUrl}/${id}`, iniciativa);
  }

  deleteIniciativa(id: number): Observable<any> {
    return this.http.delete(`${this.iniciUrl}/${id}`);
  }

  getIniciativasVoluntario(): Observable<Iniciativa[]> {
    return this.http.get<Iniciativa[]>(`${this.iniciUrl}/voluntario`);
  }

  desactivarIniciativa(id: number): Observable<void> {
    return this.http.put<void>(`${this.iniciUrl}/desactivar/${id}`, {});
  }
  searchIniciativas(search: string): Observable<Iniciativa[]> {
    return this.http.get<Iniciativa[]>(
      `${this.iniciUrl}/search?search=${search}`
    );
  }
}