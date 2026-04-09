// Nombre del autor: Leandro Rene Palacios Moriel
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService); 
  const router = inject(Router); 
  const token = authService.getToken();    

  let clonedRequest = req;

 if (token) {
    clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return next(clonedRequest).pipe(
  catchError((error: HttpErrorResponse) => {
    if (error.status === 401) {
      authService.logout();
      router.navigateByUrl('/login?expirado=true'); 
    }
    return throwError(() => error);
  })
);
};