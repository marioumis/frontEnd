import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DynamicDocumentService } from '../../core/service/dynamic-document.service';
import { DynamicDocumentResponse } from '../../models/response/DynamicDocumentResponse';

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './user-home.component.html',
  styleUrl: './user-home.component.css'
})
export class UserHomeComponent implements OnInit {

  templates: DynamicDocumentResponse[] = [];
  filteredTemplates: DynamicDocumentResponse[] = [];
  searchTerm = '';
  loading = false;

  constructor(private docService: DynamicDocumentService) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loading = true;
    this.docService.findAll().subscribe({
      next: (data) => {
        this.templates = data.filter(t => t.status);
        this.filteredTemplates = this.templates;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load templates', err);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredTemplates = this.templates;
    } else {
      this.filteredTemplates = this.templates.filter(t =>
        t.name.toLowerCase().includes(term) ||
        t.typeDocumentName?.toLowerCase().includes(term)
      );
    }
  }
}