// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-mahasiswa',
//   standalone: true,
//   imports: [],
//   templateUrl: './mahasiswa.component.html',
//   styleUrl: './mahasiswa.component.css'
// })
// export class MahasiswaComponent {

// }
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import bootstrap from 'bootstrap';
// import * as bootstrap from 'bootstrap';
// import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-mahasiswa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mahasiswa.component.html',
  styleUrls: ['./mahasiswa.component.css'],
})
export class MahasiswaComponent implements OnInit {
  mahasiswa: any[] = [];
  prodi: any[] = [];
  apiMahasiswaUrl = 'https://express-generator-beta.vercel.app/api/mahasiswa';
  apiProdiUrl = 'https://express-generator-beta.vercel.app/api/prodi';
  isLoading = true;
  mahasiswaForm: FormGroup;
  isSubmitting = false;
  isEditing = false;
  selectedMahasiswaId: string | null = null;

  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  constructor() {
    this.mahasiswaForm = this.fb.group({
      nama: [''],
      npm: [''],
      jenis_kelamin: [''],
      asal_sekolah: [''],
      prodi_id: [null],
    });
  }

  ngOnInit(): void {
    this.getMahasiswa();
    this.getProdi();
  }

  getMahasiswa(): void {
    this.http.get<any[]>(this.apiMahasiswaUrl).subscribe({
      next: (data) => {
        this.mahasiswa = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching mahasiswa data:', err);
        this.isLoading = false;
      },
    });
  }

  getProdi(): void {
    this.http.get<any[]>(this.apiProdiUrl).subscribe({
      next: (data) => {
        this.prodi = data;
      },
      error: (err) => {
        console.error('Error fetching prodi data:', err);
      },
    });
  }

  editMahasiswaId: string | null = null;

  addMahasiswa(): void {
    if (this.mahasiswaForm.valid) {
      this.isSubmitting = true; 
      const token = localStorage.getItem('authToken');
      const headers = {Authorization: `Bearer ${token}`};
      const method = this.isEditing
        ? this.http.put(`${this.apiMahasiswaUrl}/${this.selectedMahasiswaId}`, this.mahasiswaForm.value)
        : this.http.post(this.apiMahasiswaUrl, this.mahasiswaForm.value, {headers});

      method.subscribe({
        next: (response) => {
          console.log('Mahasiswa berhasil disimpan:', response);
          this.getMahasiswa();
          this.resetForm();
        },
        error: (err) => {
          console.error('Error menyimpan mahasiswa:', err);
          this.isSubmitting = false;
        },
      });
    }
  }

  editMahasiswa(mahasiswa: any): void {
    if (this.mahasiswaForm.valid) {
      this.isEditing = true;
      const token = localStorage.getItem('authToken');
      const headers = {Authorization: `Bearer ${token}`};
      this.selectedMahasiswaId = mahasiswa._id;
      this.mahasiswaForm.patchValue(mahasiswa);

      this.http.put(`${this.apiMahasiswaUrl}/${this.editMahasiswaId}`, this.mahasiswaForm.value, { headers }).subscribe({
        next: (response) => {
          console.log('Mahasiswa berhasil diperbarui:', response);
          this.getMahasiswa(); // Refresh data Mahasiswa
          this.isSubmitting = false;

          // Tutup modal edit setelah data berhasil diupdate
          const modalElement = document.getElementById('editMahasiswaModal') as HTMLElement;
          if (modalElement) {
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance?.hide();
          }
        },
        error: (err) => {
          console.error('Error updating mahasiswa:', err);
          this.isSubmitting = false;
        },
      });
    }
  }

  deleteMahasiswa(id: string): void {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      const token = localStorage.getItem('authToken');
      const headers = {Authorization: `Bearer ${token}`};
      this.http.delete(`${this.apiMahasiswaUrl}/${id}`, {headers}).subscribe({
        next: () => {
          console.log('Mahasiswa berhasil dihapus');
          this.getMahasiswa();
        },
        error: (err) => {
          console.error('Error menghapus mahasiswa:', err);
        },
      });
    }
  }

  resetForm(): void {
    this.mahasiswaForm.reset();
    this.isSubmitting = false;
    this.isEditing = false;
    this.selectedMahasiswaId = null;
  }
}