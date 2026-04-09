import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-generic-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './generic-table.html',
  styleUrls: ['./generic-table.css']
})
export class GenericTableComponent {
  @Input() columns: { key: string; label: string }[] = [];
  @Input() data: any[] = [];
  @Input() showDownload: boolean = false;
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() viewInfo = new EventEmitter<any>();
  @Output() download = new EventEmitter<any>();

    onDownload(item: any) {
      console.log("Emit download event:", item); 
      this.download.emit(item);
    }

    onView(row: any): void {
    this.viewInfo.emit(row);
  }
  onEdit(item: any) {
    this.edit.emit(item);
  }

  onDelete(item: any) {
    this.delete.emit(item);
  }

  sortBy: string = '';
  sortAsc: boolean = true;

  ordenarPor(colKey: string) {
    if (this.sortBy === colKey) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortBy = colKey;
      this.sortAsc = true;
    }
    this.data.sort((a, b) => {
      const valA = a[colKey];
      const valB = b[colKey];
      return this.sortAsc
        ? valA > valB ? 1 : -1
        : valA < valB ? 1 : -1;
    });
  }
  //paginacion
  currentPage = 1;
  itemsPerPage = 5;

  get paginatedData() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.data.slice(start, start + this.itemsPerPage);
  }

  totalPages() {
    return Math.ceil(this.data.length / this.itemsPerPage);
  }

  cambiarPagina(p: number) {
    this.currentPage = p;
  }

}