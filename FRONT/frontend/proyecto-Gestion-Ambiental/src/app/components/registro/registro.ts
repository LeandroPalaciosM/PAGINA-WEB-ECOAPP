/* Autor: Leandro Palacios */
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../services/usuario';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],  
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  formRegistro: FormGroup;
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private apiService: UsuarioService,
    private router: Router
  ) {
    this.formRegistro = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3),Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)]],
      apellido: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.formRegistro.invalid) {
      this.formRegistro.markAllAsTouched();
      return;
    }

    this.cargando = true;
    const datosForm = this.formRegistro.value;

    const nuevoUsuario = {
      ...datosForm,
      rol: 'Voluntario', 
      estado: 'Activo'   
    };

    this.apiService.addUsuario(nuevoUsuario).subscribe({
      next: () => {
        alert('¡Cuenta creada con éxito! Bienvenido a Eco App.');
        this.router.navigate(['/login']); 
      },
      error: (err) => {
        this.cargando = false;
        alert('Error al registrar: El correo ya podría estar en uso o el servidor no responde.');
        console.error(err);
      }
    });
  }
}
