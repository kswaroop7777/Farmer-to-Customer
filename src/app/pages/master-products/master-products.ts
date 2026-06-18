import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MasterService } from '../shareServices/master-service';
import { Category, Product } from '../Interfaces/LoginUser';

@Component({
  selector: 'app-master-products',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './master-products.html',
  styleUrl: './master-products.css',
})
export class MasterProducts implements OnInit {

  private fb = inject(FormBuilder);
  private masterSer = inject(MasterService);

  productForm: FormGroup;

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  search = signal('');

  filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.products();
    return this.products().filter(p =>
      p.name?.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term) ||
      p.categoryName?.toLowerCase().includes(term)
    );
  });

  constructor() {
    this.productForm = this.fb.group({
      productId: [0],
      name: ['', [Validators.required, Validators.minLength(2)]],
      categoryId: [0, [Validators.required, Validators.min(1)]],
      description: ['', [Validators.required]],
      image: [''],
    });
  }

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    this.masterSer.getAllProducts().subscribe({
      next: (res: any) => this.products.set(res?.data ?? []),
      error: () => this.products.set([]),
    });
  }

  loadCategories() {
    this.masterSer.getCategoriesList().subscribe({
      next: (res: any) => this.categories.set(res?.data ?? []),
      error: () => this.categories.set([]),
    });
  }

  saveProduct() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }
    const payload = this.productForm.value;
    if (payload.productId > 0) {
      this.masterSer.updateProduct(payload.productId, payload).subscribe({
        next: () => {
          alert('Product updated successfully');
          this.resetForm();
          this.loadProducts();
        },
        error: () => alert('Failed to update product'),
      });
    } else {
      this.masterSer.createProduct(payload).subscribe({
        next: () => {
          alert('Product saved successfully');
          this.resetForm();
          this.loadProducts();
        },
        error: () => alert('Failed to save product'),
      });
    }
  }

  editProduct(p: Product) {
    this.productForm.patchValue({
      productId: p.productId,
      name: p.name,
      categoryId: p.categoryId,
      description: p.description,
      image: p.image,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteProduct(p: Product) {
    if (!confirm(`Delete product "${p.name}"?`)) return;
    alert('Delete endpoint not yet provided.');
  }

  resetForm() {
    this.productForm.reset({ productId: 0, name: '', categoryId: 0, description: '', image: '' });
  }

  onSearch(value: string) {
    this.search.set(value);
  }

  categoryName(id: number): string {
    return this.categories().find(c => c.categoryId === id)?.name ?? '—';
  }
}
