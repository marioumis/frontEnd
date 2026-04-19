import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { DeptAdminService } from '../../core/service/dept-admin.service';
import { DynamicDocumentRequest } from '../../models/request/DynamicDocumentRequest';
import { DynamicDocumentResponse } from '../../models/response/DynamicDocumentResponse';
import { DeptAdminTypeDocumentResponse } from '../../models/response/dept-admin-type-document-response.model';

type DrawerMode = 'create' | 'edit' | null;

@Component({
  selector: 'app-dept-admin-template-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dept-admin-template-page.component.html',
  styleUrl: './dept-admin-template-page.component.css'
})
export class DeptAdminTemplatePageComponent implements OnInit {
  allTemplates: DynamicDocumentResponse[] = [];
  displayedTemplates: DynamicDocumentResponse[] = [];
  typeDocuments: DeptAdminTypeDocumentResponse[] = [];

  selectedTemplate: DynamicDocumentResponse | null = null;
  drawerMode: DrawerMode = null;
  drawerOpen = false;
  selectedTypeId: number | '' = '';

  loadingGrid = false;
  submitting = false;
  deleteTargetId: number | null = null;
  confirmOpen = false;
  notice: { msg: string; type: 'success' | 'error' } | null = null;

  form!: FormGroup;
  selectedFile: File | null = null;
  fileError = '';

  constructor(
    private readonly deptAdminService: DeptAdminService,
    private readonly formBuilder: FormBuilder,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadTypes();
    this.loadAll();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      typeDocumentId: [null, Validators.required],
      orderIndex: [null],
      status: [true],
      autoScan: [true]
    });
  }

  loadTypes(): void {
    this.deptAdminService.getCategories().subscribe({
      next: (types) => {
        this.typeDocuments = types;

        if (this.selectedTypeId && !types.some((type) => type.idType === +this.selectedTypeId)) {
          this.selectedTypeId = '';
        }
      },
      error: () => console.warn('Could not load department categories')
    });
  }

  loadAll(): void {
    this.loadingGrid = true;

    this.deptAdminService.getTemplates()
      .pipe(finalize(() => (this.loadingGrid = false)))
      .subscribe({
        next: (documents) => {
          this.allTemplates = documents;
          this.refreshDisplayed();
        },
        error: () => this.showNotice('Could not load department templates.', 'error')
      });
  }

  onCategoryChange(): void {
    this.refreshDisplayed();
  }

  get selectedTypeDescription(): string {
    if (!this.selectedTypeId) {
      return '';
    }

    return this.typeDocuments.find((type) => type.idType === +this.selectedTypeId)?.description ?? '';
  }

  openCreate(): void {
    this.selectedTemplate = null;
    this.drawerMode = 'create';
    this.selectedFile = null;
    this.fileError = '';
    this.form.reset({ status: true, autoScan: true, typeDocumentId: null, orderIndex: null, name: '' });
    this.drawerOpen = true;
  }

  openEdit(template: DynamicDocumentResponse): void {
    this.selectedTemplate = template;
    this.drawerMode = 'edit';
    this.selectedFile = null;
    this.fileError = '';

    this.form.patchValue({
      name: template.name,
      typeDocumentId: template.typeDocumentId,
      orderIndex: template.orderIndex,
      status: template.status,
      autoScan: template.dynamicFields.length > 0
    });

    this.drawerOpen = true;
  }

  closeDrawer(): void {
    this.drawerOpen = false;
    this.drawerMode = null;
    this.selectedTemplate = null;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.fileError = '';
  }

  submit(): void {
    this.fileError = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.drawerMode === 'create' && !this.selectedFile) {
      this.fileError = 'Please upload a .doc or .docx file.';
      return;
    }

    const request: DynamicDocumentRequest = {
      name: this.form.value.name,
      typeDocumentId: +this.form.value.typeDocumentId,
      orderIndex: this.form.value.orderIndex ?? null,
      status: this.form.value.status,
      autoScan: this.form.value.autoScan
    };

    this.submitting = true;

    if (this.drawerMode === 'create') {
      this.deptAdminService.createTemplate(request, this.selectedFile!)
        .pipe(finalize(() => (this.submitting = false)))
        .subscribe({
          next: (document) => {
            this.allTemplates.unshift(document);
            this.refreshDisplayed();
            this.showNotice(`Template "${document.name}" created.`);
            this.closeDrawer();
          },
          error: (err) => this.showNotice(this.extractError(err, 'Create failed.'), 'error')
        });
      return;
    }

    if (this.drawerMode === 'edit' && this.selectedTemplate) {
      this.deptAdminService.updateTemplate(this.selectedTemplate.docId, request, this.selectedFile ?? undefined)
        .pipe(finalize(() => (this.submitting = false)))
        .subscribe({
          next: (document) => {
            const index = this.allTemplates.findIndex((existing) => existing.docId === document.docId);

            if (index > -1) {
              this.allTemplates[index] = document;
            }

            this.refreshDisplayed();
            this.showNotice(`Template "${document.name}" updated.`);
            this.closeDrawer();
          },
          error: (err) => this.showNotice(this.extractError(err, 'Update failed.'), 'error')
        });
    }
  }

  askDelete(id: number): void {
    this.deleteTargetId = id;
    this.confirmOpen = true;
  }

  confirmDelete(): void {
    if (this.deleteTargetId == null) {
      return;
    }

    const id = this.deleteTargetId;
    const name = this.allTemplates.find((template) => template.docId === id)?.name ?? id;
    this.confirmOpen = false;

    this.deptAdminService.deleteTemplate(id).subscribe({
      next: () => {
        this.allTemplates = this.allTemplates.filter((template) => template.docId !== id);
        this.displayedTemplates = this.displayedTemplates.filter((template) => template.docId !== id);
        this.showNotice(`Template "${name}" deleted.`);

        if (this.selectedTemplate?.docId === id) {
          this.closeDrawer();
        }
      },
      error: (err) => this.showNotice(this.extractError(err, 'Delete failed.'), 'error')
    });
  }

  cancelDelete(): void {
    this.confirmOpen = false;
    this.deleteTargetId = null;
  }

  openTest(document: DynamicDocumentResponse): void {
    this.router.navigate(['/dept-admin/templates', document.docId, 'test']);
  }

  openFields(document: DynamicDocumentResponse): void {
    this.router.navigate(['/dept-admin/templates', document.docId]);
  }

  fieldCount(document: DynamicDocumentResponse): number {
    return document.dynamicFields.length;
  }

  scanModeLabel(document: DynamicDocumentResponse): 'Auto' | 'Manual' {
    return this.fieldCount(document) > 0 ? 'Auto' : 'Manual';
  }

  private refreshDisplayed(): void {
    this.displayedTemplates = this.selectedTypeId
      ? this.allTemplates.filter((template) => template.typeDocumentId === +this.selectedTypeId)
      : [...this.allTemplates];
  }

  private showNotice(msg: string, type: 'success' | 'error' = 'success'): void {
    this.notice = { msg, type };
    setTimeout(() => (this.notice = null), 4000);
  }

  private extractError(err: unknown, fallback: string): string {
    const error = err as { error?: { message?: string } | string; message?: string };

    if (typeof error?.error === 'string' && error.error.trim()) {
      return error.error;
    }

    if (typeof error?.error === 'object' && error.error?.message) {
      return error.error.message;
    }

    if (error?.message) {
      return error.message;
    }

    return fallback;
  }
}
