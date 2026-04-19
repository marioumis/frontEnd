import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { finalize } from 'rxjs/operators';
import * as mammoth from 'mammoth';

import { DynamicDocumentService } from '../../core/service/dynamic-document.service';
import { DynamicFieldsService } from '../../core/service/dynamic-fields.service';
import { DynamicDocumentResponse } from '../../models/response/DynamicDocumentResponse';
import { DynamicFieldResponse } from '../../models/response/DynamicFieldResponse';
import { SYSTEM_VALUES, SystemValueOption } from '../../core/constants/system-values';

type FieldMode = 'create' | 'edit' | null;

@Component({
  selector: 'app-template-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './template-detail.component.html',
  styleUrls: ['./template-detail.component.css']
})
export class TemplateDetailComponent implements OnInit {

  template: DynamicDocumentResponse | null = null;
  fields: DynamicFieldResponse[] = [];
  previewUrl: SafeResourceUrl | null = null;

  loading = false;
  loadingFields = false;
  submitting = false;

  fieldMode: FieldMode = null;
  selectedField: DynamicFieldResponse | null = null;
  confirmDeleteFieldId: number | null = null;

  fieldForm!: FormGroup;
  notice: { msg: string; type: 'success' | 'error' } | null = null;

  fieldTypes: ('TEXT' | 'NUMBER' | 'DATE')[] = ['TEXT', 'NUMBER', 'DATE'];
  previewHtml: string = '';
  systemValues = SYSTEM_VALUES;

  // ✅ ADD THIS
  validationResult: {
    matched: string[];
    notInFile: string[];
    notInDb: string[];
  } | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private docService: DynamicDocumentService,
    private fieldsService: DynamicFieldsService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.buildFieldForm();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadTemplate(id);
      this.loadFields(id);
      this.loadPreview(id);
      this.validate(id); // ✅ ADD THIS
    }
  }

  private buildFieldForm(): void {
    this.fieldForm = this.fb.group({
      keyName:     ['', [Validators.required, Validators.maxLength(100)]],
      type:        ['TEXT', Validators.required],
      description: [''],
      source:      ['MANUAL', Validators.required],
      systemKey:   [null]
    });
  }

  loadTemplate(id: number): void {
    this.loading = true;
    this.docService.findById(id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next:  doc => this.template = doc,
        error: ()  => this.showNotice('Could not load template.', 'error')
      });
  }

  loadFields(id: number): void {
    this.loadingFields = true;
    this.fieldsService.findByDocument(id)
      .pipe(finalize(() => this.loadingFields = false))
      .subscribe({
        next:  fields => this.fields = fields,
        error: ()     => this.showNotice('Could not load fields.', 'error')
      });
  }

  loadPreview(id: number): void {
    this.docService.preview(id).subscribe({
      next: async (blob: Blob) => {
        const arrayBuffer = await blob.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        this.previewHtml = result.value;
      },
      error: () => this.showNotice('Preview not available.', 'error')
    });
  }

  // ✅ ADD THIS
  validate(id: number): void {
    this.docService.validate(id).subscribe({
      next: result => this.validationResult = result,
      error: () => console.warn('Validation failed')
    });
  }

  // ✅ ADD THIS
  get hasWarnings(): boolean {
    return !!(
      this.validationResult?.notInFile?.length ||
      this.validationResult?.notInDb?.length
    );
  }

  goToTest(): void {
    if (this.router.url.startsWith('/dept-admin')) {
      this.router.navigate(['/dept-admin/templates', this.template!.docId, 'test']);
    } else {
      this.router.navigate(['/admin/templates', this.template!.docId, 'test']);
    }
  }

  openCreateField(): void {
    this.selectedField = null;
    this.fieldMode = 'create';
    this.fieldForm.reset({ type: 'TEXT' });
  }

  openEditField(field: DynamicFieldResponse): void {
    this.selectedField = field;
    this.fieldMode = 'edit';
    this.fieldForm.patchValue({
      keyName:     field.keyName,
      type:        field.type,
      description: field.description ?? '',
      source:      field.source ?? 'MANUAL',
      systemKey:   field.systemKey ?? null
    });
  }

  cancelFieldForm(): void {
    this.fieldMode = null;
    this.selectedField = null;
    this.fieldForm.reset({ type: 'TEXT', source: 'MANUAL', systemKey: null });
  }

  submitField(): void {
    if (this.fieldForm.invalid) {
      this.fieldForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const docId = this.template!.docId;
    const val = this.fieldForm.value;

    if (this.fieldMode === 'create') {
      this.fieldsService.create({
        docId,
        keyName:     val.keyName,
        type:        val.type,
        description: val.description || null,
        source:      val.source || 'MANUAL',
        systemKey:   val.source === 'SYSTEM' ? (val.systemKey || null) : null
      }).pipe(finalize(() => this.submitting = false))
        .subscribe({
          next: field => {
            this.fields.push(field);
            this.validate(docId); // ✅ re-validate after adding
            this.showNotice(`Field "{{${field.keyName}}}" added.`);
            this.cancelFieldForm();
          },
          error: e => this.showNotice(`Failed: ${e.error?.message ?? e.message}`, 'error')
        });

    } else if (this.fieldMode === 'edit' && this.selectedField) {
      this.fieldsService.update(this.selectedField.fieldId, {
        keyName:     val.keyName,
        type:        val.type,
        description: val.description || null,
        source:      val.source || 'MANUAL',
        systemKey:   val.source === 'SYSTEM' ? (val.systemKey || null) : null
      }).pipe(finalize(() => this.submitting = false))
        .subscribe({
          next: updated => {
            const idx = this.fields.findIndex(f => f.fieldId === updated.fieldId);
            if (idx > -1) this.fields[idx] = updated;
            this.validate(docId); // ✅ re-validate after editing
            this.showNotice(`Field updated.`);
            this.cancelFieldForm();
          },
          error: e => this.showNotice(`Failed: ${e.error?.message ?? e.message}`, 'error')
        });
    }
  }

  askDeleteField(fieldId: number): void {
    this.confirmDeleteFieldId = fieldId;
  }

  confirmDeleteField(): void {
    if (this.confirmDeleteFieldId == null) return;
    const id = this.confirmDeleteFieldId;
    this.confirmDeleteFieldId = null;

    this.fieldsService.delete(id).subscribe({
      next: () => {
        this.fields = this.fields.filter(f => f.fieldId !== id);
        if (this.template) this.validate(this.template.docId); // ✅ re-validate after deleting
        this.showNotice('Field deleted.');
      },
      error: e => this.showNotice(`Delete failed: ${e.message}`, 'error')
    });
  }

  cancelDeleteField(): void {
    this.confirmDeleteFieldId = null;
  }

  goBack(): void {
    if (this.router.url.startsWith('/dept-admin')) {
      this.router.navigate(['/dept-admin/templates']);
    } else {
      this.router.navigate(['/admin/templates']);
    }
  }

  isInvalid(name: string): boolean {
    const c = this.fieldForm.get(name);
    return !!(c && c.invalid && c.touched);
  }

  getSystemLabel(key: string | null | undefined): string {
    if (!key) return '';
    return this.systemValues.find(s => s.key === key)?.label ?? key;
  }

  private showNotice(msg: string, type: 'success' | 'error' = 'success'): void {
    this.notice = { msg, type };
    setTimeout(() => this.notice = null, 4000);
  }
}