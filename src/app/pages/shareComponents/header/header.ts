import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MasterService } from '../../shareServices/master-service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  userName = signal<string | null>(null);
  masterSer=inject(MasterService)

  constructor(private router: Router) {
    this.loadUser();
    this.masterSer.onLogin$.subscribe({
      next:()=>{
        this.loadUser();
      }
    })
    
  }

  private loadUser() {
    const raw = localStorage.getItem('khetlyUser');
    if (!raw) {
      this.userName.set(null);
      return;
    }
    try {
      const user = JSON.parse(raw);
      this.userName.set(user?.name || user?.email || 'Account');
    } catch {
      this.userName.set(null);
    }
  }

  logout() {
    localStorage.removeItem('khetlyUser');
    this.userName.set(null);
    this.router.navigateByUrl('home');
  }
}
