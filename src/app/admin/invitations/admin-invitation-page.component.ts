import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { InvitationService } from '../../core/service/invitation.service';
import { DepartmentService } from '../../core/service/department.service';
import { InvitationResponse } from '../../models/response/invitation-response.model';
import { DepartmentResponse } from '../../models/response/department-response.model';
import { InviteUserRequest } from '../../models/request/invite-user-request.model';

type InvitationRole = 'ADMIN' | 'DEPT_ADMIN' | 'USER';
type InvitationStatusFilter = 'ALL' | InvitationResponse['status'];

@Component({
  selector: 'app-admin-invitation-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-invitation-page.component.html',
  styleUrl: './admin-invitation-page.component.css'
})
export class AdminInvitationPageComponent implements OnInit {
  readonly roles: InvitationRole[] = ['ADMIN', 'DEPT_ADMIN', 'USER'];
  readonly statusFilters: InvitationStatusFilter[] = ['ALL', 'PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED'];

  invitations: InvitationResponse[] = [];
  filteredInvitations: InvitationResponse[] = [];
  departments: DepartmentResponse[] = [];

  searchTerm = '';
  statusFilter: InvitationStatusFilter = 'ALL';
  loading = false;
  errorMessage = '';
  successMessage = '';

  showInviteModal = false;
  inviteForm: InviteUserRequest = {
    email: '',
    roleName: 'USER',
    departmentId: null
  };
  inviteLoading = false;
  inviteError = '';

  constructor(
    private readonly invitationService: InvitationService,
    private readonly departmentService: DepartmentService
  ) {}

  ngOnInit(): void {
    this.loadPageData();
  }

  loadPageData(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      invitations: this.invitationService.getAllInvitations(),
      departments: this.departmentService.getDepartments()
    }).subscribe({
      next: ({ invitations, departments }) => {
        this.invitations = [...invitations].sort((left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
        );
        this.departments = departments;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load invitation page', err);
        this.errorMessage = this.extractError(err, 'Failed to load invitations.');
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredInvitations = this.invitations.filter((invitation) => {
      const matchesSearch = !term
        || invitation.email.toLowerCase().includes(term)
        || invitation.role.toLowerCase().includes(term)
        || invitation.status.toLowerCase().includes(term)
        || (invitation.departmentName ?? '').toLowerCase().includes(term)
        || invitation.inviterEmail.toLowerCase().includes(term);

      const matchesStatus = this.statusFilter === 'ALL' || invitation.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  openInviteModal(): void {
    this.showInviteModal = true;
    this.inviteError = '';
    this.inviteForm = {
      email: '',
      roleName: 'USER',
      departmentId: null
    };
  }

  closeInviteModal(): void {
    this.showInviteModal = false;
    this.inviteLoading = false;
    this.inviteError = '';
  }

  onRoleChange(): void {
    if (!this.requiresDepartmentSelection) {
      this.inviteForm.departmentId = null;
    }
  }

  sendInvite(): void {
    this.inviteError = '';
    this.successMessage = '';

    if (!this.inviteForm.email.trim()) {
      this.inviteError = 'Email is required.';
      return;
    }

    if (this.requiresDepartmentSelection && !this.inviteForm.departmentId) {
      this.inviteError = 'Department is required for this role.';
      return;
    }

    const payload: InviteUserRequest = {
      email: this.inviteForm.email.trim(),
      roleName: this.inviteForm.roleName,
      departmentId: this.requiresDepartmentSelection ? this.inviteForm.departmentId ?? null : null
    };

    this.inviteLoading = true;

    this.invitationService.inviteUser(payload).subscribe({
      next: () => {
        this.inviteLoading = false;
        this.closeInviteModal();
        this.successMessage = 'Invitation sent successfully.';
        this.loadPageData();
      },
      error: (err) => {
        this.inviteLoading = false;
        this.inviteError = this.extractError(err, 'Failed to send invitation.');
      }
    });
  }

  cancelInvitation(id: number): void {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this invitation? This will invalidate the activation link.'
    );

    if (!confirmed) {
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';

    this.invitationService.cancelInvitation(id).subscribe({
      next: () => {
        this.successMessage = 'Invitation cancelled successfully.';
        this.loadPageData();
      },
      error: (err) => {
        this.errorMessage = this.extractError(err, 'Failed to cancel invitation.');
      }
    });
  }

  deletePermanently(id: number): void {
    const confirmed = window.confirm(
      'Are you sure you want to remove this invitation from history? This action is permanent.'
    );

    if (!confirmed) {
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';

    this.invitationService.deleteAuditLog(id).subscribe({
      next: () => {
        this.successMessage = 'Invitation audit record deleted successfully.';
        this.loadPageData();
      },
      error: (err) => {
        this.errorMessage = this.extractError(err, 'Failed to delete invitation history.');
      }
    });
  }

  get requiresDepartmentSelection(): boolean {
    return this.inviteForm.roleName === 'DEPT_ADMIN' || this.inviteForm.roleName === 'USER';
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
