import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router'; // <--- 1. Importamos Router
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'GestionAmbiental';

  constructor(public auth: AuthService, public router: Router) {}

  esPaginaAuth(): boolean {
    const url = this.router.url;
    return url.includes('/login') || url.includes('/registro');
  }
}