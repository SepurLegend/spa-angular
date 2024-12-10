// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-fakultas',
//   standalone: true,
//   imports: [],
//   templateUrl: './fakultas.component.html',
//   styleUrl: './fakultas.component.css'
// })
// export class FakultasComponent {

// }
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-fakultas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxPaginationModule],
  templateUrl: './fakultas.component.html',
  styleUrls: ['./fakultas.component.css']
})
export class FakultasComponent implements OnInit {
  fakultas: any[] = [];
  currentPage = 1;
  itemsPerPage = 5;
  apiUrl = 'https://express-generator-beta.vercel.app/api/fakultas';
  isLoading = true;

  fakultasForm: FormGroup;
  isSubmitting = false;

  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  selectedFakultasId: string | null = null; // Untuk menyimpan ID fakultas yang sedang di-edit

  constructor() {
    this.fakultasForm = this.fb.group({
      nama: [''],
      singkatan: ['']
    });
  }

  ngOnInit(): void {
    this.getFakultas();
  }

  getFakultas(): void {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.fakultas = data;
        console.log('Data Fakultas:', this.fakultas);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching fakultas data:', err);
        this.isLoading = false;
      }
    });
  }

  addFakultas(): void {
    if (this.fakultasForm.valid) {
      this.isSubmitting = true;
      this.http.post(this.apiUrl, this.fakultasForm.value).subscribe({
        next: () => {
          this.getFakultas();
          this.fakultasForm.reset();
          this.isSubmitting = false;
          this.closeModal('tambahFakultasModal');
        },
        error: (err) => {
          console.error('Error menambahkan fakultas:', err);
          this.isSubmitting = false;
        }
      });
    }
  }

  getFakultasById(id: string): void {
    const selectedFakultas = this.fakultas.find((f) => f._id === id);
    if (selectedFakultas) {
      this.selectedFakultasId = id;
      this.fakultasForm.patchValue(selectedFakultas);
    }
  }

  updateFakultas(): void {
    if (this.selectedFakultasId && this.fakultasForm.valid) {
      this.isSubmitting = true;
      const url = `${this.apiUrl}/${this.selectedFakultasId}`;
      this.http.put(url, this.fakultasForm.value).subscribe({
        next: () => {
          this.getFakultas();
          this.fakultasForm.reset();
          this.selectedFakultasId = null;
          this.isSubmitting = false;
          this.closeModal('editFakultasModal');
        },
        error: (err) => {
          console.error('Error mengupdate fakultas:', err);
          this.isSubmitting = false;
        }
      });
    }
  }

  deleteFakultas(id: string): void {
    if (confirm('Apakah Anda yakin ingin menghapus fakultas ini?')) {
      const url = `${this.apiUrl}/${id}`;
      this.http.delete(url).subscribe({
        next: () => {
          console.log('Fakultas berhasil dihapus.');
          this.getFakultas();
        },
        error: (err) => {
          console.error('Error menghapus fakultas:', err);
        }
      });
    }
  }

  private closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId) as HTMLElement;
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
      modalInstance.hide();

      // Hapus elemen backdrop jika ada
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }

      // Pulihkan scroll pada body
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  }
}