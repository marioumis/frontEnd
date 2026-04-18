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
    if (confirm('Are you sure you want to delete this user? This will also clean up any department management links.')) {
      this.adminService.deleteUser(id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== id);
        },
        error: (err) => alert('Delete failed: ' + err.message)
      });
    }
  }

  toggleUserStatus(user: AdminUserResponse): void {
    const action = user.activated ? 'deactivate' : 'activate';
    let message = `Are you sure you want to ${action} this user?`;
    
    if (user.roles.includes('DEPT_ADMIN')) {
      message = `This user is a Department Administrator. ${action.toUpperCase()}ING them will also ${action} ALL users in their department. Continue?`;
    }

    if (confirm(message)) {
      this.adminService.toggleUserStatus(user.id).subscribe({
        next: () => {
          this.loadUsers(); // Reload to see cascading changes
        },
        error: (err) => alert('Failed to toggle status: ' + err.message)
      });
    }
  }


}
