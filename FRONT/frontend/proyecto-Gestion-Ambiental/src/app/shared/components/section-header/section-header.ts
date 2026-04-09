/** 
 Autora: Gabriela Solange Gonzalez Roman
 Fecha: 2025-11-25
 Descripción: HTML para el header de información reutilizable. 
 **/
 import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-section-header',
  imports: [CommonModule],
  templateUrl: './section-header.html',
  styleUrl: './section-header.css',
})
export class SectionHeader {
  @Input() title: string = '';       
  @Input() subtitle: string = '';  
  @Input() icon: string = 'bi-folder'; 

}
