import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../shareComponents/header/header';
import { Footer } from '../shareComponents/footer/footer';
import { MasterService } from '../shareServices/master-service';
import { Category, FarmerProduct } from '../Interfaces/LoginUser';

@Component({
  selector: 'app-home',
  imports: [CommonModule, Header, Footer],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {

  private masterSer = inject(MasterService);

  categories = signal<Category[]>([]);
  selectedCategoryId = signal<number | null>(null);
  farmerProducts = signal<FarmerProduct[]>([]);

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
