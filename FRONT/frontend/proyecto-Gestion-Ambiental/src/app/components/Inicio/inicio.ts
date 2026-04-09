/* Autora: Gabriela Gonzalez */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { IniciativaService } from '../../services/iniciativa';
import { Iniciativa } from '../../models/Iniciativa';
import { CategoriaService } from '../../services/categoria'; 
import { Categoria } from '../../models/Categoria';         

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})
export class Inicio implements OnInit {

  iniciativas: Iniciativa[] = [];
  iniciativasOriginales: Iniciativa[] = [];
  
  categorias: Categoria[] = []; 

  coloresTarjetas = ['bg-gradient-green', 'bg-gradient-blue', 'bg-gradient-purple', 'bg-gradient-orange'];
  
  constructor(
    public auth: AuthService, 
    private iniciativaService: IniciativaService,
    private categoriaService: CategoriaService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarIniciativas();
    this.cargarCategorias(); 
  }

cargarIniciativas() {
    this.iniciativaService.getIniciativas().subscribe({
      next: (data) => {
        console.log('Datos recibidos:', data);

        this.iniciativas = data; 
        
        this.iniciativasOriginales = [...this.iniciativas]; 
      },
      error: (err) => console.error(err)
    });
  }

  cargarCategorias() {
    this.categoriaService.getCategorias().subscribe({
      next: (data) => {
        this.categorias = data.filter(c => c.estado === 'Activo' || c.estado === 'Inactiva');
      },
      error: (err) => console.error(err)
    });
  }

  filtrarCategoria(evento: any) {
    const idCat = evento.target.value;

    if (idCat === 'todas') {
      this.iniciativas = [...this.iniciativasOriginales];
    } else {
      this.iniciativas = this.iniciativasOriginales.filter(i => i.id_categoria == idCat);
    }
  }

  search(texto: string) {
    if (!texto) {
      this.iniciativas = [...this.iniciativasOriginales];
      return;
    }
    const termino = texto.toLowerCase();
    this.iniciativas = this.iniciativasOriginales.filter(i => 
      i.nombre.toLowerCase().includes(termino) ||
      i.descripcion.toLowerCase().includes(termino)
    );
  }

  verDetalles(item: Iniciativa) {
    this.router.navigate(['/actividades']); 
  }

  getCardColor(index: number): string {
    return this.coloresTarjetas[index % this.coloresTarjetas.length];
  }

  getProgressBarColor(index: number): string {
    const colores = ['bg-success', 'bg-primary', 'bg-info', 'bg-warning'];
    return colores[index % colores.length];
  }

  getIconoCategoria(idCategoria: number): string {
    switch(idCategoria) {
      case 1: return 'bi-tree-fill';      
      case 2: return 'bi-water';          
      case 3: return 'bi-recycle';        
      case 4: return 'bi-book-half';      
      default: return 'bi-globe-americas'; 
    }
  }
}