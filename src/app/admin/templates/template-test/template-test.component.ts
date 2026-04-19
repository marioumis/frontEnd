import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';

import { DynamicDocumentService } from '../../../core/service/dynamic-document.service';
import { DynamicFieldsService } from '../../../core/service/dynamic-fields.service';
import { AuthService } from '../../../core/service/auth.service';
import { UserDocumentService } from '../../../core/service/user-document.service';
import { DynamicDocumentResponse } from '../../../models/response/DynamicDocumentResponse';
import { DynamicFieldResponse } from '../../../models/response/DynamicFieldResponse';
import { CurrentUserResponse } from '../../../models/response/current-user-response.model';
import { SYSTEM_VALUES, SystemValueOption } from '../../../core/constants/system-values';

interface FieldState {
  field: DynamicFieldResponse;
  source: 'MANUAL' | 'SYSTEM';
  manualValue: string;
  systemKey: string;
  resolvedValue: string;
}

@Component({
  selector: 'app-template-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './template-test.component.html',
  styleUrls: ['./template-test.component.css']
})
export class TemplateTestComponent implements OnInit {

  template: DynamicDocumentResponse | null = null;
  fieldStates: FieldState[] = [];
  currentUser: CurrentUserResponse | null = null;

  systemValues = SYSTEM_VALUES;

  loading = false;
  generating = false;

  templatePreviewHtml: SafeHtml | null = null;
  generatedPreviewUrl: SafeResourceUrl | null = null;
  previewMode: 'template' | 'generated' = 'template';
  generatedFileName: string | null = null;
  generatedDocId: number | null = null;

  validationResult: any = null;

  notice: { msg: string; type: 'success' | 'error' } | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private docService: DynamicDocumentService,
    private fieldsService: DynamicFieldsService,
    private authService: AuthService,
    private userDocService: UserDocumentService,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadCurrentUser(() => {
        this.loadTemplate(id);
        this.loadFields(id);
        this.loadTemplatePreview(id);
        this.validate(id);
      });
    }
  }

  loadCurrentUser(callback: () => void): void {
    this.authService.getCurrentUser().subscribe({
      next: user => {
        this.currentUser = user;
        callback();
      },
      error: () => callback()
    });
  }

  loadTemplate(id: number): void {
    this.loading = true;
    this.docService.findById(id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: doc => this.template = doc,
        error: () => this.showNotice('Could not load template.', 'error')
      });
  }

  loadFields(id: number): void {
    this.fieldsService.findByDocument(id).subscribe({
      next: fields => {
        this.fieldStates = fields.map(f => {
          const state: FieldState = {
            field: f,
            source: f.source ?? 'MANUAL',
            manualValue: '',
            systemKey: f.systemKey ?? 'TODAY_DATE',
            resolvedValue: ''
          };
          // Immediately resolve system values so users see them on load
          if (state.source === 'SYSTEM') {
            this.resolveSystemValue(state);
          }
          return state;
        });
      },
      error: () => this.showNotice('Could not load fields.', 'error')
    });
  }

  loadTemplatePreview(id: number): void {
    this.docService.preview(id).subscribe({
      next: async (blob: Blob) => {
        const mammoth = await import('mammoth');
        const arrayBuffer = await blob.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        this.templatePreviewHtml = this.sanitizer
          .bypassSecurityTrustHtml(result.value);
      },
      error: () => console.warn('Preview not available')
    });
  }

  validate(id: number): void {
    this.docService.validate(id).subscribe({
      next: result => this.validationResult = result,
      error: () => console.warn('Validation failed')
    });
  }

  // called when source dropdown changes
  onSourceChange(state: FieldState): void {
    if (state.source === 'SYSTEM') {
      this.resolveSystemValue(state);
    }
  }

  // called when system key dropdown changes
  onSystemKeyChange(state: FieldState): void {
    this.resolveSystemValue(state);
  }

  private resolveSystemValue(state: FieldState): void {
    const option = this.systemValues
      .find(s => s.key === state.systemKey);
    if (option) {
      state.resolvedValue = option.resolve(this.currentUser);
    }
  }

  getFinalValue(state: FieldState): string {
    if (state.source === 'MANUAL') {
      return state.manualValue || `[${state.field.keyName}]`;
    }
    return state.resolvedValue || `[${state.field.keyName}]`;
  }

  getSystemLabel(key: string): string {
    return this.systemValues.find(s => s.key === key)?.label ?? key;
  }

  generate(): void {
    if (!this.template) return;
    this.generating = true;
    this.previewMode = 'generated';
    this.generatedPreviewUrl = null;

    const request = {
      documentId: this.template.docId,
      fields: this.fieldStates.map(state => ({
        fieldId: state.field.fieldId,
        value: this.getFinalValue(state)
      }))
    };

    this.userDocService.generate(request)
      .pipe(finalize(() => this.generating = false))
      .subscribe({
        next: result => {
          this.generatedFileName = result.generatedFileName;
          this.generatedDocId = result.id;
          this.loadGeneratedPreview(result.id);
          this.showNotice('Document generated! ✅');
        },
        error: () => this.showNotice('Generation failed.', 'error')
      });
  }

  loadGeneratedPreview(id: number): void {
    this.userDocService.downloadPdf(id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        this.generatedPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.previewMode = 'generated';
      },
      error: () => this.showNotice('Could not load preview.', 'error')
    });
  }

  download(): void {
    if (!this.generatedDocId) return;
    this.userDocService.downloadPdf(this.generatedDocId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fn = this.generatedFileName || 'document.pdf';
        a.download = fn.replace(/\.docx?$/i, '.pdf');
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => this.showNotice('Download failed.', 'error')
    });
  }

  switchToTemplate(): void { this.previewMode = 'template'; }
  switchToGenerated(): void {
    if (this.generatedPreviewUrl) this.previewMode = 'generated';
  }

  goBack(): void {
    const currentUrl = this.router.url;
    if (currentUrl.startsWith('/user')) {
      this.router.navigate(['/user/home']);
    } else if (currentUrl.startsWith('/dept-admin')) {
      this.router.navigate(['/dept-admin/templates']);
    } else {
      this.router.navigate(['/admin/templates', this.template?.docId]);
    }
  }

  get hasWarnings(): boolean {
    return !!(
      this.validationResult?.notInFile?.length ||
      this.validationResult?.notInDb?.length
    );
  }

  private showNotice(msg: string, type: 'success' | 'error' = 'success'): void {
    this.notice = { msg, type };
    setTimeout(() => this.notice = null, 4000);
  }
}