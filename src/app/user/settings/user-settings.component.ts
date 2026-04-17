import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {AccountService} from '../../core/service/account.service';
import { UpdateProfileRequest } from '../../models/request/UpdateProfileRequest';
import { ChangePasswordRequest } from '../../models/request/ChangePasswordRequest';
@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.css'
})
export class UserSettingsComponent implements OnInit {

  profile: UpdateProfileRequest = {
    firstName: '', lastName: '', login: '', email: ''
  };
  profileLoading = false;
  profileSuccess = '';
  profileError = '';

  passwords: ChangePasswordRequest & { confirmPassword: string } = {
    currentPassword: '', newPassword: '', confirmPassword: ''
  };
  passwordLoading = false;
  passwordSuccess = '';
  passwordError = '';

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.accountService.getMe().subscribe({
      next: (data) => {
        this.profile = {
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          login: data.login || '',
          email: data.email || ''
        };
      },
      error: (err) => console.error('Failed to load profile', err)
    });
  }

  saveProfile(): void {
    this.profileLoading = true;
    this.profileSuccess = '';
    this.profileError = '';

    this.accountService.updateProfile(this.profile).subscribe({
      next: () => {
        this.profileLoading = false;
        this.profileSuccess = 'Profile updated successfully!';
        setTimeout(() => this.profileSuccess = '', 4000);
      },
      error: (err) => {
        this.profileLoading = false;
        this.profileError = err.error?.message || 'Update failed. Try again.';
      }
    });
  }

  resetPassword(): void {
    if (this.passwords.newPassword !== this.passwords.confirmPassword) {
      this.passwordError = 'Passwords do not match.';
      return;
    }
    if (this.passwords.newPassword.length < 4) {
      this.passwordError = 'Password must be at least 4 characters.';
      return;
    }

    this.passwordLoading = true;
    this.passwordSuccess = '';
    this.passwordError = '';

    this.accountService.changePassword({
      currentPassword: this.passwords.currentPassword,
      newPassword: this.passwords.newPassword
    }).subscribe({
      next: () => {
        this.passwordLoading = false;
        this.passwordSuccess = 'Password changed successfully!';
        this.passwords = { currentPassword: '', newPassword: '', confirmPassword: '' };
        setTimeout(() => this.passwordSuccess = '', 4000);
      },
      error: (err) => {
        this.passwordLoading = false;
        this.passwordError = err.error?.message || 'Failed to change password.';
      }
    });
  }
}