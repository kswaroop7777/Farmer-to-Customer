import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MasterService } from '../shareServices/master-service';
import { CartViewItem, Order } from '../Interfaces/LoginUser';

@Component({
  selector: 'app-order-placed',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './order-placed.html',
  styleUrl: './order-placed.css',
})
export class OrderPlaced implements OnInit {

  private fb = inject(FormBuilder);
  private masterSer = inject(MasterService);
  private router = inject(Router);

  addressForm: FormGroup;

  cartItems = signal<CartViewItem[]>([]);
  cartLoading = signal(true);
  placing = signal(false);

  placed = signal(false);
  placedOrder = signal<Order | null>(null);

  cartTotal = computed(() =>
    this.cartItems().reduce((s, it) => s + (it.quantity ?? 0) * (it.pricePerKg ?? 0), 0)
  );

  cartCount = computed(() =>
    this.cartItems().reduce((s, it) => s + (it.quantity ?? 0), 0)
  );

  private get userId(): number {
    try {
      const u = JSON.parse(localStorage.getItem('khetlyUser') ?? 'null');
      return Number(u?.userId ?? 0);
    } catch { return 0; }
  }

  constructor() {
    const user = this.readUser();
    this.addressForm = this.fb.group({
      addressLine1: [user?.address ?? '', [Validators.required]],
      addressLine2: [''],
      city: [user?.city ?? '', [Validators.required]],
      state: ['', [Validators.required]],
      pincode: ['', [Validators.required, Validators.pattern(/^[0-9]{5,6}$/)]],
    });
  }

  ngOnInit() {
    if (this.userId === 0) {
      this.cartLoading.set(false);
      return;
    }
    this.loadCart();
  }

  loadCart() {
    this.cartLoading.set(true);
    this.masterSer.getCartByCustomer(this.userId).subscribe({
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

  confirmOrder() {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }
    if (this.cartItems().length === 0) {
      alert('Your cart is empty.');
      return;
    }
    if (this.userId === 0) {
      alert('Please sign in to place an order.');
      this.router.navigateByUrl('login');
      return;
    }

    const payload: Order = {
      orderId: 0,
      customerId: this.userId,
      orderDate: new Date().toISOString(),
      status: 'Placed',
      city: this.addressForm.value.city,
      state: this.addressForm.value.state,
      pincode: this.addressForm.value.pincode,
      addressLine1: this.addressForm.value.addressLine1,
      addressLine2: this.addressForm.value.addressLine2 ?? '',
    };

    this.placing.set(true);
    this.masterSer.createOrder(payload).subscribe({
      next: (res: any) => {
        this.placing.set(false);
        this.placed.set(true);
        this.placedOrder.set({
          ...payload,
          orderId: res?.data?.orderId ?? res?.orderId ?? 0,
        });
      },
      error: () => {
        this.placing.set(false);
        alert('Failed to place order. Please try again.');
      },
    });
  }

  printReceipt() {
    window.print();
  }

  private readUser(): any {
    try {
      return JSON.parse(localStorage.getItem('khetlyUser') ?? 'null');
    } catch { return null; }
  }
}
