import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MasterService } from '../shareServices/master-service';
import { map, Observable, of } from 'rxjs';
import { IOrder } from '../Interfaces/LoginUser';

type StatusFilter = 'all' | 'placed' | 'transit' | 'delivered' | 'cancelled';

@Component({
  selector: 'app-orders',
  imports: [CommonModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {

  masterSer = inject(MasterService);
  router = inject(Router);

  activeFilter = signal<StatusFilter>('all');
  search = signal('');
  selectedOrder = signal<any | null>(null);
  detailLoading = signal(false);
  actionInFlight = signal(false);

  orders = signal<IOrder[]>([]);
  OrderList$: Observable<IOrder[]> = of([]);
  isFarmerView = signal(false);
  loading = signal(true);

  statusOptions = ['Placed', 'Harvested', 'In transit', 'Delivered', 'Cancelled'];

  filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const filter = this.activeFilter();
    return this.orders().filter(o => {
      if (filter !== 'all') {
        const s = (o.status ?? '').toLowerCase();
        if (filter === 'placed'    && !s.includes('placed'))    return false;
        if (filter === 'transit'   && !s.includes('transit'))   return false;
        if (filter === 'delivered' && !s.includes('delivered')) return false;
        if (filter === 'cancelled' && !s.includes('cancel'))    return false;
      }
      if (!term) return true;
      return String(o.orderId).includes(term) ||
             (o.status ?? '').toLowerCase().includes(term) ||
             (o.city ?? '').toLowerCase().includes(term) ||
             (o.addressLine1 ?? '').toLowerCase().includes(term);
    });
  });

  counts = computed(() => {
    const list = this.orders();
    return {
      total: list.length,
      delivered: list.filter(o => (o.status ?? '').toLowerCase().includes('delivered')).length,
      transit: list.filter(o => (o.status ?? '').toLowerCase().includes('transit')).length,
    };
  });

  ngOnInit(): void {
    const user = this.readUser();
    if (!user?.userId) {
      this.loading.set(false);
      if (confirm('Please sign in to view your orders. Go to sign in now?')) {
        this.router.navigateByUrl('login');
      }
      return;
    }

    const roleId = Number(user.roleId ?? 0);
    this.isFarmerView.set(roleId === 2);
    this.loadOrders(Number(user.userId), roleId);
  }

  private loadOrders(userId: number, roleId: number) {
    this.loading.set(true);
    const source$ = roleId === 2
      ? this.masterSer.getOrdersByFormerId(userId)
      : this.masterSer.getOrdersByCustomerId(userId);

    this.OrderList$ = source$.pipe(
      map((res: any) => (res?.data ?? res?.orders ?? res ?? []) as IOrder[])
    );

    this.OrderList$.subscribe({
      next: (list) => {
        this.orders.set(Array.isArray(list) ? list : []);
        this.loading.set(false);
      },
      error: () => {
        this.orders.set([]);
        this.loading.set(false);
      },
    });
  }

  reload() {
    const user = this.readUser();
    if (!user?.userId) return;
    this.loadOrders(Number(user.userId), Number(user.roleId ?? 0));
  }

  setFilter(f: StatusFilter) { this.activeFilter.set(f); }
  onSearch(v: string) { this.search.set(v); }

  viewOrder(o: any) {
    this.selectedOrder.set(o);
    this.detailLoading.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.masterSer.getOrderById(o.orderId).subscribe({
      next: (res: any) => {
        // console.log('[getOrderById raw]', res);
        const src = res?.data?.order ?? res?.order ?? res?.data ?? res ?? o;
        const items =
          src?.items ??
          src?.orderItems ??
          res?.data?.orderItems ??
          res?.data?.items ??
          res?.orderItems ??
          [];
        const fresh = { ...src, items };
        // console.log('[selectedOrder normalized]', fresh);
        this.selectedOrder.set(fresh);
        this.detailLoading.set(false);
      },
      error: (err) => {
        // console.error('[getOrderById error]', err);
        this.detailLoading.set(false);
      },
    });
  }

  back() { this.selectedOrder.set(null); }

  updateStatus(newStatus: string) {
    const ord = this.selectedOrder();
    if (!ord?.orderId || !newStatus) return;
    if (newStatus === ord.status) return;

    this.actionInFlight.set(true);
    this.masterSer.updateOrderStatus(ord.orderId, { status: newStatus }).subscribe({
      next: () => {
        this.selectedOrder.update(o => o ? { ...o, status: newStatus } : o);
        this.orders.update(list =>
          list.map(o => o.orderId === ord.orderId ? { ...o, status: newStatus } : o)
        );
        this.actionInFlight.set(false);
      },
      error: () => {
        this.actionInFlight.set(false);
        alert('Failed to update order status');
      },
    });
  }

  onStatusChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value;
    this.updateStatus(value);
  }

  deleteOrder() {
    const ord = this.selectedOrder();
    if (!ord?.orderId) return;
    if (!confirm(`Delete order #${ord.orderId}? This cannot be undone.`)) return;

    this.actionInFlight.set(true);
    this.masterSer.deleteOrder(ord.orderId).subscribe({
      next: () => {
        this.orders.update(list => list.filter(o => o.orderId !== ord.orderId));
        this.selectedOrder.set(null);
        this.actionInFlight.set(false);
      },
      error: () => {
        this.actionInFlight.set(false);
        alert('Failed to delete order');
      },
    });
  }

  cancelOrder() {
    const ord = this.selectedOrder();
    if (!ord?.orderId) return;
    if (!confirm(`Cancel order #${ord.orderId}?`)) return;
    this.updateStatus('Cancelled');
  }

  itemCount(o: any): number {
    return (o?.items ?? []).reduce((s: number, it: any) => s + (it.qty ?? it.quantity ?? 0), 0);
  }

  statusClass(status: string): string {
    const s = (status ?? '').toLowerCase();
    if (s.includes('delivered')) return 'status-pill green';
    if (s.includes('transit')) return 'status-pill orange';
    if (s.includes('cancel')) return 'status-pill red';
    return 'status-pill grey';
  }

  timelineStep(status: string): number {
    const s = (status ?? '').toLowerCase();
    if (s.includes('cancel')) return -1;
    if (s.includes('delivered')) return 4;
    if (s.includes('transit')) return 3;
    if (s.includes('harvest')) return 2;
    if (s.includes('placed')) return 1;
    return 0;
  }

  private readUser(): any {
    try {
      return JSON.parse(localStorage.getItem('khetlyUser') ?? 'null');
    } catch {
      return null;
    }
  }
}
