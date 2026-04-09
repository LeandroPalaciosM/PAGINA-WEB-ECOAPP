//Autor: Gabriela Gonzalez
//Fecha: 20/01/2026
//Descripción: Servicio de autenticación para gestionar el login, logout y manejo de tokens JWT en la aplicación de gestión ambiental
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5164/api/Auth'; 
  private tokenKey = 'token'; 
  private timeoutId: any; 
  
constructor(private http: HttpClient, private router: Router) {
}
  login(correo: string, contrasena: string) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { correo, contrasena });
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.iniciarTemporizador(60); 
  }

  private iniciarTemporizador(minutos: number) {
    if (this.timeoutId) clearTimeout(this.timeoutId);

    const milisegundos = minutos * 60 * 1000;

    this.timeoutId = setTimeout(() => {
      alert('¡SESIÓN EXPIRADA!\n\nTu sesión ha finalizado por seguridad.\nPor favor, ingresa de nuevo.');
      this.logout(); 
    }, milisegundos);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout(): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    localStorage.removeItem(this.tokenKey); 
    this.router.navigate(['/login']); 
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const decoded: any = jwtDecode(token);
    return decoded['role'] || null; 
  }

  getUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const decoded: any = jwtDecode(token);
    return decoded['username'] || null;
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    const decoded: any = jwtDecode(token);
    return decoded['id_user'] ? Number(decoded['id_user']) : null;
  }

  isLoggedIn(): boolean {
  const token = this.getToken();
  if (!token) return false;

  try {
    const decoded: any = jwtDecode(token);
    const ahora = Math.floor(Date.now() / 1000); 
    
    if (decoded.exp && decoded.exp < ahora) {
      this.logout(); 
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

}