import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AdminUserService } from '../../core/service/admin-user.service';
import { DepartmentService } from '../../core/service/department.service';
import { AdminUserResponse } from '../../models/response/AdminUserResponse';
import { DepartmentResponse } from '../../models/response/department-response.model';
import { UpdateUserRequest } from '../../models/request/UpdateUserRequest';

type EditableUserRequest = Omit<UpdateUserRequest, 'departmentId'> & { departmentId?: number | null };

@Component({
  selector: 'app-admin-user-edit-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-user-edit-page.component.html',
  styleUrl: './admin-user-edit-page.component.css'
})
export class AdminUserEditPageComponent implements OnInit {
  userId = 0;
  user: AdminUserResponse | null = null;
  userRequest: EditableUserRequest = {};
  departments: DepartmentResponse[] = [];

  loading = false;
  saving = false;
  promoting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly adminUserService: AdminUserService,
    private readonly departmentService: DepartmentService
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.activatedRoute.snapshot.paramMap.get('id'));

    if (!Number.isFinite(this.userId) || this.userId <= 0) {
      this.errorMessage = 'Invalid user id.';
      return;
    }

    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      user: this.adminUserService.getUserById(this.userId),
      departments: this.departmentService.getDepartments()
    }).subscribe({
      next: ({ user, departments }) => {
        this.user = user;
        this.departments = departments;
        this.userRequest = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          login: user.login,
          departmentId: user.departmentId
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load user edit page', err);
        this.errorMessage = this.extractError(err, 'Failed to load user details.');
        this.loading = false;
      }
    });
  }

  onSave(): void {
    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: UpdateUserRequest = {
      login: this.userRequest.login?.trim(),
      email: this.userRequest.email?.trim(),
      firstName: this.userRequest.firstName?.trim(),
      lastName: this.userRequest.lastName?.trim(),
      departmentId: this.userRequest.departmentId ?? undefined
    };

    this.adminUserService.updateUser(this.userId, payload).subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = 'User updated successfully.';
        void this.router.navigate(['/admin/users']);
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = this.extractError(err, 'Failed to update user.');
      }
    });
  }

  makeDeptAdmin(): void {
    if (!this.user || this.user.roles.includes('DEPT_ADMIN')) {
      return;
    }

    const confirmed = window.confirm('Are you sure you want to make this user a Department Admin?');

    if (!confirmed) {
      return;
    }

    this.promoting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminUserService.makeDeptAdmin(this.userId).subscribe({
      next: (updatedUser) => {
        this.promoting = false;
        this.user = updatedUser;
        this.successMessage = 'User promoted to Department Admin successfully.';
      },
      error: (err) => {
        this.promoting = false;
        this.errorMessage = this.extractError(err, 'Failed to promote user.');
      }
    });
  }

  get primaryRole(): string {
    return this.user?.roles[0] ?? 'USER';
  }

  get canMakeDeptAdmin(): boolean {
    return !!this.user && !this.user.roles.includes('DEPT_ADMIN') && !this.user.roles.includes('ADMIN');
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
