import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';

import { DepartmentService } from '../../core/service/department.service';
import { DepartmentResponse } from '../../models/response/department-response.model';
import { DepartmentRequest } from '../../models/request/department-request.model';
import { AdminUserService } from '../../core/service/admin-user.service';
import { AdminUserResponse } from '../../models/response/AdminUserResponse';

@Component({
  selector: 'app-department',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './department.component.html',
    styleUrls: ['./department.component.css']
})
export class DepartmentComponent implements OnInit {

  departments: DepartmentResponse[] = [];
  filteredDepartments: DepartmentResponse[] = [];
  users: AdminUserResponse[] = [];
  
  departmentForm!: FormGroup;
  showModal = false;
  isEditMode = false;
  selectedDepartmentId: number | null = null;
  searchTerm = '';

  loading = false;
  loadingUsers = false;
  saving = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private departmentService: DepartmentService,
    private adminUserService: AdminUserService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.departmentForm = this.fb.group({
      nomDep: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(255)]],
      deptAdminId: [null]
    });
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loading = true;
    this.departmentService.getDepartments().subscribe({
      next: (data) => {
        this.departments = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load departments';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredDepartments = [...this.departments];
      return;
    }

    this.filteredDepartments = this.departments.filter(dept => 
      dept.nomDep.toLowerCase().includes(term) ||
      (dept.description && dept.description.toLowerCase().includes(term)) ||
      (dept.deptAdminName && dept.deptAdminName.toLowerCase().includes(term)) ||
      dept.idDep.toString().includes(term)
    );
  }

  loadUsers(): void {
    this.loadingUsers = true;
    this.adminUserService.getUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.loadingUsers = false;
      },
      error: () => {
        this.loadingUsers = false;
      }
    });
  }

  openModal(department?: DepartmentResponse): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.showModal = true;
    this.isEditMode = !!department;
    this.selectedDepartmentId = department ? department.idDep : null;

    if (this.users.length === 0) {
      this.loadUsers();
    }

    if (department) {
      this.departmentForm.patchValue({
        nomDep: department.nomDep,
        description: department.description,
        deptAdminId: null // Edit mode defaults to null or unassigned since we only get name from backend originally
      });
    } else {
      this.departmentForm.reset({
        nomDep: '',
        description: '',
        deptAdminId: null
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.departmentForm.reset();
  }

  onSubmit(): void {
    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = this.departmentForm.value;

    if (this.isEditMode && this.selectedDepartmentId) {
      this.departmentService.updateDepartment(this.selectedDepartmentId, payload).subscribe({
        next: () => {
          this.successMessage = 'Department updated successfully';
          this.saving = false;
          this.closeModal();
          this.loadDepartments();
        },
        error: (err) => {
          this.saving = false;
          this.errorMessage = this.extractError(err);
        }
      });
    } else {
      this.departmentService.createDepartment(payload).subscribe({
        next: () => {
          this.successMessage = 'Department created successfully';
          this.saving = false;
          this.closeModal();
          this.loadDepartments();
        },
        error: (err) => {
          this.saving = false;
          this.errorMessage = this.extractError(err);
        }
      });
    }
  }

  onEdit(department: DepartmentResponse): void {
    this.openModal(department);
  }

  // ✅ Delete
  onDelete(id: number): void {
    const confirmDelete = window.confirm('Are you sure you want to delete this department?');
    if (!confirmDelete) return;

    this.departmentService.deleteDepartment(id).subscribe({
      next: () => {
        this.successMessage = 'Department deleted successfully';
        this.loadDepartments();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = this.extractError(err);
      }
    });
  }

  get nomDep() {
    return this.departmentForm.get('nomDep');
  }

  // ✅ Extract backend error message
  private extractError(err: any): string {
    if (err?.error?.message) {
      return err.error.message;
    }
    if (typeof err?.error === 'string') {
      return err.error;
    }
    return 'Something went wrong';
  }
}
