/**
 * Autora: Gabriela Solange Gonzalez Roman
 * Fecha: 2025-12-01
 * Descripción: Noticiaciones de éxito y error reutilizables.
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feedback.html', 
  styleUrls: ['./feedback.css']   
})
export class FeedbackComponent {
  visible: boolean = false;
  message: string = '';
  type: 'success' | 'error' = 'success';
  private timeoutRef: any;

  get bgColor() {
    return this.type === 'success' ? 'bg-success' : 'bg-danger';
  }

  get iconClass() {
    return this.type === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-triangle-fill';
  }


  showSuccess(msg: string, duration: number = 3000) {
    this.show(msg, 'success', duration);
  }

  showError(msg: string, duration: number = 4000) {
    this.show(msg, 'error', duration);
  }

  hide() {
    this.visible = false;
    if (this.timeoutRef) clearTimeout(this.timeoutRef);
  }

  private show(msg: string, type: 'success' | 'error', duration: number) {
    this.message = msg;
    this.type = type;
    this.visible = true;

    if (this.timeoutRef) clearTimeout(this.timeoutRef);

    this.timeoutRef = setTimeout(() => {
      this.visible = false;
    }, duration);
  }
}