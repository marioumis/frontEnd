import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserDocumentResponse } from '../../models/response/user-document-response.model';
import { UserDocumentService } from '../../core/service/user-document.service';

@Component({
  selector: 'app-user-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-history.component.html',
  styleUrl: './user-history.component.css'
})
export class UserHistoryComponent implements OnInit {

  documents: UserDocumentResponse[] = [];
  loading = false;
  errorMessage = '';

  constructor(private userDocService: UserDocumentService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.userDocService.getMyDocuments().subscribe({
      next: (data: any) => {
        console.log('User history data loaded:', data);
        // Handle direct array or Spring Page wrapper
        this.documents = Array.isArray(data) ? data : (data.content || []);
        this.loading = false;
      },
      error: (err) => {
        console.error('Detailed History Error:', err);
        if (err.status === 403) {
          this.errorMessage = 'Permission Denied (403). Please check if your user has the correct roles on the backend.';
        } else if (err.status === 0) {
          this.errorMessage = 'Network error or CORS issue. Please check if the backend is running at http://localhost:8081';
        } else {
          this.errorMessage = `Failed to load documents: ${err.message || 'Unknown error'}`;
        }
        this.loading = false;
      }
    });
  }

  download(id: number, fileName: string): void {
    this.userDocService.downloadPdf(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName.replace(/\.docx?$/i, '.pdf');
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => {
        console.error('Download failed', err);
      }
    });
  }

  getDisplayName(fileName: string): string {
    const parts = fileName.split('_');
    return parts.length > 1 ? parts.slice(1).join('_') : fileName;
  }
}