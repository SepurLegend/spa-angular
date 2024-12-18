import { CommonModule } from '@angular/common'; // Mengimpor modul Angular yang menyediakan direktif umum seperti ngIf, ngFor, dll.
import { Component, OnInit, inject } from '@angular/core'; // Mengimpor decorator Component, interface OnInit untuk inisialisasi, dan inject untuk injeksi dependency.
import { HttpClient } from '@angular/common/http'; // Mengimpor HttpClient untuk melakukan HTTP request ke server.
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms'; // Mengimpor modul dan class untuk membuat formulir reaktif.

@Component({
  selector: 'app-mahasiswa', // Selector untuk komponen ini digunakan dalam template HTML.
  standalone: true, // Menjadikan komponen ini sebagai standalone, tanpa bagian dari modul Angular lainnya.
  imports: [CommonModule, ReactiveFormsModule], // Mengimpor modul Angular yang dibutuhkan untuk komponen ini.
  templateUrl: './mahasiswa.component.html', // Lokasi file template HTML untuk komponen ini.
  styleUrls: ['./mahasiswa.component.css'] // Lokasi file CSS untuk komponen ini.
})
export class MahasiswaComponent implements OnInit { // Mendeklarasikan class komponen dengan implementasi OnInit untuk inisialisasi.
  mahasiswa: any[] = []; // Menyimpan data mahasiswa.
  prodi: any[] = []; // Menyimpan data program studi untuk dropdown.
  apiMahasiswaUrl = 'https://express-generator-beta.vercel.app/api/mahasiswa'; // URL API untuk mengambil dan menambahkan data mahasiswa.
  apiProdiUrl = 'https://express-generator-beta.vercel.app/api/prodi'; // URL API untuk mengambil data prodi.
  isLoading = true; // Indikator loading data dari API.
  mahasiswaForm: FormGroup; // Form group untuk formulir reaktif mahasiswa.
  isSubmitting = false; // Indikator proses pengiriman data.

  private http = inject(HttpClient); // Menggunakan Angular inject API untuk menyuntikkan HttpClient.
  private fb = inject(FormBuilder); // Menyuntikkan FormBuilder untuk membangun form reaktif.

  constructor() { // Konstruktor untuk inisialisasi komponen.
    this.mahasiswaForm = this.fb.group({ // Membuat grup form dengan FormBuilder.
      npm: [''], // Field NPM mahasiswa.
      nama: [''], // Field nama mahasiswa.
      prodi_id: [null], // Field prodi_id untuk relasi dengan program studi.
      jenis_kelamin: ['L'], // Field jenis kelamin mahasiswa.
      asal_sekolah: [''], // Field asal sekolah mahasiswa.
      foto: [''] // Field foto mahasiswa (untuk upload file).
    });
  }

  ngOnInit(): void { // Lifecycle method Angular, dipanggil saat komponen diinisialisasi.
    this.getMahasiswa(); // Memanggil fungsi untuk mengambil data mahasiswa.
    this.getProdi(); // Memanggil fungsi untuk mengambil data program studi.
  }

  // Mengambil data mahasiswa
  getMahasiswa(): void {
    this.http.get<any[]>(this.apiMahasiswaUrl).subscribe({
      next: (data) => {
        this.mahasiswa = data; // Menyimpan data mahasiswa ke variabel.
        this.isLoading = false; // Menonaktifkan indikator loading.
      },
      error: (err) => {
        console.error('Error fetching mahasiswa data:', err);
        this.isLoading = false; // Menonaktifkan indikator loading.
      },
    });
  }

  // Mengambil data program studi untuk dropdown
  getProdi(): void {
    this.http.get<any[]>(this.apiProdiUrl).subscribe({
      next: (data) => {
        this.prodi = data; // Menyimpan data program studi ke variabel.
      },
      error: (err) => {
        console.error('Error fetching prodi data:', err);
      },
    });
  }

  // Method untuk menambahkan mahasiswa
  addMahasiswa(): void {
    if (this.mahasiswaForm.valid) {
      this.isSubmitting = true; // Mengaktifkan indikator pengiriman data.
      const token = localStorage.getItem('authToken');
      const headers = {Authorization: `Bearer ${token}`};
      this.http.post(this.apiMahasiswaUrl, this.mahasiswaForm.value, {headers}).subscribe({
        next: (response) => {
          console.log('Mahasiswa berhasil ditambahkan:', response);
          this.getMahasiswa(); // Refresh data mahasiswa setelah penambahan.
          this.mahasiswaForm.reset(); // Reset form setelah data dikirim.
          this.isSubmitting = false; // Menonaktifkan indikator pengiriman.
        },
        error: (err) => {
          console.error('Error menambahkan mahasiswa:', err);
          this.isSubmitting = false; // Menonaktifkan indikator pengiriman.
        },
      });
    }
  }

  // Method untuk menghapus mahasiswa
  deleteMahasiswa(_id: string): void {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      const token = localStorage.getItem('authToken');
      const headers = {Authorization: `Bearer ${token}`};
      this.http.delete(`${this.apiMahasiswaUrl}/${_id}`, {headers}).subscribe({
        next: () => {
          console.log(`Mahasiswa dengan ID ${_id} berhasil dihapus`);
          this.getMahasiswa(); // Refresh data mahasiswa setelah penghapusan.
        },
        error: (err) => {
          console.error('Error menghapus mahasiswa:', err);
        }
      });
    }
  }

  editMahasiswaId: string | null = null;
  isEditModalVisible = false;
  
  getMahasiswaById(_id: string): void {
    console.log('Fetching Mahasiswa with ID:', _id);
    this.editMahasiswaId = _id;
    this.http.get(`${this.apiMahasiswaUrl}/${_id}`).subscribe({
      next: (data: any) => {
        console.log('Mahasiswa data fetched:', data);
        this.mahasiswaForm.patchValue({
          npm: data.npm || '',
          nama: data.nama || '',
          prodi_id: data.prodi_id || null,
          jenis_kelamin: data.jenis_kelamin || 'L',
          asal_sekolah: data.asal_sekolah || '',
          foto: '',
        });
        this.isEditModalVisible = true;
      },
      error: (err) => {
        console.error('Error fetching Mahasiswa by ID:', err);
      },
    });
  }
  
  updateMahasiswa(): void {
    if (this.mahasiswaForm.valid && this.editMahasiswaId) {
      this.isSubmitting = true; // Aktifkan indikator pengiriman data
      const token = localStorage.getItem('authToken');
      const headers = {Authorization: `Bearer ${token}`};
      this.http.put(`${this.apiMahasiswaUrl}/${this.editMahasiswaId}`, this.mahasiswaForm.value, {headers}).subscribe({
        next: (response) => {
          console.log('Mahasiswa berhasil diperbarui:', response);
          this.getMahasiswa(); // Refresh data mahasiswa
          this.isSubmitting = false;
  
          // Tutup modal edit
          const modalElement = document.getElementById('editMahasiswaModal') as HTMLElement;
          if (modalElement) {
            // const modalInstance = bootstrap.Modal.getInstance(modalElement);
            // modalInstance?.hide();
          }
        },
        error: (err) => {
          console.error('Error updating mahasiswa:', err);
          this.isSubmitting = false; // Nonaktifkan indikator pengiriman data
        },
      });
    }
  }
  
}