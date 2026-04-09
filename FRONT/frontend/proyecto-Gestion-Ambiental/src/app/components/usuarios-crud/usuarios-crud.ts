import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Usuario } from '../../models/Usuario';
import { UsuarioService } from '../../services/usuario';
import { Route,Router } from '@angular/router';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { GenericTableComponent } from '../../shared/components/generic-table/generic-table';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FeedbackComponent } from '../../shared/components/feedback/feedback';
import {DialogComponent} from "../../shared/components/confirm-dialog/confirm-dialog";

declare const bootstrap:any;

@Component({
  selector: 'app-usuarios-crud',
  standalone: true,
  imports: [SectionHeader,GenericTableComponent,ReactiveFormsModule,CommonModule, FeedbackComponent, 
  DialogComponent],
  templateUrl: './usuarios-crud.html',
  styleUrl: './usuarios-crud.css',
})
export class UsuariosCrud {
  usuarios: Usuario[] = [];
  usuarioSeleccionado!: Usuario;
  editingId: string | null = null;
  formUsuario!: FormGroup;
  modalRef: any;
  roles: string[] = ['Administrador', 'Coordinador', 'Voluntario'];
  dialogVisible = false;
  dialogTitle = '';
  dialogData: any = {};

  @ViewChild('feedback') feedback!: FeedbackComponent;
  @ViewChild('usuarioModalRef') modalElement!: ElementRef;

  constructor(private userServicio: UsuarioService,private router:Router, private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.loadUsuarios();

    this.formUsuario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z\s]+$/)]],
      apellido: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z\s]+$/)]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['Voluntario', [Validators.required]],
      estado: [true]
    });

    this.columns = [
      { key: 'id_user', label: 'ID' }, 
      { key: 'nombre', label: 'Nombre' },
      { key: 'apellido', label: 'Apellido' },
      { key: 'correo', label: 'Correo' },
      { key: 'contrasena', label: 'Contraseña' }, 
      { key: 'rol', label: 'Rol' },
      { key: 'estado', label: 'Estado' } 
    ];
  }

  ngAfterViewInit(){
      this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
    }

  columns: any[] = [];

  loadUsuarios() {
    this.userServicio.getUsuarios().subscribe(
      (data: Usuario[]) => {
        this.usuarios = data;
      }
    );
  }

  search(busq: HTMLInputElement) {
    let parametro = busq.value.toLowerCase();
    this.userServicio.searchUsuarios(parametro).subscribe((datos: Usuario[]) => {
      this.usuarios = datos;
    });
  }

 eliminarUsuario(item: Usuario) {
  const confirmado = confirm(`¿Borrar permanentemente a ${item.nombre}?`);

  if (confirmado) {
    this.userServicio.desactivarUsuario(item.id_user).subscribe({
      next: () => {
        this.feedback.showSuccess('Eliminado de la Base de Datos', 3000);
        this.loadUsuarios();
      },
      error: () => this.feedback.showError('Error de conexión con el servidor', 3000)
    });
  }
}


  openNew() {
  this.editingId = null; 
  this.formUsuario.reset({
    rol: '',
    estado: true 
  });
  this.modalRef.show();
}

  openInfo(usuario: any) {
    this.dialogTitle = "Detalles del Usuario";

    this.dialogData = {
      nombre: `${usuario.nombre} ${usuario.apellido}`,

      descripcion: `
        ID: ${usuario.id_user}
        Correo: ${usuario.correo}
        Rol: ${usuario.rol}
        Estado actual: ${usuario.estado ? 'Activo' : 'Inactivo'}
      `,

      categoria: 'Usuario del Sistema',
      fechaInicio: 'No aplica',
      estado: usuario.rol, 
      imagen: null
    };

    this.dialogVisible = true;
  }


openEdit(usuario: Usuario) {
  this.editingId = usuario.id_user.toString(); 
  
  this.usuarioSeleccionado = usuario; 

  this.modalRef.show();

  setTimeout(() => {
    this.formUsuario.patchValue({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      contrasena: usuario.contrasena,
      rol: usuario.rol,
      estado: String(usuario.estado).trim() === "Activo" 
    });
  }, 0);
}


save() {
  if (this.formUsuario.invalid) {
    this.formUsuario.markAllAsTouched();
    this.feedback.showError('Por favor, complete todos los campos obligatorios', 3000);
    return;
  }

  const datos = this.formUsuario.getRawValue();

  if (this.editingId) {
    const usuarioUpdate: Usuario = { 
      ...datos, 
      id_user: Number(this.editingId),
      estado: datos.estado ? "Activo" : "Inactivo" 
    };
    
    this.userServicio.updateUsuario(usuarioUpdate).subscribe({
      next: () => {
        this.feedback.showSuccess('Usuario actualizado correctamente', 3000);
        this.modalRef.hide();
        this.loadUsuarios();
      },
      error: () => this.feedback.showError('Error al actualizar en el servidor', 3000)
    });

  } else {
    const { id_user, ...nuevoUsuario } = datos; 

    const usuarioNew: Usuario = { 
      ...nuevoUsuario,
      rol: datos.rol, 
      estado: "Activo" 
    };

    this.userServicio.addUsuario(usuarioNew).subscribe({
      next: () => {
        this.feedback.showSuccess('Usuario creado exitosamente', 3000);
        this.modalRef.hide();
        this.loadUsuarios();
      },
      error: () => this.feedback.showError('Error al crear usuario. Verifique el correo único.', 3000)
    });
  }
}


}
