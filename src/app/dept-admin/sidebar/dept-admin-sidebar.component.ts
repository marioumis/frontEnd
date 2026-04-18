import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';
import { AccountService } from '../../core/service/account.service';
import { CurrentUserResponse } from '../../models/response/current-user-response.model';

const DEPT_ADMIN_NAV = [
  { label: 'Users', route: '/dept-admin/users', icon: 'users' },
  { label: 'Invitations', route: '/dept-admin/invitations', icon: 'invitations' },
  { label: 'Categories', route: '/dept-admin/categories', icon: 'categories' },
  { label: 'Templates', route: '/dept-admin/templates', icon: 'templates' },
  { label: 'Settings', route: '/dept-admin/settings', icon: 'settings' }
];

@Component({
  selector: 'app-dept-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dept-admin-sidebar.component.html',
  styleUrl: './dept-admin-sidebar.component.css'
})
export class DeptAdminSidebarComponent implements OnInit {
  currentUser = signal<CurrentUserResponse | null>(null);

  constructor(
    private readonly authService: AuthService,
    private readonly accountService: AccountService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      return;
    }

    this.accountService.getMe().subscribe({
      next: (user) => this.currentUser.set(user),
      error: (err) => console.error('Failed to load dept admin profile', err)
    });
  }

  get navItems() {
    return DEPT_ADMIN_NAV;
  }

  get userInitials(): string {
    const user = this.currentUser();

    if (!user) {
      return '?';
    }

    return `${user.firstName?.slice(0, 1) ?? ''}${user.lastName?.slice(0, 1) ?? ''}`.toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
