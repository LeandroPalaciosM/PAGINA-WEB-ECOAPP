/* Autor: Leandro Palacios */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; 
import { Usuario } from '../../models/Usuario';
import { UsuarioService } from '../../services/usuario';
import { AuthService } from '../../services/auth.service'; // Para el token y logout 
import { SectionHeader } from '../../shared/components/section-header/section-header';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, SectionHeader, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  usuario: Usuario | null = null;
  formPerfil!: FormGroup;
  editando: boolean = false;

  constructor(private apiService: UsuarioService, private auth: AuthService, private fb: FormBuilder) 
  {
  this.initForm();  
  }

  ngOnInit(): void {
    const idDelToken = this.auth.getUserId(); 

    if (idDelToken) {
      this.apiService.getUsuarioById(idDelToken).subscribe({
        next: (data) => {
          this.usuario = data;
          this.formPerfil.patchValue(data);
          console.log('Perfil sincronizado con la API');
        },
        error: (err) => console.error('Error al conectar con la API de .NET', err)
      });
    }
  }

  toggleEdicion(): void {
    this.editando = !this.editando;
    if (this.editando) {
      this.formPerfil.get('nombre')?.enable();
      this.formPerfil.get('apellido')?.enable();
      this.formPerfil.get('contrasena')?.enable();
    } else {
      this.formPerfil.disable();
      if (this.usuario) this.formPerfil.patchValue(this.usuario);
    }
  }
  
  initForm(): void {
    this.formPerfil = this.fb.group({
      nombre: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(6)]],
      apellido: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(6)]],
      correo: [{ value: '', disabled: true }], 
      rol: [{ value: '', disabled: true }], 
      contrasena: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(6)]],
      estado: [{ value: '', disabled: true }]
    });
  }

  actualizarMisDatos(): void {
    if (this.formPerfil.valid) {
      const datosActualizados = {
        ...this.formPerfil.getRawValue(),
        id_user: this.usuario?.id_user
      };

      this.apiService.updateUsuario(datosActualizados).subscribe({
        next: () => {
          alert('Información actualizada correctamente');
          
          this.apiService.getUsuarioById(Number(this.usuario?.id_user)).subscribe(data => {
            this.usuario = data; 
            this.formPerfil.patchValue(data); 
            this.editando = false; 
            this.formPerfil.disable();
          });
        },
        error: (err) => console.error('Error al actualizar', err)
      });
    }
  }
  salir(): void {
    if(confirm('¿Deseas cerrar tu sesión?')) {
      this.auth.logout();
    }
  }
}