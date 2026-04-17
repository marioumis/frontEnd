import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminStatsService } from '../../core/service/admin-stats.service';
import { AdminStatsResponse } from '../../models/response/AdminStatsResponse';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {

  stats: AdminStatsResponse = {
    totalTemplates: 0,
    totalCategories: 0,
    totalUsers: 0,
    totalGenerated: 0,
    templatesByCategory: [],
    recentDocuments: []
  };

  loading = true;
  error = false;

  barChartLabels: string[] = [];
  barChartData: number[]   = [];

  lineChartLabels: string[] = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  lineChartData:   number[] = [0, 0, 0, 0, 0, 0, 0];

  constructor(
    private statsService: AdminStatsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.error   = false;
    this.statsService.getStats().subscribe({
      next: (data) => {
        this.stats          = data;
        this.barChartLabels = data.templatesByCategory.map(c => c.categoryName);
        this.barChartData   = data.templatesByCategory.map(c => c.count);
        this.loading        = false;
      },
      error: () => {
        this.error   = true;
        this.loading = false;
      }
    });
  }

  getBarWidth(count: number): number {
    const max = Math.max(...this.barChartData, 1);
    return (count / max) * 100;
  }

  getLineHeight(value: number): number {
    const max = Math.max(...this.lineChartData, 1);
    return Math.max((value / max) * 100, 4);
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }
}