// admin/dashboard/dashboard.ts
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

// Angular Material imports
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

// Components
import { EventVerificationDialogComponent } from '../event-verification/event-verification';
import { AdminStatisticsComponent } from '../statistics/statistics';
import { CommentModerationComponent } from '../comment-moderation/comment-moderation';

import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
     MatOptionModule, // Добавьте
    MatSelectModule, // Добавьте
    MatTooltipModule, // Добавьте
    AdminStatisticsComponent,
    CommentModerationComponent
  ],
  template: `
    <div class="admin-container">
      <!-- Верхняя панель -->
      <mat-toolbar color="primary" class="admin-toolbar">
        <span class="admin-logo">Админ Панель</span>
        <span class="spacer"></span>
        
        <div class="user-info">
          <mat-chip color="accent" selected>
            <mat-icon class="chip-icon">security</mat-icon>
            АДМИНИСТРАТОР
          </mat-chip>
          <span class="username">{{ authService.getCurrentUser()?.username }}</span>
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Выйти</span>
            </button>
          </mat-menu>
        </div>
      </mat-toolbar>

      <!-- Основное содержимое -->
      <div class="admin-content">
        <!-- Статистика -->
        <div class="stats-section">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Общая статистика</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <app-admin-statistics></app-admin-statistics>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Вкладки -->
        <mat-tab-group class="admin-tabs" animationDuration="0ms">
          <!-- Мероприятия на верификации -->
          <mat-tab label="Верификация мероприятий">
            <div class="tab-content">
              <div class="tab-header">
                <h2>Мероприятия на верификации</h2>
                <div class="tab-actions">
                  <mat-form-field appearance="outline" class="search-field">
                    <mat-label>Поиск</mat-label>
                    <input matInput [formControl]="eventSearchControl" placeholder="Поиск мероприятий...">
                    <mat-icon matSuffix>search</mat-icon>
                  </mat-form-field>
                </div>
              </div>
              
              <mat-card>
                <div class="table-container">
                  <table mat-table [dataSource]="eventsDataSource" matSort class="admin-table">
                    
                    <!-- ID Column -->
                    <ng-container matColumnDef="id">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
                      <td mat-cell *matCellDef="let event">{{event.id}}</td>
                    </ng-container>
                    
                    <!-- Название Column -->
                    <ng-container matColumnDef="title">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Название</th>
                      <td mat-cell *matCellDef="let event">
                        <div class="event-title">{{event.title}}</div>
                        <div class="event-type">{{event.type}}</div>
                      </td>
                    </ng-container>
                    
                    <!-- Создатель Column -->
                    <ng-container matColumnDef="creator">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Создатель</th>
                      <td mat-cell *matCellDef="let event">
                        <div class="creator-info">
                          <div>{{event.creator?.username || event.creator_username}}</div>
                          <div class="creator-email">{{event.creator?.email || event.creator_email}}</div>
                        </div>
                      </td>
                    </ng-container>
                    
                    <!-- Дата Column -->
                    <ng-container matColumnDef="date">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Дата</th>
                      <td mat-cell *matCellDef="let event">{{formatDate(event.event_date)}}</td>
                    </ng-container>
                    
                    <!-- Участники Column -->
                    <ng-container matColumnDef="participants">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Участники</th>
                      <td mat-cell *matCellDef="let event">
                        <span class="participants-badge">{{event.participants_count || 0}}</span>
                      </td>
                    </ng-container>
                    
                    <!-- Статус Column -->
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Статус</th>
                      <td mat-cell *matCellDef="let event">
                        <mat-chip [color]="getEventStatusColor(event)" selected>
                          {{getEventStatusText(event)}}
                        </mat-chip>
                      </td>
                    </ng-container>
                    
                    <!-- Действия Column -->
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Действия</th>
                      <td mat-cell *matCellDef="let event">
                        <div class="action-buttons">
                          <button mat-icon-button color="primary" 
                                  (click)="viewEventDetails(event)"
                                  matTooltip="Просмотреть детали">
                            <mat-icon>visibility</mat-icon>
                          </button>
                          <button mat-icon-button color="primary" 
                                  (click)="verifyEvent(event.id)"
                                  matTooltip="Подтвердить"
                                  *ngIf="!event.is_verified">
                            <mat-icon>check_circle</mat-icon>
                          </button>
                          <button mat-icon-button color="warn" 
                                  (click)="rejectEvent(event.id)"
                                  matTooltip="Отклонить"
                                  *ngIf="!event.is_verified">
                            <mat-icon>cancel</mat-icon>
                          </button>
                          <button mat-icon-button color="warn" 
                                  (click)="deleteEvent(event.id)"
                                  matTooltip="Удалить">
                            <mat-icon>delete</mat-icon>
                          </button>
                        </div>
                      </td>
                    </ng-container>
                    
                    <tr mat-header-row *matHeaderRowDef="eventDisplayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: eventDisplayedColumns;"></tr>
                    
                    <!-- Сообщение о пустой таблице -->
                    <tr class="mat-row" *matNoDataRow>
                      <td class="mat-cell" colspan="7">
                        <div class="no-data-message">
                          <mat-icon>event_busy</mat-icon>
                          <p>Нет мероприятий для верификации</p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>
                
                <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" 
                              showFirstLastButtons
                              aria-label="Select page of events">
                </mat-paginator>
              </mat-card>
            </div>
          </mat-tab>
          
          <!-- Управление пользователями -->
          <mat-tab label="Пользователи">
            <div class="tab-content">
              <div class="tab-header">
                <h2>Управление пользователями</h2>
                <div class="tab-actions">
                  <mat-form-field appearance="outline" class="search-field">
                    <mat-label>Поиск</mat-label>
                    <input matInput [formControl]="userSearchControl" placeholder="Поиск пользователей...">
                    <mat-icon matSuffix>search</mat-icon>
                  </mat-form-field>
                </div>
              </div>
              
              <mat-card>
                <div class="table-container">
                  <table mat-table [dataSource]="usersDataSource" matSort class="admin-table">
                    
                    <!-- ID Column -->
                    <ng-container matColumnDef="id">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
                      <td mat-cell *matCellDef="let user">{{user.id}}</td>
                    </ng-container>
                    
                    <!-- Имя пользователя Column -->
                    <ng-container matColumnDef="username">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Имя пользователя</th>
                      <td mat-cell *matCellDef="let user">
                        <div class="user-info">
                          <div class="username">{{user.username}}</div>
                          <div class="user-email">{{user.email}}</div>
                        </div>
                      </td>
                    </ng-container>
                    
                    <!-- Роль Column -->
                    <ng-container matColumnDef="role">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Роль</th>
                      <td mat-cell *matCellDef="let user">
                        <mat-chip [color]="user.role === 'admin' ? 'warn' : 'primary'" selected>
                          {{user.role === 'admin' ? 'Админ' : 'Пользователь'}}
                        </mat-chip>
                      </td>
                    </ng-container>
                    
                    <!-- Дата регистрации Column -->
                    <ng-container matColumnDef="created_at">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Дата регистрации</th>
                      <td mat-cell *matCellDef="let user">{{formatDate(user.created_at)}}</td>
                    </ng-container>
                    
                    <!-- Статус Column -->
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Статус</th>
                      <td mat-cell *matCellDef="let user">
                        <mat-chip [color]="user.is_blocked ? 'warn' : 'accent'" selected>
                          {{user.is_blocked ? 'Заблокирован' : 'Активен'}}
                        </mat-chip>
                      </td>
                    </ng-container>
                    
                    <!-- Статистика Column -->
                    <ng-container matColumnDef="stats">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Активность</th>
                      <td mat-cell *matCellDef="let user">
                        <div class="user-stats">
                          <span class="stat-item" matTooltip="Создано мероприятий">
                            <mat-icon>event</mat-icon>
                            {{user.events_created || 0}}
                          </span>
                          <span class="stat-item" matTooltip="Участвует в мероприятиях">
                            <mat-icon>group</mat-icon>
                            {{user.events_participated || 0}}
                          </span>
                          <span class="stat-item" matTooltip="Комментарии">
                            <mat-icon>comment</mat-icon>
                            {{user.comments_count || 0}}
                          </span>
                        </div>
                      </td>
                    </ng-container>
                    
                    <!-- Действия Column -->
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Действия</th>
                      <td mat-cell *matCellDef="let user">
                        <div class="action-buttons">
                          <button mat-icon-button color="primary" 
                                  (click)="viewUserDetails(user)"
                                  matTooltip="Просмотреть профиль">
                            <mat-icon>person</mat-icon>
                          </button>
                          <button mat-icon-button color="warn" 
                                  (click)="toggleUserBlock(user)"
                                  matTooltip="Блокировка/Разблокировка">
                            <mat-icon>{{user.is_blocked ? 'lock_open' : 'lock'}}</mat-icon>
                          </button>
                          <button mat-icon-button color="warn" 
                                  (click)="deleteUser(user.id)"
                                  *ngIf="authService.getCurrentUser()?.id !== user.id"
                                  matTooltip="Удалить">
                            <mat-icon>delete</mat-icon>
                          </button>
                        </div>
                      </td>
                    </ng-container>
                    
                    <tr mat-header-row *matHeaderRowDef="userDisplayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: userDisplayedColumns;"></tr>
                    
                    <!-- Сообщение о пустой таблице -->
                    <tr class="mat-row" *matNoDataRow>
                      <td class="mat-cell" colspan="7">
                        <div class="no-data-message">
                          <mat-icon>people_outline</mat-icon>
                          <p>Нет пользователей</p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>
                
                <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" 
                              showFirstLastButtons
                              aria-label="Select page of users">
                </mat-paginator>
              </mat-card>
            </div>
          </mat-tab>
          
          <!-- Модерация комментариев -->
          <mat-tab label="Комментарии">
            <div class="tab-content">
              <app-comment-moderation></app-comment-moderation>
            </div>
          </mat-tab>
          
          <!-- Все мероприятия -->
          <mat-tab label="Все мероприятия">
            <div class="tab-content">
              <div class="tab-header">
                <h2>Все мероприятия</h2>
                <div class="tab-actions">
                  <mat-form-field appearance="outline" class="search-field">
                    <mat-label>Фильтр по статусу</mat-label>
                    <mat-select [formControl]="eventFilterControl">
                      <mat-option value="all">Все</mat-option>
                      <mat-option value="pending">На верификации</mat-option>
                      <mat-option value="verified">Подтвержденные</mat-option>
                      <mat-option value="rejected">Отклоненные</mat-option>
                      <mat-option value="inactive">Неактивные</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>
              
              <mat-card>
                <div class="table-container">
                  <table mat-table [dataSource]="allEventsDataSource" matSort class="admin-table">
                    
                    <!-- ID Column -->
                    <ng-container matColumnDef="id">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
                      <td mat-cell *matCellDef="let event">{{event.id}}</td>
                    </ng-container>
                    
                    <!-- Название Column -->
                    <ng-container matColumnDef="title">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Название</th>
                      <td mat-cell *matCellDef="let event">
                        <div class="event-title">{{event.title}}</div>
                        <div class="event-type">{{getEventTypeText(event.type)}}</div>
                      </td>
                    </ng-container>
                    
                    <!-- Создатель Column -->
                    <ng-container matColumnDef="creator">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Создатель</th>
                      <td mat-cell *matCellDef="let event">
                        {{event.creator?.username || 'Неизвестно'}}
                      </td>
                    </ng-container>
                    
                    <!-- Дата мероприятия Column -->
                    <ng-container matColumnDef="event_date">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Дата мероприятия</th>
                      <td mat-cell *matCellDef="let event">{{formatDate(event.event_date)}}</td>
                    </ng-container>
                    
                    <!-- Создано Column -->
                    <ng-container matColumnDef="created_at">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Создано</th>
                      <td mat-cell *matCellDef="let event">{{formatDate(event.created_at)}}</td>
                    </ng-container>
                    
                    <!-- Статус Column -->
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Статус</th>
                      <td mat-cell *matCellDef="let event">
                        <div class="status-cell">
                          <mat-chip [color]="getEventStatusColor(event)" selected>
                            {{getEventStatusText(event)}}
                          </mat-chip>
                          <div class="status-details">
                            <span class="detail-item" *ngIf="!event.is_active">
                              <mat-icon>visibility_off</mat-icon> Неактивно
                            </span>
                            <span class="detail-item" *ngIf="!event.is_verified">
                              <mat-icon>pending</mat-icon> Не верифицировано
                            </span>
                          </div>
                        </div>
                      </td>
                    </ng-container>
                    
                    <!-- Действия Column -->
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Действия</th>
                      <td mat-cell *matCellDef="let event">
                        <div class="action-buttons">
                          <button mat-icon-button color="primary" 
                                  (click)="viewEventDetails(event)"
                                  matTooltip="Просмотреть">
                            <mat-icon>visibility</mat-icon>
                          </button>
                          <button mat-icon-button color="primary" 
                                  (click)="toggleEventVerification(event)"
                                  matTooltip="Изменить статус верификации">
                            <mat-icon>{{event.is_verified ? 'verified' : 'pending'}}</mat-icon>
                          </button>
                          <button mat-icon-button color="warn" 
                                  (click)="toggleEventActivity(event)"
                                  matTooltip="Активировать/Деактивировать">
                            <mat-icon>{{event.is_active ? 'toggle_on' : 'toggle_off'}}</mat-icon>
                          </button>
                          <button mat-icon-button color="warn" 
                                  (click)="deleteEvent(event.id)"
                                  matTooltip="Удалить">
                            <mat-icon>delete</mat-icon>
                          </button>
                        </div>
                      </td>
                    </ng-container>
                    
                    <tr mat-header-row *matHeaderRowDef="allEventsDisplayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: allEventsDisplayedColumns;"></tr>
                  </table>
                </div>
                
                <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" 
                              showFirstLastButtons
                              aria-label="Select page of all events">
                </mat-paginator>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
      
      <!-- Информация о текущем администраторе -->
      <mat-card class="admin-info-card">
        <mat-card-header>
          <mat-card-title>Информация об администраторе</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">ID:</span>
              <span class="info-value">{{authService.getCurrentUser()?.id}}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Имя пользователя:</span>
              <span class="info-value">{{authService.getCurrentUser()?.username}}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email:</span>
              <span class="info-value">{{authService.getCurrentUser()?.email}}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Роль:</span>
              <span class="info-value admin-badge">Администратор</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-container {
      min-height: 100vh;
      background: #f5f5f5;
    }
    
    .admin-toolbar {
      padding: 0 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .admin-logo {
      font-size: 20px;
      font-weight: 500;
      letter-spacing: 0.5px;
    }
    
    .spacer {
      flex: 1 1 auto;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .chip-icon {
      margin-right: 4px;
    }
    
    .username {
      font-weight: 500;
    }
    
    .admin-content {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .stats-section {
      margin-bottom: 24px;
    }
    
    .admin-tabs {
      margin-top: 24px;
    }
    
    .tab-content {
      padding: 16px 0;
    }
    
    .tab-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .tab-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
    }
    
    .search-field {
      width: 300px;
    }
    
    .table-container {
      overflow-x: auto;
      border-radius: 4px;
      border: 1px solid #e0e0e0;
    }
    
    .admin-table {
      width: 100%;
    }
    
    .admin-table th {
      background-color: #f5f5f5;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.87);
    }
    
    .event-title {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .event-type {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .creator-info {
      font-size: 14px;
    }
    
    .creator-email {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .participants-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background-color: #e3f2fd;
      border-radius: 50%;
      font-weight: 500;
      color: #1976d2;
    }
    
    .user-info {
      font-size: 14px;
    }
    
    .user-email {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .user-stats {
      display: flex;
      gap: 16px;
    }
    
    .stat-item {
      display: inline-flex;
      align-items: center;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .stat-item mat-icon {
      font-size: 14px;
      height: 14px;
      width: 14px;
      margin-right: 4px;
    }
    
    .action-buttons {
      display: flex;
      gap: 4px;
    }
    
    .no-data-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      color: rgba(0, 0, 0, 0.54);
    }
    
    .no-data-message mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
    }
    
    .status-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .status-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .detail-item {
      font-size: 11px;
      color: rgba(0, 0, 0, 0.6);
      display: inline-flex;
      align-items: center;
    }
    
    .detail-item mat-icon {
      font-size: 14px;
      height: 14px;
      width: 14px;
      margin-right: 4px;
    }
    
    .admin-info-card {
      margin: 24px;
      background: #ffffff;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }
    
    .info-item {
      display: flex;
      flex-direction: column;
      padding: 12px;
      background-color: #f8f9fa;
      border-radius: 4px;
      border: 1px solid #e9ecef;
    }
    
    .info-label {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 4px;
    }
    
    .info-value {
      font-size: 16px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
    }
    
    .admin-badge {
      display: inline-block;
      padding: 4px 8px;
      background-color: #f44336;
      color: white;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .mat-row:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
    
    @media (max-width: 768px) {
      .admin-content {
        padding: 16px;
      }
      
      .tab-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
      
      .search-field {
        width: 100%;
      }
      
      .action-buttons {
        flex-wrap: wrap;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) eventPaginator!: MatPaginator;
  @ViewChild(MatPaginator) userPaginator!: MatPaginator;
  @ViewChild(MatPaginator) allEventsPaginator!: MatPaginator;
  @ViewChild(MatSort) eventSort!: MatSort;
  @ViewChild(MatSort) userSort!: MatSort;
  @ViewChild(MatSort) allEventsSort!: MatSort;

  // Для мероприятий на верификации
  eventsDataSource = new MatTableDataSource<any>([]);
  eventDisplayedColumns = ['id', 'title', 'creator', 'date', 'participants', 'status', 'actions'];
  
  // Для пользователей
  usersDataSource = new MatTableDataSource<any>([]);
  userDisplayedColumns = ['id', 'username', 'role', 'created_at', 'status', 'stats', 'actions'];
  
  // Для всех мероприятий
  allEventsDataSource = new MatTableDataSource<any>([]);
  allEventsDisplayedColumns = ['id', 'title', 'creator', 'event_date', 'created_at', 'status', 'actions'];
  
  // Контролы поиска
  eventSearchControl = new FormControl('');
  userSearchControl = new FormControl('');
  eventFilterControl = new FormControl('all');
  
  isLoading = false;
  
  // Типы мероприятий
  eventTypes = {
    concert: '🎵 Концерт',
    exhibition: '🖼 Выставка',
    meetup: '👥 Встреча',
    workshop: '🔧 Мастер-класс',
    sport: '⚽ Спорт',
    festival: '🎉 Фестиваль',
    other: '📌 Другое'
  };

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
    
    // Настройка фильтрации для таблицы мероприятий
    this.eventSearchControl.valueChanges.subscribe(value => {
      this.applyEventFilter(value || '');
    });
    
    // Настройка фильтрации для таблицы пользователей
    this.userSearchControl.valueChanges.subscribe(value => {
      this.applyUserFilter(value || '');
    });
    
    // Фильтр для всех мероприятий
    this.eventFilterControl.valueChanges.subscribe(value => {
      this.applyAllEventsFilter(value || 'all');
    });
  }

  ngAfterViewInit(): void {
    this.eventsDataSource.paginator = this.eventPaginator;
    this.eventsDataSource.sort = this.eventSort;
    
    this.usersDataSource.paginator = this.userPaginator;
    this.usersDataSource.sort = this.userSort;
    
    this.allEventsDataSource.paginator = this.allEventsPaginator;
    this.allEventsDataSource.sort = this.allEventsSort;
  }

  loadData(): void {
    this.isLoading = true;
    
    // Загрузка мероприятий на верификации
    this.http.get<any[]>('http://localhost:8080/api/admin/events').subscribe({
      next: (events) => {
        this.eventsDataSource.data = events.filter(event => !event.is_verified && event.is_active);
        this.allEventsDataSource.data = events;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Ошибка загрузки мероприятий:', error);
        this.isLoading = false;
      }
    });
    
    // Загрузка пользователей
    this.http.get<any[]>('http://localhost:8080/api/admin/users').subscribe({
      next: (users) => {
        this.usersDataSource.data = users;
      },
      error: (error) => {
        console.error('Ошибка загрузки пользователей:', error);
      }
    });
  }

  applyEventFilter(filterValue: string): void {
    this.eventsDataSource.filter = filterValue.trim().toLowerCase();
    if (this.eventsDataSource.paginator) {
      this.eventsDataSource.paginator.firstPage();
    }
  }

  applyUserFilter(filterValue: string): void {
    this.usersDataSource.filter = filterValue.trim().toLowerCase();
    if (this.usersDataSource.paginator) {
      this.usersDataSource.paginator.firstPage();
    }
  }

  applyAllEventsFilter(filterValue: string): void {
    this.allEventsDataSource.filter = filterValue;
    if (this.allEventsDataSource.paginator) {
      this.allEventsDataSource.paginator.firstPage();
    }
  }

  getEventStatusColor(event: any): 'primary' | 'accent' | 'warn' {
    if (!event.is_verified && event.is_active) return 'primary';
    if (event.is_verified && event.is_active) return 'accent';
    return 'warn';
  }

  getEventStatusText(event: any): string {
    if (!event.is_verified && event.is_active) return 'На верификации';
    if (event.is_verified && event.is_active) return 'Подтверждено';
    if (!event.is_active) return 'Неактивно';
    return 'Отклонено';
  }

  getEventTypeText(type: string): string {
    return this.eventTypes[type as keyof typeof this.eventTypes] || type;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  verifyEvent(eventId: number): void {
    const dialogRef = this.dialog.open(EventVerificationDialogComponent, {
      width: '400px',
      data: { 
        eventId, 
        action: 'verify',
        message: 'Вы уверены, что хотите подтвердить это мероприятие?' 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.put(`http://localhost:8080/api/admin/events/${eventId}/verify`, {}).subscribe({
          next: () => {
            this.snackBar.open('Мероприятие подтверждено', 'OK', { duration: 3000 });
            this.loadData();
          },
          error: (error) => {
            this.snackBar.open('Ошибка при подтверждении мероприятия', 'Ошибка', { duration: 3000 });
          }
        });
      }
    });
  }

  rejectEvent(eventId: number): void {
    const dialogRef = this.dialog.open(EventVerificationDialogComponent, {
      width: '500px',
      data: { 
        eventId, 
        action: 'reject',
        message: 'Укажите причину отклонения мероприятия:' 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.reason) {
        this.http.put(`http://localhost:8080/api/admin/events/${eventId}/reject`, { reason: result.reason }).subscribe({
          next: () => {
            this.snackBar.open('Мероприятие отклонено', 'OK', { duration: 3000 });
            this.loadData();
          },
          error: (error) => {
            this.snackBar.open('Ошибка при отклонении мероприятия', 'Ошибка', { duration: 3000 });
          }
        });
      }
    });
  }

  deleteEvent(eventId: number): void {
    const dialogRef = this.dialog.open(EventVerificationDialogComponent, {
      width: '400px',
      data: { 
        eventId, 
        action: 'delete',
        message: 'Вы уверены, что хотите удалить это мероприятие? Это действие нельзя отменить.' 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.delete(`http://localhost:8080/api/admin/events/${eventId}`).subscribe({
          next: () => {
            this.snackBar.open('Мероприятие удалено', 'OK', { duration: 3000 });
            this.loadData();
          },
          error: (error) => {
            this.snackBar.open('Ошибка при удалении мероприятия', 'Ошибка', { duration: 3000 });
          }
        });
      }
    });
  }

  toggleUserBlock(user: any): void {
    const action = user.is_blocked ? 'unblock' : 'block';
    const endpoint = `http://localhost:8080/api/admin/users/${user.id}/${action}`;
    
    this.http.put(endpoint, {}).subscribe({
      next: () => {
        user.is_blocked = !user.is_blocked;
        this.snackBar.open(
          `Пользователь ${user.is_blocked ? 'заблокирован' : 'разблокирован'}`, 
          'OK', 
          { duration: 3000 }
        );
      },
      error: (error) => {
        this.snackBar.open('Ошибка при изменении статуса пользователя', 'Ошибка', { duration: 3000 });
      }
    });
  }

  deleteUser(userId: number): void {
    const dialogRef = this.dialog.open(EventVerificationDialogComponent, {
      width: '400px',
      data: { 
        eventId: userId, 
        action: 'delete',
        message: 'Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить.' 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.delete(`http://localhost:8080/api/admin/users/${userId}`).subscribe({
          next: () => {
            this.snackBar.open('Пользователь удален', 'OK', { duration: 3000 });
            this.loadData();
          },
          error: (error) => {
            this.snackBar.open('Ошибка при удалении пользователя', 'Ошибка', { duration: 3000 });
          }
        });
      }
    });
  }

  viewEventDetails(event: any): void {
    this.dialog.open(EventVerificationDialogComponent, {
      width: '600px',
      data: { 
        eventId: event.id,
        action: 'view',
        event: event
      }
    });
  }

  viewUserDetails(user: any): void {
    // Открыть диалог с деталями пользователя
    this.dialog.open(EventVerificationDialogComponent, {
      width: '500px',
      data: { 
        eventId: user.id,
        action: 'viewUser',
        user: user
      }
    });
  }

  toggleEventVerification(event: any): void {
    const endpoint = `http://localhost:8080/api/admin/events/${event.id}/${event.is_verified ? 'reject' : 'verify'}`;
    this.http.put(endpoint, {}).subscribe({
      next: () => {
        event.is_verified = !event.is_verified;
        this.snackBar.open(
          `Мероприятие ${event.is_verified ? 'подтверждено' : 'отклонено'}`, 
          'OK', 
          { duration: 3000 }
        );
      }
    });
  }

  toggleEventActivity(event: any): void {
    // Здесь нужен эндпоинт для изменения активности мероприятия
    // Пока что просто обновляем локально для демонстрации
    event.is_active = !event.is_active;
    this.snackBar.open(
      `Мероприятие ${event.is_active ? 'активировано' : 'деактивировано'}`, 
      'OK', 
      { duration: 3000 }
    );
  }

  logout(): void {
    this.authService.logout();
  }
}