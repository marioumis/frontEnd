import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DeptAdminService } from '../../core/service/dept-admin.service';
import { TypeDocumentRequest } from '../../models/request/type-document-request.model';
import { DeptAdminTypeDocumentResponse } from '../../models/response/dept-admin-type-document-response.model';

@Component({
  selector: 'app-dept-admin-category-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dept-admin-category-page.component.html',
  styleUrl: './dept-admin-category-page.component.css'
})
export class DeptAdminCategoryPageComponent implements OnInit {
  categoryForm!: FormGroup;
  categories: DeptAdminTypeDocumentResponse[] = [];
  filteredCategories: DeptAdminTypeDocumentResponse[] = [];

  searchTerm = '';
  selectedCategoryId: number | null = null;
  isEditMode = false;
  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly deptAdminService: DeptAdminService,
    private readonly formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.categoryForm = this.formBuilder.group({
      nameType: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(255)]]
    });

    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.errorMessage = '';

    this.deptAdminService.getCategories().subscribe({
      next: (data) => {
        this.categories = [...data].sort((left, right) => left.nameType.localeCompare(right.nameType));
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load department categories', err);
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
    );
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
      description: this.description?.value?.trim() ?? ''
    };

    const request$ = this.isEditMode && this.selectedCategoryId !== null
      ? this.deptAdminService.updateCategory(this.selectedCategoryId, payload)
      : this.deptAdminService.createCategory(payload);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = this.isEditMode
          ? 'Category updated successfully.'
          : 'Category created successfully.';
        this.resetForm();
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

  onEdit(category: DeptAdminTypeDocumentResponse): void {
    this.selectedCategoryId = category.idType;
    this.isEditMode = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.categoryForm.patchValue({
      nameType: category.nameType,
      description: category.description ?? ''
    });
  }

  onDelete(id: number): void {
    const confirmed = window.confirm('Are you sure you want to delete this category?');

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.deptAdminService.deleteCategory(id).subscribe({
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
      description: ''
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
