/* Autor: Leandro Palacios */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; 
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule], 
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  form: FormGroup;
  error: string | null = null;
  mensajeSesion: string | null = null;

  constructor(
    private fb: FormBuilder, 
    private auth: AuthService, 
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required]]
    });
  }
  
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['expirado'] === 'true') {
        this.mensajeSesion = 'Su sesión ha expirado por seguridad. Por favor, ingrese de nuevo.';
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const { correo, contrasena } = this.form.value;

      this.auth.login(correo, contrasena).subscribe({
        next: (res) => {
          this.auth.saveToken(res.token);
          this.router.navigate(['/perfil']); 
        },
        error: (err) => {
          if (err.status === 403) {
            this.error = 'Tu cuenta ha sido desactivada por el administrador.';
          } else if (err.status === 401) {
            this.error = 'Correo o contraseña incorrectos.';
          } else {
            this.error = 'Error de conexión con el servidor.';
          }
          console.error('Error en login:', err);
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}