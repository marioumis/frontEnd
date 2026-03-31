import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { DepartmentService } from '../../core/service/department.service';
import { DepartmentResponse } from '../../models/response/department-response.model';
import { DepartmentRequest } from '../../models/request/department-request.model';

@Component({
  selector: 'app-department',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './department.component.html',
    styleUrls: ['./department.component.css']
})
export class DepartmentComponent implements OnInit {

  departments: DepartmentResponse[] = [];
  departmentForm!: FormGroup;

  selectedDepartmentId: number | null = null;
  isEditMode = false;

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private departmentService: DepartmentService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadDepartments();
  }

  // ✅ Init form
  initForm(): void {
    this.departmentForm = this.fb.group({
      nomDep: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(255)]]
    });
  }

  // ✅ Load all departments
  loadDepartments(): void {
    this.loading = true;

    this.departmentService.getDepartments().subscribe({
      next: (data) => {
        this.departments = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load departments';
        this.loading = false;
      }
    });
  }

  // ✅ Submit (CREATE or UPDATE)
  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      return;
    }

    const payload: DepartmentRequest = {
      nomDep: this.departmentForm.value.nomDep,
      description: this.departmentForm.value.description
    };

    // 🔥 UPDATE
    if (this.isEditMode && this.selectedDepartmentId !== null) {
      this.departmentService.updateDepartment(this.selectedDepartmentId, payload).subscribe({
        next: () => {
          this.successMessage = 'Department updated successfully';
          this.resetForm();
          this.loadDepartments();
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = this.extractError(err);
        }
      });
    }

    // 🔥 CREATE
    else {
      this.departmentService.createDepartment(payload).subscribe({
        next: () => {
          this.successMessage = 'Department created successfully';
          this.resetForm();
          this.loadDepartments();
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = this.extractError(err);
        }
      });
    }
  }

  // ✅ Edit
  onEdit(department: DepartmentResponse): void {
    this.isEditMode = true;
    this.selectedDepartmentId = department.idDep;

    this.departmentForm.patchValue({
      nomDep: department.nomDep,
      description: department.description
    });

    this.successMessage = '';
    this.errorMessage = '';
  }

  // ✅ Delete
  onDelete(id: number): void {
    const confirmDelete = window.confirm('Are you sure you want to delete this department?');
    if (!confirmDelete) return;

    this.departmentService.deleteDepartment(id).subscribe({
      next: () => {
        this.successMessage = 'Department deleted successfully';

        // if deleting the one being edited
        if (this.selectedDepartmentId === id) {
          this.resetForm();
        }

        this.loadDepartments();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = this.extractError(err);
      }
    });
  }

  // ✅ Reset form
  resetForm(): void {
    this.departmentForm.reset();
    this.isEditMode = false;
    this.selectedDepartmentId = null;
    this.errorMessage = '';
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

  // ✅ Getters (for HTML validation)
  get nomDep() {
    return this.departmentForm.get('nomDep');
  }

  get description() {
    return this.departmentForm.get('description');
  }
}