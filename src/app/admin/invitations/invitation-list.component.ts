import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InvitationService } from '../../core/service/invitation.service';
import { InvitationResponse } from '../../models/response/invitation-response.model';
import { DepartmentResponse } from '../../models/response/department-response.model';
import { DepartmentService } from '../../core/service/department.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invitation-list',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './invitation-list.component.html',
  styleUrl: './invitation-list.component.css'
})
export class InvitationListComponent implements OnInit {
  invitations: InvitationResponse[] = [];
  filteredInvitations: InvitationResponse[] = [];
  departments: DepartmentResponse[] = [];
  searchTerm = '';
  loading = false;

  // invite modal state
  showInviteModal = false;
  inviteEmail = '';
  inviteRole = 'USER';
  inviteDepartmentId: number | null = null;
  inviteLoading = false;
  inviteError = '';

  constructor(
    private invitationService: InvitationService,
    private departmentService: DepartmentService
  ) {}

  ngOnInit(): void {
    this.loadInvitations();
    this.loadDepartments();
  }

  loadInvitations(): void {
    this.loading = true;
    this.invitationService.getAllInvitations().subscribe({
      next: (data) => {
        this.invitations = data;
        this.filteredInvitations = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching invitations', err);
        this.loading = false;
      }
    });
  }

  loadDepartments(): void {
    this.departmentService.getDepartments().subscribe({
      next: (data) => this.departments = data,
      error: (err) => console.error('Error fetching departments', err)
    });
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      this.filteredInvitations = this.invitations.filter(i => 
        i.email.toLowerCase().includes(term) ||
        (i.departmentName && i.departmentName.toLowerCase().includes(term))
      );
    } else {
      this.filteredInvitations = this.invitations;
    }
  }

  cancelInvitation(id: number): void {
    if (confirm('Are you sure you want to cancel this invitation? This will invalidate the activation link.')) {
      this.invitationService.cancelInvitation(id).subscribe({
        next: () => {
          this.loadInvitations();
        },
        error: (err) => alert('Cancel failed: ' + err.message)
      });
    }
  }

  deletePermanently(id: number): void {
    if (confirm('Are you sure you want to remove this record from history? This action is permanent.')) {
      this.invitationService.deleteAuditLog(id).subscribe({
        next: () => {
          this.loadInvitations();
        },
        error: (err) => alert('Deletion failed: ' + err.message)
      });
    }
  }

  openInviteModal(): void {
    this.inviteEmail = '';
    this.inviteRole = 'USER';
    this.inviteDepartmentId = null;
    this.inviteError = '';
    this.showInviteModal = true;
  }

  closeInviteModal(): void {
    this.showInviteModal = false;
  }

  sendInvite(): void {
    if (!this.inviteEmail.trim()) {
      this.inviteError = 'Email is required.';
      return;
    }
    
    if (this.inviteRole === 'DEPT_ADMIN' || this.inviteRole === 'USER') {
      if (!this.inviteDepartmentId) {
        this.inviteError = 'Department is required for this role.';
        return;
      }
    }

    this.inviteLoading = true;
    this.inviteError = '';
    
    const request = {
      email: this.inviteEmail,
      roleName: this.inviteRole,
      departmentId: this.inviteDepartmentId
    };

    this.invitationService.inviteUser(request).subscribe({
      next: () => {
        this.inviteLoading = false;
        this.closeInviteModal();
        this.loadInvitations();
      },
      error: (err) => {
        this.inviteLoading = false;
        if (typeof err.error === 'string') {
          this.inviteError = err.error;
        } else {
          this.inviteError = err.error?.message || 'Invitation failed. Try again.';
        }
      }
    });
  }
}
