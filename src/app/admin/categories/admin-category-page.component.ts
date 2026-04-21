import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TypeDocumentService } from '../../core/service/type-document.service';
import { TypeDocumentRequest } from '../../models/request/type-document-request.model';
import { TypeDocumentResponse } from '../../models/response/type-document-response.model';
import { DepartmentService } from '../../core/service/department.service';
import { DepartmentResponse } from '../../models/response/department-response.model';

interface AdminCategoryView extends TypeDocumentResponse {
  departmentId?: number | null;
  departmentName?: string | null;
}

@Component({
  selector: 'app-admin-category-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-category-page.component.html',
  styleUrl: './admin-category-page.component.css'
})
export class AdminCategoryPageComponent implements OnInit {
  categoryForm!: FormGroup;
  categories: AdminCategoryView[] = [];
  filteredCategories: AdminCategoryView[] = [];
  departments: DepartmentResponse[] = [];

  searchTerm = '';
  selectedCategoryId: number | null = null;
  
  showModal = false;
  isEditMode = false;
  loading = false;
  loadingDepartments = false;
  saving = false;
  showDepartmentColumn = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly typeDocumentService: TypeDocumentService,
    private readonly formBuilder: FormBuilder,
    private departmentService: DepartmentService
  ) {}

  ngOnInit(): void {
    this.categoryForm = this.formBuilder.group({
      nameType: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(255)]],
      departmentId: [null]
    });
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.errorMessage = '';

    this.typeDocumentService.getTypeDocuments().subscribe({
      next: (data) => {
        this.categories = [...(data as AdminCategoryView[])].sort((left, right) =>
          left.nameType.localeCompare(right.nameType)
        );
        this.showDepartmentColumn = this.categories.some((category) => !!category.departmentName);
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load categories', err);
        this.errorMessage = this.extractError(err, 'Failed to load categories.');
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredCategories = this.categories.filter((category) =>
      !term
      || category.nameType.toLowerCase().includes(term)
      || (category.description ?? '').toLowerCase().includes(term)
      || (category.departmentName ?? '').toLowerCase().includes(term)
    );
  }

  loadDepartments(): void {
    this.loadingDepartments = true;
    this.departmentService.getDepartments().subscribe({
      next: (res) => {
        this.departments = res;
        this.loadingDepartments = false;
      },
      error: () => {
        this.loadingDepartments = false;
      }
    });
  }

  openModal(category?: AdminCategoryView): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.showModal = true;
    this.isEditMode = !!category;
    this.selectedCategoryId = category ? category.idType : null;

    if (this.departments.length === 0) {
      this.loadDepartments();
    }

    if (category) {
      this.categoryForm.patchValue({
        nameType: category.nameType,
        description: category.description ?? '',
        departmentId: category.departmentId || null
      });
    } else {
      this.resetForm();
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    const payload: TypeDocumentRequest = {
      nameType: this.nameType?.value.trim() ?? '',
      description: this.description?.value?.trim() ?? '',
      departmentId: this.departmentId?.value || null
    };

    const request$ = this.isEditMode && this.selectedCategoryId !== null
      ? this.typeDocumentService.updateTypeDocument(this.selectedCategoryId, payload)
      : this.typeDocumentService.createTypeDocument(payload);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = this.isEditMode
          ? 'Category updated successfully.'
          : 'Category created successfully.';
        this.closeModal();
        this.loadCategories();
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = this.extractError(
          err,
          this.isEditMode ? 'Failed to update category.' : 'Failed to create category.'
        );
      }
    });
  }

  onEdit(category: AdminCategoryView): void {
    this.openModal(category);
  }

  onDelete(id: number): void {
    const confirmed = window.confirm('Are you sure you want to delete this category?');

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.typeDocumentService.deleteTypeDocument(id).subscribe({
      next: () => {
        if (this.selectedCategoryId === id) {
          this.resetForm();
        }

        this.successMessage = 'Category deleted successfully.';
        this.loadCategories();
      },
      error: (err) => {
        this.errorMessage = this.extractError(err, 'Failed to delete category.');
      }
    });
  }

  resetForm(): void {
    this.categoryForm.reset({
      nameType: '',
      description: '',
      departmentId: null
    });
    this.selectedCategoryId = null;
    this.isEditMode = false;
  }

  get nameType() {
    return this.categoryForm.get('nameType');
  }

  get description() {
    return this.categoryForm.get('description');
  }

  get departmentId() {
    return this.categoryForm.get('departmentId');
  }

  // Extracted Error

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
