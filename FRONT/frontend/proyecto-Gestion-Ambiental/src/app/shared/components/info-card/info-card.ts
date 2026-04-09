/**
 Autora: Gabriela Solange Gonzalez Roman
 Fecha: 2025-11-25
 Descripción: HTML para la tarjeta de información reutilizable.
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-info-card',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './info-card.html',
  styleUrls: ['./info-card.css']
})
export class InfoCardComponent {
  @Input() titulo: string = '';
  @Input() descripcion: string = '';
  @Input() etiqueta: string = '';
  @Input() imagenUrl: string = '';
  @Input() textoBoton: string = '';
  @Output() accionBoton = new EventEmitter<void>();

  emitirAccion() {
    this.accionBoton.emit();
  }
}