import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { TypeDocumentService } from '../../core/service/type-document.service';
import { TypeDocumentRequest } from '../../models/request/type-document-request.model';
import { TypeDocumentResponse } from '../../models/response/type-document-response.model';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './type-document.component.html',
  styleUrls: ['./type-document.component.css']
})
export class CategoryComponent implements OnInit {

  typeDocuments: TypeDocumentResponse[] = [];
  categoryForm!: FormGroup;

  selectedTypeId: number | null = null;
  isEditMode = false;

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private typeDocumentService: TypeDocumentService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadTypeDocuments();
  }

  initForm(): void {
    this.categoryForm = this.fb.group({
      nameType: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(255)]]
    });
  }

  loadTypeDocuments(): void {
    this.loading = true;

    this.typeDocumentService.getTypeDocuments().subscribe({
      next: (data) => {
        this.typeDocuments = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load categories';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const payload: TypeDocumentRequest = {
      nameType: this.categoryForm.value.nameType,
      description: this.categoryForm.value.description
    };

    if (this.isEditMode && this.selectedTypeId !== null) {
      this.typeDocumentService.updateTypeDocument(this.selectedTypeId, payload).subscribe({
        next: () => {
          this.successMessage = 'Category updated successfully';
          this.resetForm();
          this.loadTypeDocuments();
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = this.extractError(err);
        }
      });
    } else {
      this.typeDocumentService.createTypeDocument(payload).subscribe({
        next: () => {
          this.successMessage = 'Category created successfully';
          this.resetForm();
          this.loadTypeDocuments();
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = this.extractError(err);
        }
      });
    }
  }

  onEdit(typeDocument: TypeDocumentResponse): void {
    this.isEditMode = true;
    this.selectedTypeId = typeDocument.idType;

    this.categoryForm.patchValue({
      nameType: typeDocument.nameType,
      description: typeDocument.description
    });

    this.errorMessage = '';
    this.successMessage = '';
  }

  onDelete(id: number): void {
    const confirmed = window.confirm('Are you sure you want to delete this category?');
    if (!confirmed) return;

    this.typeDocumentService.deleteTypeDocument(id).subscribe({
      next: () => {
        this.successMessage = 'Category deleted successfully';

        if (this.selectedTypeId === id) {
          this.resetForm();
        }

        this.loadTypeDocuments();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = this.extractError(err);
      }
    });
  }

  resetForm(): void {
    this.categoryForm.reset();
    this.isEditMode = false;
    this.selectedTypeId = null;
    this.errorMessage = '';
  }

  private extractError(err: any): string {
    if (err?.error?.message) {
      return err.error.message;
    }

    if (typeof err?.error === 'string') {
      return err.error;
    }

    return 'Something went wrong';
  }

  get nameType() {
    return this.categoryForm.get('nameType');
  }

  get description() {
    return this.categoryForm.get('description');
  }
}