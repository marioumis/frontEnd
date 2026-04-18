import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/service/account.service';
import { UpdateProfileRequest } from '../../models/request/UpdateProfileRequest';
import { ChangePasswordRequest } from '../../models/request/ChangePasswordRequest';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-profile.component.html',
  styleUrl: './admin-profile.component.css'
})
export class AdminProfileComponent implements OnInit {
  profile: UpdateProfileRequest = {
    firstName: '',
    lastName: '',
    login: '',
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

  constructor(private readonly accountService: AccountService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.accountService.getMe().subscribe({
      next: (data) => {
        this.profile = {
          firstName: data.firstName ?? '',
          lastName: data.lastName ?? '',
          login: data.login ?? '',
          email: data.email ?? ''
        };
      },
      error: (err) => {
        console.error('Failed to load admin profile', err);
        this.profileError = this.extractError(err, 'Failed to load profile.');
      }
    });
  }

  saveProfile(): void {
    this.profileLoading = true;
    this.profileSuccess = '';
    this.profileError = '';

    const payload: UpdateProfileRequest = {
      firstName: this.profile.firstName.trim(),
      lastName: this.profile.lastName.trim(),
      login: this.profile.login.trim(),
      email: this.profile.email.trim()
    };

    this.accountService.updateProfile(payload).subscribe({
      next: (updatedProfile) => {
        this.profileLoading = false;
        this.profile = {
          firstName: updatedProfile.firstName ?? '',
          lastName: updatedProfile.lastName ?? '',
          login: updatedProfile.login ?? '',
          email: updatedProfile.email ?? ''
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

    this.accountService.changePassword({
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
