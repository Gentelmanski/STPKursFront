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
  template: `
    <div class="stats-container">
      <mat-grid-list cols="4" rowHeight="100px" gutterSize="16px">
        <!-- Общая статистика -->
        <mat-grid-tile *ngFor="let stat of mainStats" [colspan]="1" [rowspan]="1">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon class="stat-icon">{{stat.icon}}</mat-icon>
                <div class="stat-info">
                  <div class="stat-value">{{stat.value}}</div>
                  <div class="stat-label">{{stat.label}}</div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>
        
        <!-- Топ мероприятий -->
        <mat-grid-tile [colspan]="2" [rowspan]="2">
          <mat-card class="top-events-card">
            <mat-card-header>
              <mat-card-title>Топ мероприятий</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="top-events-list">
                <div *ngFor="let event of topEvents" class="event-item">
                  <div class="event-info">
                    <div class="event-title">{{event.title}}</div>
                    <div class="event-stats">
                      <span class="participants">
                        <mat-icon>group</mat-icon>
                        {{event.participants}}
                      </span>
                    </div>
                  </div>
                  <mat-chip color="primary" class="event-rank">
                    {{event.participants}}
                  </mat-chip>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>
        
        <!-- Активность системы -->
        <mat-grid-tile [colspan]="2" [rowspan]="1">
          <mat-card class="activity-card">
            <mat-card-header>
              <mat-card-title>Активность системы</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="activity-stats">
                <div class="activity-item">
                  <div class="activity-label">Регистраций сегодня</div>
                  <div class="activity-value">{{stats?.today_registrations || 0}}</div>
                </div>
                <div class="activity-item">
                  <div class="activity-label">Пользователей онлайн</div>
                  <div class="activity-value">{{stats?.online_users || 0}}</div>
                </div>
                <div class="activity-item">
                  <div class="activity-label">Мероприятий на верификации</div>
                  <div class="activity-value">{{pendingEventsCount}}</div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>
      </mat-grid-list>
      
      <div *ngIf="isLoading" class="loading">
        <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
      </div>
    </div>
  `,
  styles: [`
    .stats-container {
      position: relative;
    }
    
    .stat-card {
      height: 100%;
      width: 100%;
    }
    
    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .stat-icon {
      font-size: 36px;
      height: 36px;
      width: 36px;
      color: #1976d2;
    }
    
    .stat-info {
      display: flex;
      flex-direction: column;
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.87);
    }
    
    .stat-label {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .top-events-card {
      height: 100%;
      width: 100%;
    }
    
    .top-events-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .event-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px;
      background: #f5f5f5;
      border-radius: 4px;
    }
    
    .event-info {
      flex: 1;
    }
    
    .event-title {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .event-stats {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .participants {
      display: inline-flex;
      align-items: center;
    }
    
    .participants mat-icon {
      font-size: 16px;
      height: 16px;
      width: 16px;
      margin-right: 4px;
    }
    
    .event-rank {
      font-weight: 600;
    }
    
    .activity-card {
      height: 100%;
      width: 100%;
    }
    
    .activity-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
    }
    
    .activity-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .activity-label {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 4px;
    }
    
    .activity-value {
      font-size: 24px;
      font-weight: 600;
      color: #1976d2;
    }
    
    .loading {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.8);
    }
    
    @media (max-width: 1200px) {
      mat-grid-list {
        cols: 2 !important;
      }
    }
    
    @media (max-width: 768px) {
      mat-grid-list {
        cols: 1 !important;
      }
    }
  `]
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