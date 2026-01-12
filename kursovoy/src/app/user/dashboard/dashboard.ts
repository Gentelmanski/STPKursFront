// user/dashboard/dashboard.ts
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth';
import { Router, RouterModule } from '@angular/router'; // Добавлен RouterModule
import { ReactiveFormsModule, FormControl } from '@angular/forms';

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
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressBarModule } from '@angular/material/progress-bar'; // Добавлен

// Компоненты
import { CreateEventDialogComponent } from '../../create-event-dialog/create-event-dialog';
import { EditEventDialogComponent } from '../../evet-edit-dialog/evet-edit-dialog';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule, // Добавлен
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
    MatOptionModule,
    MatSelectModule,
    MatTooltipModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatProgressBarModule // Добавлен
  ],
  template: `
    <div class="user-dashboard-container">
      <!-- Верхняя панель -->
      <mat-toolbar color="primary" class="user-toolbar">
        <div class="toolbar-left">
          <button mat-icon-button (click)="goToMap()" matTooltip="На карту">
            <mat-icon>map</mat-icon>
          </button>
          <span class="dashboard-title">Личный кабинет</span>
        </div>
        
        <span class="spacer"></span>
        
        <div class="user-info">
          <mat-chip color="accent" selected>
            <mat-icon class="chip-icon">person</mat-icon>
            {{authService.getCurrentUser()?.role === 'admin' ? 'АДМИН' : 'ПОЛЬЗОВАТЕЛЬ'}}
          </mat-chip>
          <span class="username">{{authService.getCurrentUser()?.username}}</span>
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item (click)="goToProfile()">
              <mat-icon>person</mat-icon>
              <span>Мой профиль</span>
            </button>
            <button mat-menu-item (click)="goToMap()">
              <mat-icon>map</mat-icon>
              <span>Карта мероприятий</span>
            </button>
            <button mat-menu-item *ngIf="authService.hasRole('admin')" (click)="goToAdmin()">
              <mat-icon>admin_panel_settings</mat-icon>
              <span>Админ панель</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Выйти</span>
            </button>
          </mat-menu>
        </div>
      </mat-toolbar>

      <!-- Основное содержимое -->
      <div class="dashboard-content">
        <!-- Статистика пользователя -->
        <div class="user-stats-section">
          <mat-card class="stats-card">
            <mat-card-header>
              <mat-card-title>Ваша активность</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stats-grid">
                <div class="stat-item" (click)="goToCreatedEvents()">
                  <mat-icon class="stat-icon">event</mat-icon>
                  <div class="stat-content">
                    <div class="stat-value">{{stats?.created_events || 0}}</div>
                    <div class="stat-label">Созданных мероприятий</div>
                  </div>
                </div>
                <div class="stat-item" (click)="goToParticipatingEvents()">
                  <mat-icon class="stat-icon">group</mat-icon>
                  <div class="stat-content">
                    <div class="stat-value">{{stats?.participated_events || 0}}</div>
                    <div class="stat-label">Буду участвовать</div>
                  </div>
                </div>
                <div class="stat-item">
                  <mat-icon class="stat-icon">comment</mat-icon>
                  <div class="stat-content">
                    <div class="stat-value">{{stats?.comments || 0}}</div>
                    <div class="stat-label">Комментариев</div>
                  </div>
                </div>
                <div class="stat-item">
                  <mat-icon class="stat-icon">stars</mat-icon>
                  <div class="stat-content">
                    <div class="stat-value">{{stats?.rating || 0}}</div>
                    <div class="stat-label">Рейтинг</div>
                  </div>
                </div>
              </div>
            </mat-card-content>
            <mat-card-actions>
              <button mat-raised-button color="primary" (click)="openCreateEventDialog()">
                <mat-icon>add</mat-icon>
                Создать мероприятие
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <!-- Вкладки -->
        <mat-tab-group class="user-tabs" animationDuration="0ms" [(selectedIndex)]="selectedTab">
          <!-- Мои мероприятия -->
          <mat-tab label="Мои мероприятия">
            <div class="tab-content">
              <div class="tab-header">
                <h2>Созданные мной мероприятия</h2>
                <div class="tab-actions">
                  <mat-form-field appearance="outline" class="search-field">
                    <mat-label>Поиск мероприятий</mat-label>
                    <input matInput [formControl]="myEventsSearchControl" placeholder="Поиск по названию...">
                    <mat-icon matSuffix>search</mat-icon>
                  </mat-form-field>
                </div>
              </div>
              
              <mat-card>
                <div class="table-container">
                  <table mat-table [dataSource]="myEventsDataSource" matSort class="user-table">
                    
                    <!-- Название Column -->
                    <ng-container matColumnDef="title">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Название</th>
                      <td mat-cell *matCellDef="let event">
                        <div class="event-title">
                          {{event.title}}
                          <span class="event-type">{{getEventTypeText(event.type)}}</span>
                        </div>
                        <div class="event-description" *ngIf="event.description">
                          {{event.description | slice:0:100}}{{event.description.length > 100 ? '...' : ''}}
                        </div>
                      </td>
                    </ng-container>
                    
                    <!-- Дата Column -->
                    <ng-container matColumnDef="date">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Дата</th>
                      <td mat-cell *matCellDef="let event">
                        <div class="event-date">
                          {{formatDate(event.event_date)}}
                          <div class="event-status" [class]="getEventStatus(event)">
                            {{getEventStatusText(event)}}
                          </div>
                        </div>
                      </td>
                    </ng-container>
                    
                    <!-- Участники Column -->
                    <ng-container matColumnDef="participants">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Участники</th>
                      <td mat-cell *matCellDef="let event">
                        <div class="participants-info">
                          <span class="participants-count">{{event.participants_count || 0}}</span>
                          <span *ngIf="event.max_participants" class="max-participants">
                            / {{event.max_participants}}
                          </span>
                          <mat-progress-bar 
                            *ngIf="event.max_participants"
                            mode="determinate" 
                            [value]="(event.participants_count / event.max_participants) * 100"
                            class="participants-progress">
                          </mat-progress-bar>
                        </div>
                      </td>
                    </ng-container>
                    
                    <!-- Статус верификации Column -->
                    <ng-container matColumnDef="verification">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Статус</th>
                      <td mat-cell *matCellDef="let event">
                        <mat-chip [color]="getVerificationColor(event)" selected>
                          {{getVerificationText(event)}}
                        </mat-chip>
                      </td>
                    </ng-container>
                    
                    <!-- Действия Column -->
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Действия</th>
                      <td mat-cell *matCellDef="let event">
                        <div class="action-buttons">
                          <button mat-icon-button color="primary" 
                                  (click)="viewEvent(event.id)"
                                  matTooltip="Просмотреть">
                            <mat-icon>visibility</mat-icon>
                          </button>
                          <button mat-icon-button color="primary" 
                                  (click)="editEvent(event)"
                                  [disabled]="!canEditEvent(event)"
                                  matTooltip="Редактировать">
                            <mat-icon>edit</mat-icon>
                          </button>
                          <button mat-icon-button color="warn" 
                                  (click)="deleteEvent(event)"
                                  [disabled]="!canDeleteEvent(event)"
                                  matTooltip="Удалить">
                            <mat-icon>delete</mat-icon>
                          </button>
                          <button mat-icon-button 
                                  color="accent"
                                  (click)="toggleEventStatus(event)"
                                  [disabled]="!canToggleEvent(event)"
                                  matTooltip="Активировать/Деактивировать">
                            <mat-icon>{{event.is_active ? 'toggle_on' : 'toggle_off'}}</mat-icon>
                          </button>
                        </div>
                      </td>
                    </ng-container>
                    
                    <tr mat-header-row *matHeaderRowDef="myEventsDisplayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: myEventsDisplayedColumns;"></tr>
                    
                    <!-- Сообщение о пустой таблице -->
                    <tr class="mat-row" *matNoDataRow>
                      <td class="mat-cell" colspan="5">
                        <div class="no-data-message">
                          <mat-icon>event_busy</mat-icon>
                          <p>Вы еще не создали ни одного мероприятия</p>
                          <button mat-raised-button color="primary" (click)="openCreateEventDialog()">
                            Создать первое мероприятие
                          </button>
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>
                
                <mat-paginator [pageSizeOptions]="[5, 10, 25]" 
                              showFirstLastButtons
                              aria-label="Select page of events">
                </mat-paginator>
              </mat-card>
            </div>
          </mat-tab>
          
          <!-- Мероприятия, на которые я записан -->
          <mat-tab label="Я участвую">
            <div class="tab-content">
              <div class="tab-header">
                <h2>Мероприятия, на которые я записан</h2>
                <div class="tab-actions">
                  <mat-form-field appearance="outline" class="search-field">
                    <mat-label>Фильтр по статусу</mat-label>
                    <mat-select [formControl]="participationFilterControl">
                      <mat-option value="all">Все</mat-option>
                      <mat-option value="upcoming">Предстоящие</mat-option>
                      <mat-option value="ongoing">Идущие сейчас</mat-option>
                      <mat-option value="past">Прошедшие</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>
              
              <mat-card>
                <div class="table-container">
                  <table mat-table [dataSource]="participatedEventsDataSource" matSort class="user-table">
                    
                    <!-- Название Column -->
                    <ng-container matColumnDef="title">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Название</th>
                      <td mat-cell *matCellDef="let participation">
                        <div class="event-title">
                          {{participation.event.title}}
                          <span class="event-type">{{getEventTypeText(participation.event.type)}}</span>
                        </div>
                        <div class="event-creator">
                          Организатор: {{participation.event.creator?.username || 'Неизвестно'}}
                        </div>
                      </td>
                    </ng-container>
                    
                    <!-- Дата Column -->
                    <ng-container matColumnDef="date">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Дата</th>
                      <td mat-cell *matCellDef="let participation">
                        <div class="event-date">
                          {{formatDate(participation.event.event_date)}}
                          <div class="event-status" [class]="getEventStatus(participation.event)">
                            {{getEventStatusText(participation.event)}}
                          </div>
                        </div>
                      </td>
                    </ng-container>
                    
                    <!-- Статус участия Column -->
                    <ng-container matColumnDef="participation_status">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Мой статус</th>
                      <td mat-cell *matCellDef="let participation">
                        <mat-chip [color]="getParticipationStatusColor(participation.status)" selected>
                          {{getParticipationStatusText(participation.status)}}
                        </mat-chip>
                      </td>
                    </ng-container>
                    
                    <!-- Записался Column -->
                    <ng-container matColumnDef="joined_at">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Записался</th>
                      <td mat-cell *matCellDef="let participation">
                        {{formatDate(participation.joined_at)}}
                      </td>
                    </ng-container>
                    
                    <!-- Действия Column -->
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Действия</th>
                      <td mat-cell *matCellDef="let participation">
                        <div class="action-buttons">
                          <button mat-icon-button color="primary" 
                                  (click)="viewEvent(participation.event.id)"
                                  matTooltip="Просмотреть">
                            <mat-icon>visibility</mat-icon>
                          </button>
                          <button mat-icon-button 
                                  color="primary"
                                  (click)="changeParticipationStatus(participation)"
                                  matTooltip="Изменить статус участия">
                            <mat-icon>swap_horiz</mat-icon>
                          </button>
                          <button mat-icon-button color="warn" 
                                  (click)="cancelParticipation(participation)"
                                  [disabled]="!canCancelParticipation(participation)"
                                  matTooltip="Отменить участие">
                            <mat-icon>cancel</mat-icon>
                          </button>
                        </div>
                      </td>
                    </ng-container>
                    
                    <tr mat-header-row *matHeaderRowDef="participatedEventsDisplayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: participatedEventsDisplayedColumns;"></tr>
                    
                    <!-- Сообщение о пустой таблице -->
                    <tr class="mat-row" *matNoDataRow>
                      <td class="mat-cell" colspan="5">
                        <div class="no-data-message">
                          <mat-icon>group_off</mat-icon>
                          <p>Вы еще не записались ни на одно мероприятие</p>
                          <button mat-raised-button color="primary" (click)="goToMap()">
                            Найти мероприятия на карте
                          </button>
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>
                
                <mat-paginator [pageSizeOptions]="[5, 10, 25]" 
                              showFirstLastButtons
                              aria-label="Select page of events">
                </mat-paginator>
              </mat-card>
            </div>
          </mat-tab>
          
          <!-- Профиль -->
          <mat-tab label="Профиль">
            <div class="tab-content">
              <mat-card class="profile-card">
                <mat-card-header>
                  <mat-card-title>Информация о профиле</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="profile-info-grid">
                    <div class="profile-item">
                      <span class="profile-label">ID пользователя:</span>
                      <span class="profile-value">{{authService.getCurrentUser()?.id}}</span>
                    </div>
                    <div class="profile-item">
                      <span class="profile-label">Имя пользователя:</span>
                      <span class="profile-value">{{authService.getCurrentUser()?.username}}</span>
                    </div>
                    <div class="profile-item">
                      <span class="profile-label">Email:</span>
                      <span class="profile-value">{{authService.getCurrentUser()?.email}}</span>
                    </div>
                    <div class="profile-item">
                      <span class="profile-label">Роль:</span>
                      <span class="profile-value">
                        <mat-chip [color]="authService.getCurrentUser()?.role === 'admin' ? 'warn' : 'primary'" selected>
                          {{authService.getCurrentUser()?.role === 'admin' ? 'Администратор' : 'Пользователь'}}
                        </mat-chip>
                      </span>
                    </div>
                    <div class="profile-item">
                      <span class="profile-label">Дата регистрации:</span>
                      <span class="profile-value">{{formatDate(authService.getCurrentUser()?.created_at)}}</span>
                    </div>
                    <div class="profile-item">
                      <span class="profile-label">Последний онлайн:</span>
                      <span class="profile-value">{{formatDate(authService.getCurrentUser()?.last_online)}}</span>
                    </div>
                  </div>
                  
                  <mat-divider></mat-divider>
                  
                  <div class="profile-actions">
                    <button mat-raised-button color="primary" (click)="editProfile()">
                      <mat-icon>edit</mat-icon>
                      Редактировать профиль
                    </button>
                    <button mat-raised-button color="accent" (click)="changePassword()">
                      <mat-icon>lock</mat-icon>
                      Сменить пароль
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .user-dashboard-container {
      min-height: 100vh;
      background: #f5f5f5;
    }
    
    .user-toolbar {
      padding: 0 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .dashboard-title {
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
      font-size: 14px;
    }
    
    .dashboard-content {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .user-stats-section {
      margin-bottom: 24px;
    }
    
    .stats-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
      margin: 20px 0;
    }
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.3s, background 0.3s;
    }
    
    .stat-item:hover {
      transform: translateY(-2px);
      background: rgba(255, 255, 255, 0.2);
    }
    
    .stat-icon {
      font-size: 36px;
      height: 36px;
      width: 36px;
    }
    
    .stat-content {
      display: flex;
      flex-direction: column;
    }
    
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      line-height: 1;
    }
    
    .stat-label {
      font-size: 14px;
      opacity: 0.9;
      margin-top: 4px;
    }
    
    .user-tabs {
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
    
    .user-table {
      width: 100%;
    }
    
    .user-table th {
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
      margin-left: 8px;
      background: #e3f2fd;
      padding: 2px 6px;
      border-radius: 4px;
    }
    
    .event-description {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
      margin-top: 4px;
    }
    
    .event-date {
      font-size: 14px;
      font-weight: 500;
    }
    
    .event-status {
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 4px;
      margin-top: 4px;
      display: inline-block;
    }
    
    .event-status.upcoming {
      background: #e8f5e9;
      color: #2e7d32;
    }
    
    .event-status.ongoing {
      background: #fff3e0;
      color: #ef6c00;
    }
    
    .event-status.past {
      background: #f5f5f5;
      color: #616161;
    }
    
    .participants-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .participants-count {
      font-size: 18px;
      font-weight: 600;
      color: #1976d2;
    }
    
    .max-participants {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .participants-progress {
      height: 4px;
      border-radius: 2px;
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
      text-align: center;
    }
    
    .no-data-message mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
    }
    
    .no-data-message button {
      margin-top: 16px;
    }
    
    .profile-card {
      margin-top: 16px;
    }
    
    .profile-info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .profile-item {
      display: flex;
      flex-direction: column;
      padding: 12px;
      background-color: #f8f9fa;
      border-radius: 4px;
      border: 1px solid #e9ecef;
    }
    
    .profile-label {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 4px;
    }
    
    .profile-value {
      font-size: 14px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
    }
    
    .profile-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }
    
    .event-creator {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
      margin-top: 4px;
    }
    
    @media (max-width: 768px) {
      .dashboard-content {
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
      
      .stats-grid {
        grid-template-columns: 1fr;
      }
      
      .action-buttons {
        flex-wrap: wrap;
      }
      
      .profile-info-grid {
        grid-template-columns: 1fr;
      }
      
      .profile-actions {
        flex-direction: column;
      }
    }
  `]
})
export class UserDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('myEventsPaginator') myEventsPaginator!: MatPaginator;
  @ViewChild('participatedEventsPaginator') participatedEventsPaginator!: MatPaginator;
  @ViewChild('myEventsSort') myEventsSort!: MatSort;
  @ViewChild('participatedEventsSort') participatedEventsSort!: MatSort;

  // Для моих мероприятий
  myEventsDataSource = new MatTableDataSource<any>([]);
  myEventsDisplayedColumns = ['title', 'date', 'participants', 'verification', 'actions'];
  
  // Для мероприятий, на которые записан
  participatedEventsDataSource = new MatTableDataSource<any>([]);
  participatedEventsDisplayedColumns = ['title', 'date', 'participation_status', 'joined_at', 'actions'];
  
  // Контролы
  myEventsSearchControl = new FormControl('');
  participationFilterControl = new FormControl('all');
  
  // Статистика
  stats: any = {};
  selectedTab = 0;
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
    this.loadUserData();
    
    // Настройка фильтрации для таблицы моих мероприятий
    this.myEventsSearchControl.valueChanges.subscribe(value => {
      this.myEventsDataSource.filter = value?.trim().toLowerCase() || '';
      if (this.myEventsPaginator) {
        this.myEventsPaginator.firstPage();
      }
    });
    
    // Настройка фильтрации для таблицы участия
    this.participationFilterControl.valueChanges.subscribe(value => {
      this.applyParticipationFilter(value || 'all');
    });
  }

  ngAfterViewInit(): void {
    this.myEventsDataSource.paginator = this.myEventsPaginator;
    this.myEventsDataSource.sort = this.myEventsSort;
    
    this.participatedEventsDataSource.paginator = this.participatedEventsPaginator;
    this.participatedEventsDataSource.sort = this.participatedEventsSort;
  }

  loadUserData(): void {
    this.isLoading = true;
    
    // Загрузка статистики
    this.http.get<any>('http://localhost:8080/api/user/dashboard').subscribe({
      next: (data) => {
        this.stats = data.stats || {};
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Ошибка загрузки статистики:', error);
        this.isLoading = false;
      }
    });
    
    // Загрузка созданных мероприятий
    this.http.get<any[]>('http://localhost:8080/api/user/events').subscribe({
      next: (events) => {
        this.myEventsDataSource.data = events.map(event => ({
          ...event,
          status: this.calculateEventStatus(event)
        }));
      },
      error: (error) => {
        console.error('Ошибка загрузки мероприятий:', error);
      }
    });
    
    // Загрузка мероприятий, на которые записан
    this.http.get<any[]>('http://localhost:8080/api/user/participated').subscribe({
      next: (participations) => {
        this.participatedEventsDataSource.data = participations.map(participation => ({
          ...participation,
          event: {
            ...participation.event,
            status: this.calculateEventStatus(participation.event)
          }
        }));
      },
      error: (error) => {
        console.error('Ошибка загрузки участий:', error);
      }
    });
  }

  calculateEventStatus(event: any): string {
    const now = new Date();
    const eventDate = new Date(event.event_date);
    const diff = eventDate.getTime() - now.getTime();
    const hoursDiff = diff / (1000 * 60 * 60);
    
    if (hoursDiff < 0) return 'past'; // Прошедшее
    if (hoursDiff <= 24) return 'ongoing'; // Идет сегодня
    return 'upcoming'; // Предстоящее
  }

  getEventTypeText(type: string): string {
    return this.eventTypes[type as keyof typeof this.eventTypes] || type;
  }

  formatDate(dateString: string | undefined): string {
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

  getEventStatus(event: any): string {
    return event.status || this.calculateEventStatus(event);
  }

  getEventStatusText(event: any): string {
    const status = this.getEventStatus(event);
    switch (status) {
      case 'upcoming': return 'Предстоящее';
      case 'ongoing': return 'Идет сейчас';
      case 'past': return 'Прошедшее';
      default: return 'Неизвестно';
    }
  }

  getVerificationColor(event: any): string {
    if (!event.is_verified && event.is_active) return 'primary';
    if (event.is_verified && event.is_active) return 'accent';
    return 'warn';
  }

  getVerificationText(event: any): string {
    if (!event.is_verified && event.is_active) return 'На верификации';
    if (event.is_verified && event.is_active) return 'Подтверждено';
    if (!event.is_active) return 'Неактивно';
    return 'Отклонено';
  }

  getParticipationStatusColor(status: string): string {
    switch (status) {
      case 'going': return 'primary';
      case 'maybe': return 'accent';
      case 'declined': return 'warn';
      default: return '';
    }
  }

  getParticipationStatusText(status: string): string {
    switch (status) {
      case 'going': return 'Пойду';
      case 'maybe': return 'Возможно';
      case 'declined': return 'Не пойду';
      default: return 'Неизвестно';
    }
  }

  applyParticipationFilter(filterValue: string): void {
    if (filterValue === 'all') {
      this.participatedEventsDataSource.filter = '';
    } else {
      this.participatedEventsDataSource.filter = filterValue;
    }
    
    if (this.participatedEventsPaginator) {
      this.participatedEventsPaginator.firstPage();
    }
  }

  goToCreatedEvents(): void {
    this.selectedTab = 0;
  }

  goToParticipatingEvents(): void {
    this.selectedTab = 1;
  }

  openCreateEventDialog(): void {
    const dialogRef = this.dialog.open(CreateEventDialogComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUserData(); // Перезагружаем данные
        this.selectedTab = 0; // Переключаем на вкладку моих мероприятий
        this.snackBar.open('Мероприятие создано!', 'OK', { duration: 3000 });
      }
    });
  }

  viewEvent(eventId: number): void {
    // Переход на страницу мероприятия или открытие диалога
    // Пока просто показываем уведомление
    this.snackBar.open('Просмотр мероприятия', 'OK', { duration: 3000 });
  }

  editEvent(event: any): void {
    const dialogRef = this.dialog.open(EditEventDialogComponent, {
      width: '600px',
      data: { event, action: 'editEvent' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUserData();
        this.snackBar.open('Мероприятие обновлено!', 'OK', { duration: 3000 });
      }
    });
  }

  deleteEvent(event: any): void {
    if (confirm(`Вы уверены, что хотите удалить мероприятие "${event.title}"? Это действие нельзя отменить.`)) {
      this.http.delete(`http://localhost:8080/api/events/${event.id}`).subscribe({
        next: () => {
          this.loadUserData();
          this.snackBar.open('Мероприятие удалено', 'OK', { duration: 3000 });
        },
        error: (error) => {
          this.snackBar.open('Ошибка при удалении мероприятия', 'Ошибка', { duration: 3000 });
        }
      });
    }
  }

  toggleEventStatus(event: any): void {
    const newStatus = !event.is_active;
    this.http.patch(`http://localhost:8080/api/events/${event.id}`, { is_active: newStatus }).subscribe({
      next: () => {
        event.is_active = newStatus;
        this.snackBar.open(
          `Мероприятие ${newStatus ? 'активировано' : 'деактивировано'}`,
          'OK',
          { duration: 3000 }
        );
      },
      error: (error) => {
        this.snackBar.open('Ошибка при изменении статуса мероприятия', 'Ошибка', { duration: 3000 });
      }
    });
  }

  changeParticipationStatus(participation: any): void {
    // Диалог для изменения статуса участия
    const dialogRef = this.dialog.open(EditEventDialogComponent, {
      width: '400px',
      data: { 
        action: 'changeParticipation',
        currentStatus: participation.status,
        event: participation.event 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.status) {
        this.http.put(`http://localhost:8080/api/events/${participation.event.id}/participate`, { status: result.status }).subscribe({
          next: () => {
            participation.status = result.status;
            this.snackBar.open('Статус участия обновлен', 'OK', { duration: 3000 });
          },
          error: (error) => {
            this.snackBar.open('Ошибка при изменении статуса участия', 'Ошибка', { duration: 3000 });
          }
        });
      }
    });
  }

  cancelParticipation(participation: any): void {
    if (confirm(`Вы уверены, что хотите отменить участие в мероприятии "${participation.event.title}"?`)) {
      this.http.delete(`http://localhost:8080/api/events/${participation.event.id}/participate`).subscribe({
        next: () => {
          this.loadUserData();
          this.snackBar.open('Участие отменено', 'OK', { duration: 3000 });
        },
        error: (error) => {
          this.snackBar.open('Ошибка при отмене участия', 'Ошибка', { duration: 3000 });
        }
      });
    }
  }

  canEditEvent(event: any): boolean {
    // Можно редактировать только свои активные мероприятия
    return event.creator_id === this.authService.getCurrentUser()?.id && 
           event.is_active && 
           new Date(event.event_date) > new Date();
  }

  canDeleteEvent(event: any): boolean {
    // Можно удалять только свои мероприятия
    return event.creator_id === this.authService.getCurrentUser()?.id;
  }

  canToggleEvent(event: any): boolean {
    // Можно менять статус только своих мероприятий
    return event.creator_id === this.authService.getCurrentUser()?.id;
  }

  canCancelParticipation(participation: any): boolean {
    // Можно отменить участие только в предстоящих мероприятиях
    return new Date(participation.event.event_date) > new Date();
  }

  goToMap(): void {
    this.router.navigate(['/']);
  }

  goToProfile(): void {
    this.selectedTab = 2; // Переключаем на вкладку профиля
  }

  goToAdmin(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  editProfile(): void {
    // Открыть диалог редактирования профиля
    const dialogRef = this.dialog.open(EditEventDialogComponent, {
      width: '500px',
      data: { 
        action: 'editProfile',
        user: this.authService.getCurrentUser()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.authService.getProfile().subscribe(); // Обновляем данные пользователя
        this.snackBar.open('Профиль обновлен', 'OK', { duration: 3000 });
      }
    });
  }

  changePassword(): void {
    // Открыть диалог смены пароля
    const dialogRef = this.dialog.open(EditEventDialogComponent, {
      width: '400px',
      data: { action: 'changePassword' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Пароль изменен', 'OK', { duration: 3000 });
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}