import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = 'SmartCity Tunisia';
  protected readonly auth = inject(AuthService);
  protected readonly router = inject(Router);
  protected readonly sidebarOpen = signal(false);

  protected readonly isAuthRoute = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.isAuthPage()),
      startWith(this.isAuthPage())
    ),
    { initialValue: this.isAuthPage() }
  );

  protected get userRole(): string | null {
    return this.auth.getUserRole();
  }

  protected toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  protected logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  private isAuthPage(): boolean {
    const path = this.router.url.split('?')[0];
    return path === '/login' || path === '/register';
  }
}
