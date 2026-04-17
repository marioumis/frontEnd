import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminUserService } from '../../core/service/admin-user.service';
import { AdminUserResponse } from '../../models/response/AdminUserResponse';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {

  users: AdminUserResponse[] = [];
  searchTerm = '';
  loading = false;

  // invite modal state
  showInviteModal = false;
  inviteEmail = '';
  inviteLoading = false;
  inviteError = '';

  constructor(private adminService: AdminUserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching users', err);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.adminService.searchUsers(this.searchTerm)
        .subscribe(data => this.users = data);
    } else {
      this.loadUsers();
    }
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== id);
        },
        error: (err) => alert('Delete failed: ' + err.message)
      });
    }
  }

  // ── Invite modal ──
  openInviteModal(): void {
    this.inviteEmail = '';
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
    this.inviteLoading = true;
    this.inviteError = '';
    this.adminService.inviteUser(this.inviteEmail).subscribe({
      next: () => {
        this.inviteLoading = false;
        this.closeInviteModal();
        this.loadUsers(); // refresh list
      },
      error: (err) => {
        this.inviteLoading = false;
        this.inviteError = err.error?.message || 'Invitation failed. Try again.';
      }
    });
  }
}