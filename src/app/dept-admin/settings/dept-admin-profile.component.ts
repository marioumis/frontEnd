import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/service/account.service';
import { DeptAdminService } from '../../core/service/dept-admin.service';
import { ChangePasswordRequest } from '../../models/request/ChangePasswordRequest';
import { DeptAdminProfileUpdateRequest } from '../../models/request/dept-admin-profile-update-request.model';
import { CurrentUserResponse } from '../../models/response/current-user-response.model';

@Component({
  selector: 'app-dept-admin-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dept-admin-profile.component.html',
  styleUrl: './dept-admin-profile.component.css'
})
export class DeptAdminProfileComponent implements OnInit {
  currentUser: CurrentUserResponse | null = null;

  profile: DeptAdminProfileUpdateRequest = {
    firstName: '',
    lastName: '',
    email: ''
  };

  profileLoading = false;
  profileSuccess = '';
  profileError = '';

  passwords: ChangePasswordRequest & { confirmPassword: string } = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  passwordLoading = false;
  passwordSuccess = '';
  passwordError = '';

  constructor(
    private readonly accountService: AccountService,
    private readonly deptAdminService: DeptAdminService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.profileError = '';

    this.accountService.getMe().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.profile = {
          firstName: user.firstName ?? '',
          lastName: user.lastName ?? '',
          email: user.email ?? ''
        };
      },
      error: (err) => {
        console.error('Failed to load department admin profile', err);
        this.profileError = this.extractError(err, 'Failed to load profile.');
      }
    });
  }

  saveProfile(): void {
    this.profileLoading = true;
    this.profileSuccess = '';
    this.profileError = '';

    const payload: DeptAdminProfileUpdateRequest = {
      firstName: this.profile.firstName?.trim(),
      lastName: this.profile.lastName?.trim(),
      email: this.profile.email?.trim()
    };

    this.deptAdminService.updateProfile(payload).subscribe({
      next: (user) => {
        this.profileLoading = false;
        this.currentUser = user;
        this.profile = {
          firstName: user.firstName ?? '',
          lastName: user.lastName ?? '',
          email: user.email ?? ''
        };
        this.profileSuccess = 'Profile updated successfully.';
      },
      error: (err) => {
        this.profileLoading = false;
        this.profileError = this.extractError(err, 'Failed to update profile.');
      }
    });
  }

  changePassword(): void {
    this.passwordSuccess = '';
    this.passwordError = '';

    if (!this.passwords.currentPassword || !this.passwords.newPassword) {
      this.passwordError = 'Current password and new password are required.';
      return;
    }

    if (this.passwords.newPassword !== this.passwords.confirmPassword) {
      this.passwordError = 'Passwords do not match.';
      return;
    }

    this.passwordLoading = true;

    this.deptAdminService.changePassword({
      currentPassword: this.passwords.currentPassword,
      newPassword: this.passwords.newPassword
    }).subscribe({
      next: () => {
        this.passwordLoading = false;
        this.passwordSuccess = 'Password changed successfully.';
        this.passwords = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
      },
      error: (err) => {
        this.passwordLoading = false;
        this.passwordError = this.extractError(err, 'Failed to change password.');
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
