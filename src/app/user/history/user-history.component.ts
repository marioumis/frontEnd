import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface UserDocumentResponse {
  id: number;
  generatedFileName: string;
  downloadUrl: string;
}

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

  private baseUrl = 'http://localhost:8081/api/v1';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.loading = true;
    this.http.get<UserDocumentResponse[]>(`${this.baseUrl}/user-documents/my-documents`).subscribe({
      next: (data) => {
        this.documents = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load history', err);
        this.errorMessage = 'Failed to load your documents.';
        this.loading = false;
      }
    });
  }

  download(fileName: string): void {
    window.open(`${this.baseUrl}/user-documents/download/${fileName}`, '_blank');
  }

  getDisplayName(fileName: string): string {
    const parts = fileName.split('_');
    return parts.length > 1 ? parts.slice(1).join('_') : fileName;
  }
}