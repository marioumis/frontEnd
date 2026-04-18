import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AccountService } from '../../core/service/account.service';
import { DeptAdminService } from '../../core/service/dept-admin.service';
import { CurrentUserResponse } from '../../models/response/current-user-response.model';
import { DeptAdminDepartmentUserResponse } from '../../models/response/dept-admin-department-user-response.model';

@Component({
  selector: 'app-dept-admin-users-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dept-admin-users-page.component.html',
  styleUrl: './dept-admin-users-page.component.css'
})
export class DeptAdminUsersPageComponent implements OnInit {
  currentUser: CurrentUserResponse | null = null;
  users: DeptAdminDepartmentUserResponse[] = [];
  filteredUsers: DeptAdminDepartmentUserResponse[] = [];

  loading = false;
  searchTerm = '';
  errorMessage = '';

  constructor(
    private readonly accountService: AccountService,
    private readonly deptAdminService: DeptAdminService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      currentUser: this.accountService.getMe(),
      users: this.deptAdminService.getDepartmentUsers()
    }).subscribe({
      next: ({ currentUser, users }) => {
        this.currentUser = currentUser;
        this.users = [...users].sort((left, right) => left.fullName.localeCompare(right.fullName));
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load department users', err);
        this.errorMessage = this.extractError(err, 'Failed to load department users.');
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredUsers = this.users.filter((user) =>
      !term
      || user.fullName.toLowerCase().includes(term)
      || user.email.toLowerCase().includes(term)
      || this.formatRoles(user.roles).toLowerCase().includes(term)
    );
  }

  getInitials(user: DeptAdminDepartmentUserResponse): string {
    return user.fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'U';
  }

  formatRoles(roles: string[]): string {
    return [...roles].sort().join(', ');
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
