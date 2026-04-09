//Autora: Gabriela Gonzalez
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    
    if (!this.authService.isLoggedIn()) {
      this.authService.logout(); 
      this.router.navigate(['/login'], { queryParams: { expirado: 'true' } });
      return false;
    }

    const allowedRoles = route.data?.['roles'] as string[] | undefined;
    const userRole = this.authService.getUserRole();

    if (!userRole) {
      this.authService.logout(); 
      this.router.navigate(['/login']);
      return false;
    }

    if (allowedRoles) {
      const rolTokenLimpio = userRole.trim().toLowerCase();
      
      const tienePermiso = allowedRoles.some(r => r.trim().toLowerCase() === rolTokenLimpio);

      if (!tienePermiso) {
        
        Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para acceder a esta sección.',
            timer: 3000,
            showConfirmButton: false
        });

        this.router.navigate(['/inicio']);
        return false;
      }
    }

    return true;
  }
}