import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';
import { CommonModule } from '@angular/common';
import { CurrentUserResponse } from '../../models/response/current-user-response.model';

const ADMIN_NAV = [
  { label: 'Dashboard',   route: '/admin/dashboard',   icon: 'dashboard' },
  { label: 'Users',       route: '/admin/users',        icon: 'users' },
  { label: 'Invitations', route: '/admin/invitations',  icon: 'invitations' },
  { label: 'Departments', route: '/admin/departments',  icon: 'departments' },
  { label: 'Categories',  route: '/admin/categories',   icon: 'categories' },
  { label: 'Templates',   route: '/admin/templates',    icon: 'templates' },
  { label: 'Settings',    route: '/admin/settings',     icon: 'settings' },
];

const USER_NAV = [
  { label: 'My Templates', route: '/user/home',     icon: 'home' },
  { label: 'My History',   route: '/user/history',  icon: 'history' },
  { label: 'Settings',     route: '/user/settings', icon: 'settings' },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {

  private authService = inject(AuthService);
  private router = inject(Router);
  currentUser = signal<CurrentUserResponse | null>(null);

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.authService.getCurrentUser().subscribe({
        next: (user: CurrentUserResponse) => this.currentUser.set(user),
        error: (err: any) => console.error('Error fetching user:', err)
      });
    }
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get navItems() {
    return this.isAdmin ? ADMIN_NAV : USER_NAV;
  }

  get userInitials(): string {
    const user = this.currentUser();
    if (!user) return '?';
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  }

  logout() {
    this.authService.logout();
  }

}
