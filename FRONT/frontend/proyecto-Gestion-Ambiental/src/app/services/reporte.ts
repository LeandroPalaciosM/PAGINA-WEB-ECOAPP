//Autor: Eduardo Chavez
//Fecha: 20/01/2026
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Reporte } from '../models/Reporte';

@Injectable({
  providedIn: 'root',
})
export class ReporteService {
  private reporteUrl = "http://localhost:5164/api/Reportes";

  private handleError(error: HttpErrorResponse) {
    console.error('Error en ReporteService:', error);
    return throwError(() => new Error(error.message || 'Error en la petición de reportes'));
  }
  constructor(private http: HttpClient) {}
  getTodosLosReportes(): Observable<Reporte[]> {
    return this.http.get<Reporte[]>(this.reporteUrl).pipe(
      catchError(this.handleError)
    );
  }
  getMisReportes(): Observable<Reporte[]> {
  return this.http.get<Reporte[]>(`${this.reporteUrl}/mis-reportes`);
}
  addReporte(reporte: Reporte): Observable<Reporte> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.post<Reporte>(this.reporteUrl, reporte, { headers });
  } 

  updateReporte(reporte: Reporte): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.put(`${this.reporteUrl}/${reporte.id_reporte}`, reporte, { headers });
  }

  deleteReporte(id: number): Observable<void> {
    return this.http.delete<void>(`${this.reporteUrl}/${id}`);
  }

  searchReportes(termino: string): Observable<Reporte[]> {
    return this.getTodosLosReportes().pipe(
      map(reportes =>
        reportes.filter(r =>
          r.descripcion?.toLowerCase().includes(termino.toLowerCase()) ||
          r.id_actividadNavigation?.nombre?.toLowerCase().includes(termino.toLowerCase())
        )
      )
    );
  }
  buscarPorDescripcion(termino: string): Observable<Reporte[]> {
    return this.http.get<Reporte[]>(`${this.reporteUrl}/buscar/descripcion/${termino}`);
  }

  filtrarPorFechas(inicio: string, fin: string): Observable<Reporte[]> {
    return this.http.get<Reporte[]>(`${this.reporteUrl}/filtrar/fechas?inicio=${inicio}&fin=${fin}`);
  }
  
}