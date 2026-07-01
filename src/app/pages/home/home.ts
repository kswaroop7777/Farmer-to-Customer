import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from '../shareComponents/header/header';
import { Footer } from '../shareComponents/footer/footer';
import { MasterService } from '../shareServices/master-service';
import { CartItem, Category, FarmerProduct } from '../Interfaces/LoginUser';

@Component({
  selector: 'app-home',
  imports: [CommonModule, Header, Footer],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {

  private masterSer = inject(MasterService);
  private router = inject(Router);

  categories = signal<Category[]>([]);
  selectedCategoryId = signal<number | null>(null);
  farmerProducts = signal<FarmerProduct[]>([]);

  cartModalOpen = signal(false);
  cartTarget = signal<FarmerProduct | null>(null);
  cartQty = signal(1);
  cartSubmitting = signal(false);

  cartTotal = computed(() => {
    const fp = this.cartTarget();
    return fp ? (fp.pricePerKg ?? 0) * this.cartQty() : 0;
  });

  showAllCategories = signal(false);
  private compactLimit = 5;

  visibleCategories = computed(() => {
    const all = this.categories();
    if (this.showAllCategories()) return all;
    return all.length > this.compactLimit ? all.slice(0, 4) : all;
  });

  hasOverflow = computed(() => this.categories().length > this.compactLimit);

  toggleViewAll() {
    this.showAllCategories.update(v => !v);
  }

  ngOnInit() {
    this.loadCategories();
    this.selectAll();
  }

  loadCategories() {
    this.masterSer.getCategoriesList().subscribe({
      next: (res: any) => this.categories.set(res?.data ?? []),
      error: () => this.categories.set([]),
    });
  }

  selectAll() {
    this.selectedCategoryId.set(null);
    this.masterSer.getFarmerProducts().subscribe({
      next: (res: any) => this.farmerProducts.set(res?.data ?? []),
      error: () => this.farmerProducts.set([]),
    });
  }

  selectCategory(categoryId: number) {
    this.selectedCategoryId.set(categoryId);
    this.masterSer.getFarmerProductsByCategory(categoryId).subscribe({
      next: (res: any) => this.farmerProducts.set(res?.data ?? []),
      error: () => this.farmerProducts.set([]),
    });
  }

  openCartModal(fp: FarmerProduct) {
    const user = this.readUser();
    if (!user?.userId) {
      if (confirm('Please sign in to add items to your cart. Go to sign in now?')) {
        this.router.navigateByUrl('login');
      }
      return;
    }
    this.cartTarget.set(fp);
    this.cartQty.set(1);
    this.cartModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeCartModal() {
    this.cartModalOpen.set(false);
    this.cartTarget.set(null);
    this.cartSubmitting.set(false);
    document.body.style.overflow = '';
  }

  incQty() {
    const max = this.cartTarget()?.availableQuantity ?? 999;
    this.cartQty.update(q => Math.min(q + 1, max));
  }

  decQty() {
    this.cartQty.update(q => Math.max(1, q - 1));
  }

  setQty(value: string) {
    const n = parseInt(value, 10);
    if (isNaN(n)) return;
    const max = this.cartTarget()?.availableQuantity ?? 999;
    this.cartQty.set(Math.min(Math.max(1, n), max));
  }

  confirmAddToCart() {
    const fp = this.cartTarget();
    const user = this.readUser();
    if (!fp || !user?.userId) return;

    const payload: CartItem = {
      cartId: 0,
      customerId: Number(user.userId),
      farmerProductId: fp.farmerProductId,
      quantity: this.cartQty(),
      addedAt: new Date().toISOString(),
    };

    this.cartSubmitting.set(true);
    this.masterSer.addToCart(payload).subscribe({
      next: () => {
        const name = fp.productName ?? 'Item';
        alert(`${this.cartQty()} kg of ${name} added to cart`);
        this.closeCartModal();
        this.masterSer.addToCart$.next(true)
      },
      error: () => {
        this.cartSubmitting.set(false);
        alert('Failed to add to cart');
      },
    });
  }

  private readUser(): any {
    try {
      return JSON.parse(localStorage.getItem('khetlyUser') ?? 'null');
    } catch {
      return null;
    }
  }

  categoryIcon(name: string): string {
    const n = (name ?? '').toLowerCase();
    if (n.includes('veg')) return 'ti-carrot';
    if (n.includes('fruit')) return 'ti-apple';
    if (n.includes('herb')) return 'ti-leaf';
    if (n.includes('grain') || n.includes('pulse')) return 'ti-seeding';
    if (n.includes('dairy') || n.includes('milk')) return 'ti-milk';
    if (n.includes('honey')) return 'ti-honey';
    if (n.includes('egg') || n.includes('poultry')) return 'ti-egg';
    if (n.includes('meat') || n.includes('fish')) return 'ti-fish';
    return 'ti-plant-2';
  }
}
