import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AccountService } from '../../core/service/account.service';
import { DeptAdminService } from '../../core/service/dept-admin.service';
import { InvitationService } from '../../core/service/invitation.service';
import { DeptAdminInviteRequest } from '../../models/request/dept-admin-invite-request.model';
import { CurrentUserResponse } from '../../models/response/current-user-response.model';
import { DeptAdminInvitationResponse } from '../../models/response/dept-admin-invitation-response.model';

type InvitationStatusFilter = 'ALL' | 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';

@Component({
  selector: 'app-dept-admin-invitation-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dept-admin-invitation-page.component.html',
  styleUrl: './dept-admin-invitation-page.component.css'
})
export class DeptAdminInvitationPageComponent implements OnInit {
  readonly statusFilters: InvitationStatusFilter[] = ['ALL', 'PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED'];

  currentUser: CurrentUserResponse | null = null;
  invitations: DeptAdminInvitationResponse[] = [];
  filteredInvitations: DeptAdminInvitationResponse[] = [];

  loading = false;
  searchTerm = '';
  statusFilter: InvitationStatusFilter = 'ALL';
  errorMessage = '';
  successMessage = '';

  showInviteModal = false;
  inviteLoading = false;
  inviteError = '';
  inviteForm: DeptAdminInviteRequest = {
    email: ''
  };

  constructor(
    private readonly accountService: AccountService,
    private readonly deptAdminService: DeptAdminService,
    private readonly invitationService: InvitationService
  ) {}

  ngOnInit(): void {
    this.loadPageData();
  }

  loadPageData(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      currentUser: this.accountService.getMe(),
      invitations: this.deptAdminService.getInvitations()
    }).subscribe({
      next: ({ currentUser, invitations }) => {
        this.currentUser = currentUser;
        const currentEmail = currentUser.email.trim().toLowerCase();

        this.invitations = invitations
          .filter((invitation) => invitation.inviterEmail.trim().toLowerCase() === currentEmail)
          .sort((left, right) =>
          new Date(right.sentAt).getTime() - new Date(left.sentAt).getTime()
          );
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load department invitations', err);
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
        || invitation.status.toLowerCase().includes(term)
        || invitation.inviterEmail.toLowerCase().includes(term);

      const matchesStatus = this.statusFilter === 'ALL' || invitation.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  openInviteModal(): void {
    this.showInviteModal = true;
    this.inviteLoading = false;
    this.inviteError = '';
    this.inviteForm = { email: '' };
  }

  closeInviteModal(): void {
    this.showInviteModal = false;
    this.inviteLoading = false;
    this.inviteError = '';
  }

  sendInvite(): void {
    this.inviteError = '';
    this.successMessage = '';

    if (!this.inviteForm.email.trim()) {
      this.inviteError = 'Email is required.';
      return;
    }

    this.inviteLoading = true;

    this.deptAdminService.inviteUser({
      email: this.inviteForm.email.trim()
    }).subscribe({
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

    this.errorMessage = '';
    this.successMessage = '';

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

    this.errorMessage = '';
    this.successMessage = '';

    this.invitationService.deleteAuditLog(id).subscribe({
      next: () => {
        this.successMessage = 'Invitation history deleted successfully.';
        this.loadPageData();
      },
      error: (err) => {
        this.errorMessage = this.extractError(err, 'Failed to delete invitation history.');
      }
    });
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
