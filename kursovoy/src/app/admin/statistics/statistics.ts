import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-admin-statistics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatGridListModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: `statistics.html`,
  styleUrl:`statistics.scss`,
})
export class AdminStatisticsComponent implements OnInit {
  stats: any;
  mainStats: any[] = [];
  topEvents: any[] = [];
  pendingEventsCount = 0;
  isLoading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.isLoading = true;
    
    this.http.get<any>('http://localhost:8080/api/admin/statistics').subscribe({
      next: (data) => {
        this.stats = data.stats;
        this.topEvents = data.top_events || [];
        this.pendingEventsCount = data.pending_events?.length || 0;
        
        this.updateMainStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Ошибка загрузки статистики:', error);
        this.isLoading = false;
      }
    });
  }

  updateMainStats(): void {
    this.mainStats = [
      {
        icon: 'people',
        value: this.stats?.total_users || 0,
        label: 'Всего пользователей'
      },
      {
        icon: 'event',
        value: this.stats?.total_events || 0,
        label: 'Всего мероприятий'
      },
      {
        icon: 'verified',
        value: this.stats?.verified_events || 0,
        label: 'Верифицировано'
      },
      {
        icon: 'comment',
        value: this.stats?.total_comments || 0,
        label: 'Комментариев'
      }
    ];
  }
}