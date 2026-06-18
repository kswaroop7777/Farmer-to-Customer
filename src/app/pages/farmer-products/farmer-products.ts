import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MasterService } from '../shareServices/master-service';
import { FarmerProduct, Product } from '../Interfaces/LoginUser';

@Component({
  selector: 'app-farmer-products',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './farmer-products.html',
  styleUrl: './farmer-products.css',
})
export class FarmerProducts implements OnInit {

  private fb = inject(FormBuilder);
  private masterSer = inject(MasterService);

  fpForm: FormGroup;

  farmerProducts = signal<FarmerProduct[]>([]);
  products = signal<Product[]>([]);
  search = signal('');

  statusOptions = ['Available', 'Out of stock', 'Hidden'];

  filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.farmerProducts();
    return this.farmerProducts().filter(fp =>
      fp.productName?.toLowerCase().includes(term) ||
      fp.farmerName?.toLowerCase().includes(term) ||
      fp.status?.toLowerCase().includes(term)
    );
  });

  constructor() {
    const storedUser = this.readStoredUser();
    const defaultFarmerId = storedUser?.userId ?? storedUser?.farmerId ?? 0;

    this.fpForm = this.fb.group({
      farmerProductId: [0],
      farmerId: [defaultFarmerId, [Validators.required, Validators.min(1)]],
      productId: [0, [Validators.required, Validators.min(1)]],
      pricePerKg: [0, [Validators.required, Validators.min(1)]],
      availableQuantity: [0, [Validators.required, Validators.min(1)]],
      availableDate: [this.todayISO(), [Validators.required]],
      status: ['Available', [Validators.required]],
    });
  }

  ngOnInit() {
    this.loadFarmerProducts();
    this.loadProducts();
  }

  loadFarmerProducts() {
    this.masterSer.getFarmerProducts().subscribe({
      next: (res: any) => this.farmerProducts.set(res?.data ?? []),
      error: () => this.farmerProducts.set([]),
    });
  }

  loadProducts() {
    this.masterSer.getAllProducts().subscribe({
      next: (res: any) => this.products.set(res?.data ?? []),
      error: () => this.products.set([]),
    });
  }

  saveFarmerProduct() {
    if (this.fpForm.invalid) {
      this.fpForm.markAllAsTouched();
      return;
    }
    const payload: FarmerProduct = {
      ...this.fpForm.value,
      availableDate: new Date(this.fpForm.value.availableDate).toISOString(),
    };
    if (payload.farmerProductId > 0) {
      this.masterSer.updateFarmerProduct(payload.farmerProductId, payload).subscribe({
        next: () => {
          alert('Listing updated successfully');
          this.resetForm();
          this.loadFarmerProducts();
        },
        error: () => alert('Failed to update listing'),
      });
    } else {
      this.masterSer.createFarmerProduct(payload).subscribe({
        next: () => {
          alert('Listing saved successfully');
          this.resetForm();
          this.loadFarmerProducts();
        },
        error: () => alert('Failed to save listing'),
      });
    }
  }

  editFarmerProduct(fp: FarmerProduct) {
    this.fpForm.patchValue({
      farmerProductId: fp.farmerProductId,
      farmerId: fp.farmerId,
      productId: fp.productId,
      pricePerKg: fp.pricePerKg,
      availableQuantity: fp.availableQuantity,
      availableDate: fp.availableDate ? fp.availableDate.substring(0, 10) : this.todayISO(),
      status: fp.status,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteFarmerProduct(fp: FarmerProduct) {
    if (!confirm(`Remove listing #${fp.farmerProductId}?`)) return;
    alert('Delete endpoint not yet provided.');
  }

  resetForm() {
    const storedUser = this.readStoredUser();
    const defaultFarmerId = storedUser?.userId ?? storedUser?.farmerId ?? 0;
    this.fpForm.reset({
      farmerProductId: 0,
      farmerId: defaultFarmerId,
      productId: 0,
      pricePerKg: 0,
      availableQuantity: 0,
      availableDate: this.todayISO(),
      status: 'Available',
    });
  }

  onSearch(value: string) {
    this.search.set(value);
  }

  productName(id: number): string {
    return this.products().find(p => p.productId === id)?.name ?? '—';
  }

  statusClass(status: string): string {
    const s = (status ?? '').toLowerCase();
    if (s.includes('available')) return 'status-pill green';
    if (s.includes('out')) return 'status-pill orange';
    return 'status-pill grey';
  }

  private todayISO(): string {
    return new Date().toISOString().substring(0, 10);
  }

  private readStoredUser(): any {
    try {
      const raw = localStorage.getItem('khetlyUser');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
