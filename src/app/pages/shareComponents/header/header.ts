import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MasterService } from '../../shareServices/master-service';

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

  logout() {
    localStorage.removeItem('khetlyUser');
    this.user = GUEST;
    this.userName.set(null);
    this.router.navigateByUrl('home');
  }
}
