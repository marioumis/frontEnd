import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminUserService } from '../../core/service/admin-user.service';
import { AdminUserResponse } from '../../models/response/AdminUserResponse';

@Component({
  selector: 'app-admin-user-list-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-user-list-page.component.html',
  styleUrl: './admin-user-list-page.component.css'
})
export class AdminUserListPageComponent implements OnInit {
  users: AdminUserResponse[] = [];
  loading = false;
  searchTerm = '';
  errorMessage = '';
  successMessage = '';

  constructor(private readonly adminUserService: AdminUserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.adminUserService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.errorMessage = this.extractError(err, 'Failed to load users.');
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    const term = this.searchTerm.trim();

    if (!term) {
      this.loadUsers();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.adminUserService.searchUsers(term).subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = this.extractError(err, 'Failed to search users.');
        this.loading = false;
      }
    });
  }

  deleteUser(id: number): void {
    const confirmed = window.confirm(
      'Are you sure you want to delete this user? This also removes related department management links.'
    );

    if (!confirmed) {
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';

    this.adminUserService.deleteUser(id).subscribe({
      next: () => {
        this.users = this.users.filter((user) => user.id !== id);
        this.successMessage = 'User deleted successfully.';
      },
      error: (err) => {
        this.errorMessage = this.extractError(err, 'Failed to delete user.');
      }
    });
  }

  toggleUserStatus(user: AdminUserResponse): void {
    const action = user.activated ? 'deactivate' : 'activate';
    const warning = user.roles.includes('DEPT_ADMIN')
      ? `This user is a Department Admin. ${action.toUpperCase()}ING them may affect users in their department. Continue?`
      : `Are you sure you want to ${action} this user?`;

    const confirmed = window.confirm(warning);

    if (!confirmed) {
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';

    this.adminUserService.toggleUserStatus(user.id).subscribe({
      next: (updatedUser) => {
        this.users = this.users.map((existing) => existing.id === updatedUser.id ? updatedUser : existing);
        this.successMessage = `User ${updatedUser.activated ? 'activated' : 'deactivated'} successfully.`;
      },
      error: (err) => {
        this.errorMessage = this.extractError(err, 'Failed to update user status.');
      }
    });
  }

  getInitials(user: AdminUserResponse): string {
    return `${user.firstName?.slice(0, 1) ?? ''}${user.lastName?.slice(0, 1) ?? ''}`.toUpperCase() || 'U';
  }

  getPrimaryRole(user: AdminUserResponse): string {
    return user.roles[0] ?? 'USER';
  }

  private extractError(err: unknown, fallback: string): string {
    const error = err as { error?: { message?: string } | string };

    if (typeof error?.error === 'string' && error.error.trim()) {
      return error.error;
    }

    if (typeof error?.error === 'object' && error.error?.message) {
      return error.error.message;
    }

    return fallback;
  }
}
