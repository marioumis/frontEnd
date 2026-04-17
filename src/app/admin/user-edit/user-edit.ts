import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminUserService } from '../../core/service/admin-user.service';
import { AdminUserResponse } from '../../models/response/AdminUserResponse';
import { UpdateUserRequest } from '../../models/request/UpdateUserRequest';
import { DepartmentService } from '../../core/service/department.service';
import { DepartmentResponse } from '../../models/response/department-response.model';
@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './user-edit.html',
  styleUrl: './user-edit.css'
})
export class UserEditComponent implements OnInit {
  departments: DepartmentResponse[] = [];
  userId!: number;
  userRequest: UpdateUserRequest = {}; 
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deptService: DepartmentService,
    private adminService: AdminUserService // Using the service you provided
  ) {}

ngOnInit(): void {
  // Grab the ID from the URL
  this.userId = Number(this.route.snapshot.paramMap.get('id'));
  
  // Load the list of departments first, THEN load the user
  this.deptService.getDepartments().subscribe({
    next: (deptList) => {
      this.departments = deptList;
      this.loadUser(); // Now that we have the list, we fill the user form
    }
  });
}
  loadData(): void {
    // Clean Arch approach: Fetch all necessary data for the view
    this.deptService.getDepartments().subscribe({
      next: (depts) => {
        this.departments = depts;
        this.loadUser(); 
      }
    });
  }

  loadUser(): void {
    this.loading = true;
    // 2. Call getUserById(id) method
    this.adminService.getUserById(this.userId).subscribe({
      next: (data: AdminUserResponse) => {
        // Fill the request object so the inputs show the current data
        this.userRequest = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          login: data.login,
          departmentId: data.departmentId || undefined
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch user data', err);
        this.loading = false;
      }
    });
  }
makeDeptAdmin(): void {
  if (confirm('Are you sure you want to make this user a Department Admin?')) {
    this.adminService.makeDeptAdmin(this.userId).subscribe({
      next: () => alert('User is now a Department Admin!'),
      error: (err) => alert('Failed: ' + err.message)
    });
  }
}
  onSave(): void {
    // 3. Call updateUser(id, request) method
    this.adminService.updateUser(this.userId, this.userRequest).subscribe({
      next: () => {
        alert('User updated successfully!');
        this.router.navigate(['/admin/users']); // Navigate back to list
      },
      error: (err) => alert('Update failed: ' + err.message)
    });
  }
}