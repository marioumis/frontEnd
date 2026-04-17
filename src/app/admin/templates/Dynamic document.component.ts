import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { DynamicDocumentService } from '../../core/service/dynamic-document.service';
import { TypeDocumentService } from '../../core/service/type-document.service';
import { DynamicDocumentRequest } from '../../models/request/DynamicDocumentRequest';
import { DynamicDocumentResponse } from '../../models/response/DynamicDocumentResponse';
import { TypeDocumentResponse } from '../../models/response/type-document-response.model'; // ← your existing model path
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
type DrawerMode = 'detail' | 'create' | 'edit' | null;

@Component({
  selector: 'app-dynamic-document',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dynamic-document.component.html',
  styleUrls: ['./dynamic-document.component.css'],
})
export class DynamicDocumentComponent implements OnInit {

  allTemplates: DynamicDocumentResponse[]       = [];
  displayedTemplates: DynamicDocumentResponse[] = [];
  typeDocuments: TypeDocumentResponse[]          = [];

  selectedTemplate: DynamicDocumentResponse | null = null;
  drawerMode: DrawerMode = null;
  drawerOpen   = false;
  selectedTypeId: number | '' = '';

  loadingGrid    = false;
  submitting     = false;
  deleteTargetId: number | null = null;
  confirmOpen    = false;
  notice: { msg: string; type: 'success' | 'error' } | null = null;

  form!: FormGroup;
  selectedFile: File | null = null;
  fileError = '';

  constructor(
    private docService:  DynamicDocumentService,
    private typeService: TypeDocumentService,  // ← your existing TypeDocumentService
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadTypes();
    this.loadAll();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name:           ['', [Validators.required, Validators.maxLength(100)]],
      typeDocumentId: [null, Validators.required],
      orderIndex:     [null],
      status:         [true],
      autoScan:       [true],
    });
  }

  // uses YOUR existing getTypeDocuments() method name
  loadTypes(): void {
    this.typeService.getTypeDocuments().subscribe({
      next:  types => (this.typeDocuments = types),
      error: ()    => console.warn('Could not load type-documents'),
    });
  }

  loadAll(): void {
    this.loadingGrid = true;
    this.docService.findAll()
      .pipe(finalize(() => (this.loadingGrid = false)))
      .subscribe({
        next:  docs => { this.allTemplates = docs; this.displayedTemplates = docs; },
        error: ()   => this.showNotice('Could not load templates.', 'error'),
      });
  }

  onCategoryChange(): void {
    if (!this.selectedTypeId) {
      this.displayedTemplates = this.allTemplates;
      return;
    }
    this.loadingGrid = true;
    this.docService.findByType(+this.selectedTypeId)
      .pipe(finalize(() => (this.loadingGrid = false)))
      .subscribe({
        next:  docs => (this.displayedTemplates = docs),
        error: ()   => this.showNotice('Could not load templates for this category.', 'error'),
      });
  }

  get selectedTypeDescription(): string {
    if (!this.selectedTypeId) return '';
    return this.typeDocuments.find(x => x.idType === +this.selectedTypeId)?.description ?? '';
  }

openDetail(doc: DynamicDocumentResponse): void {
  this.router.navigate(['/admin/templates', doc.docId]);
}

  openCreate(): void {
    this.selectedTemplate = null;
    this.drawerMode = 'create';
    this.selectedFile = null;
    this.fileError = '';
    this.form.reset({ status: true });
    this.drawerOpen = true;
  }

  openEdit(doc: DynamicDocumentResponse): void {
    this.selectedTemplate = doc;
    this.drawerMode = 'edit';
    this.selectedFile = null;
    this.fileError = '';
    this.form.patchValue({
      name:           doc.name,
      typeDocumentId: doc.typeDocumentId,
      orderIndex:     doc.orderIndex,
      status:         doc.status,
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
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.drawerMode === 'create' && !this.selectedFile) {
      this.fileError = 'Please upload a .docx file';
      return;
    }

    const request: DynamicDocumentRequest = {
      name:           this.form.value.name,
      typeDocumentId: +this.form.value.typeDocumentId,
      orderIndex:     this.form.value.orderIndex ?? null,
      status:         this.form.value.status,
      autoScan:       this.form.value.autoScan, 
    };

    this.submitting = true;

    if (this.drawerMode === 'create') {
      this.docService.create(request, this.selectedFile!)
        .pipe(finalize(() => (this.submitting = false)))
        .subscribe({
          next: doc => {
            this.allTemplates.unshift(doc);
            this.refreshDisplayed();
            this.showNotice(`Template "${doc.name}" created.`);
            this.closeDrawer();
          },
          error: e => this.showNotice(`Create failed: ${e.message}`, 'error'),
        });
    } else if (this.drawerMode === 'edit' && this.selectedTemplate) {
      this.docService.update(this.selectedTemplate.docId, request, this.selectedFile ?? undefined)
        .pipe(finalize(() => (this.submitting = false)))
        .subscribe({
          next: doc => {
            const idx = this.allTemplates.findIndex(x => x.docId === doc.docId);
            if (idx > -1) this.allTemplates[idx] = doc;
            this.refreshDisplayed();
            this.showNotice(`Template "${doc.name}" updated.`);
            this.closeDrawer();
          },
          error: e => this.showNotice(`Update failed: ${e.message}`, 'error'),
        });
    }
  }

  askDelete(id: number): void { this.deleteTargetId = id; this.confirmOpen = true; }

  confirmDelete(): void {
    if (this.deleteTargetId == null) return;
    const id   = this.deleteTargetId;
    const name = this.allTemplates.find(x => x.docId === id)?.name ?? id;
    this.confirmOpen = false;
    this.docService.delete(id).subscribe({
      next: () => {
        this.allTemplates       = this.allTemplates.filter(x => x.docId !== id);
        this.displayedTemplates = this.displayedTemplates.filter(x => x.docId !== id);
        this.showNotice(`Template "${name}" deleted.`);
        if (this.selectedTemplate?.docId === id) this.closeDrawer();
      },
      error: e => this.showNotice(`Delete failed: ${e.message}`, 'error'),
    });
  }

  cancelDelete(): void { this.confirmOpen = false; this.deleteTargetId = null; }

  private refreshDisplayed(): void {
    this.displayedTemplates = this.selectedTypeId
      ? this.allTemplates.filter(x => x.typeDocumentId === +this.selectedTypeId)
      : [...this.allTemplates];
  }

  private showNotice(msg: string, type: 'success' | 'error' = 'success'): void {
    this.notice = { msg, type };
    setTimeout(() => (this.notice = null), 4000);
  }

  fieldOf(name: string) { return this.form.get(name); }
  isInvalid(name: string): boolean {
    const c = this.fieldOf(name);
    return !!(c && c.invalid && c.touched);
  }
}