import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MasterService } from '../../shareServices/master-service';
import { CartViewItem } from '../../Interfaces/LoginUser';

interface NavUser {
  userId: number;
  roleId: number;
  name?: string;
  email?: string;
}

const GUEST: NavUser = { userId: 0, roleId: 0 };

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  userName = signal<string | null>(null);
  user: NavUser = GUEST;

  cartOpen = signal(false);
  cartLoading = signal(false);
  cartItems = signal<CartViewItem[]>([]);

  cartCount = computed(() => this.cartItems().length);

  cartTotal = computed(() =>
    this.cartItems().reduce((sum, it) => sum + (it.quantity ?? 0) * (it.pricePerKg ?? 0), 0)
  );

  masterSer = inject(MasterService);

  constructor(private router: Router) {
    this.loadUser();
    this.masterSer.onLogin$.subscribe({
      next: () => this.loadUser(),
    });
  }

  private loadUser() {
    const raw = localStorage.getItem('khetlyUser');
    if (!raw) {
      this.user = GUEST;
      this.userName.set(null);
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      this.user = {
        userId: Number(parsed?.userId ?? 0),
        roleId: Number(parsed?.roleId ?? 0),
        name: parsed?.name,
        email: parsed?.email,
      };
      this.userName.set(parsed?.name || parsed?.email || 'Account');
    } catch {
      this.user = GUEST;
      this.userName.set(null);
    }
  }

  openCart() {
    if (this.user.userId === 0) {
      if (confirm('Please sign in to view your cart. Go to sign in now?')) {
        this.router.navigateByUrl('login');
      }
      return;
    }
    this.cartOpen.set(true);
    document.body.style.overflow = 'hidden';
    this.loadCart();
  }

  closeCart() {
    this.cartOpen.set(false);
    document.body.style.overflow = '';
  }

  loadCart() {
    this.cartLoading.set(true);
    this.masterSer.getCartByCustomer(this.user.userId).subscribe({
      next: (res: any) => {
        this.cartItems.set(res?.data ?? []);
        this.cartLoading.set(false);
      },
      error: () => {
        this.cartItems.set([]);
        this.cartLoading.set(false);
      },
    });
  }

  removeCartItem(item: CartViewItem) {
    if (!confirm(`Remove ${item.productName ?? 'item'} from cart?`)) return;
    this.masterSer.deleteCartItem(item.cartId).subscribe({
      next: () => this.loadCart(),
      error: () => alert('Failed to remove item'),
    });
  }

  placeOrder() {
    if (this.cartItems().length === 0) {
      alert('Your cart is empty.');
      return;
    }
    this.closeCart();
    this.router.navigateByUrl('order-placed');
  }

  logout() {
    localStorage.removeItem('khetlyUser');
    this.user = GUEST;
    this.userName.set(null);
    this.cartItems.set([]);
    this.router.navigateByUrl('home');
  }
}
