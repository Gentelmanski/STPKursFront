// main-map/main-map.ts
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

// Angular Material импорты
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';

// Импорт компонента диалога
import { EventDetailsDialogComponent } from '../event-details-dialog/event-details-dialog';

declare const ymaps: any;

@Component({
  selector: 'app-main-map',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatProgressBarModule
  ],
  template: `
    <div class="main-container">
      <!-- Верхняя панель -->
      <mat-toolbar color="primary" class="toolbar">
        <span class="logo">Маяк</span>
        
        <span class="spacer"></span>
        
        <!-- Кнопка уведомлений -->
        <button mat-icon-button [matMenuTriggerFor]="notificationsMenu" class="notification-btn">
          <mat-icon [matBadge]="unreadNotifications" matBadgeColor="warn">notifications</mat-icon>
        </button>
        <mat-menu #notificationsMenu="matMenu">
          <div class="notifications-header">
            <h3>Уведомления</h3>
            <button mat-icon-button (click)="markAllAsRead()">
              <mat-icon>done_all</mat-icon>
            </button>
          </div>
          <mat-divider></mat-divider>
          <div *ngIf="notifications.length === 0" class="no-notifications">
            <mat-icon>notifications_off</mat-icon>
            <p>Нет уведомлений</p>
          </div>
          <div *ngFor="let notification of notifications" 
               class="notification-item"
               [class.unread]="!notification.read">
            <mat-icon>{{getNotificationIcon(notification.type)}}</mat-icon>
            <div class="notification-content">
              <p>{{notification.message}}</p>
              <small>{{notification.created_at | date:'short'}}</small>
            </div>
          </div>
        </mat-menu>
        
        <!-- Кнопка показа/скрытия таблицы -->
        <button mat-icon-button (click)="toggleEventsTable()" matTooltip="Список мероприятий">
          <mat-icon>{{showEventsTable ? 'list' : 'list_alt'}}</mat-icon>
        </button>
        
        <!-- Кнопка создания мероприятия -->
        <button mat-raised-button color="accent" (click)="openCreateEventDialog()">
          <mat-icon>add</mat-icon>
          Создать мероприятие
        </button>
        
        <!-- Профиль пользователя -->
        <button mat-icon-button [matMenuTriggerFor]="profileMenu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #profileMenu="matMenu">
          <div class="profile-info">
            <h4>{{authService.getCurrentUser()?.username}}</h4>
            <p>{{authService.getCurrentUser()?.email}}</p>
            <mat-chip *ngIf="authService.hasRole('admin')" color="warn" selected>
              <mat-icon>security</mat-icon> Админ
            </mat-chip>
          </div>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="goToProfile()">
            <mat-icon>person</mat-icon>
            <span>Личный кабинет</span>
          </button>
          <button mat-menu-item *ngIf="authService.hasRole('admin')" (click)="goToAdmin()">
            <mat-icon>admin_panel_settings</mat-icon>
            <span>Панель администратора</span>
          </button>
          <button mat-menu-item (click)="logout()">
            <mat-icon>exit_to_app</mat-icon>
            <span>Выйти</span>
          </button>
        </mat-menu>
      </mat-toolbar>
      
      <!-- Контейнер для карты -->
      <div id="map" class="map-container"></div>
      
      <!-- Панель фильтров -->
      <mat-card class="filters-card">
        <div class="filters-header">
          <h3>Фильтры мероприятий</h3>
          <button mat-icon-button (click)="toggleFilters()">
            <mat-icon>{{showFilters ? 'expand_less' : 'expand_more'}}</mat-icon>
          </button>
        </div>
        
        <mat-expansion-panel [expanded]="showFilters">
          <mat-expansion-panel-header>
            <mat-panel-title>
              Настройки фильтров
            </mat-panel-title>
          </mat-expansion-panel-header>
          
          <div class="filters-content">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Тип мероприятия</mat-label>
              <mat-select [formControl]="typeFilter" multiple>
                <mat-option value="concert">🎵 Концерт</mat-option>
                <mat-option value="exhibition">🖼 Выставка</mat-option>
                <mat-option value="meetup">👥 Встреча</mat-option>
                <mat-option value="workshop">🔧 Мастер-класс</mat-option>
                <mat-option value="sport">⚽ Спорт</mat-option>
                <mat-option value="festival">🎉 Фестиваль</mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Дата</mat-label>
              <input matInput [matDatepicker]="picker" [formControl]="dateFilter">
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Сортировка</mat-label>
              <mat-select [formControl]="sortFilter">
                <mat-option value="date_asc">По дате (сначала новые)</mat-option>
                <mat-option value="date_desc">По дате (сначала старые)</mat-option>
                <mat-option value="participants_desc">По участникам (по убыванию)</mat-option>
                <mat-option value="participants_asc">По участникам (по возрастанию)</mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-checkbox [formControl]="showOnlyAvailableFilter">
              Только с доступными местами
            </mat-checkbox>
            
            <div class="filter-actions">
              <button mat-button color="primary" (click)="applyFilters()">
                <mat-icon>filter_alt</mat-icon>
                Применить
              </button>
              
              <button mat-button (click)="resetFilters()">
                <mat-icon>clear_all</mat-icon>
                Сбросить
              </button>
            </div>
          </div>
        </mat-expansion-panel>
      </mat-card>
      
      <!-- Таблица мероприятий -->
      <div class="events-table-container" [class.hidden]="!showEventsTable">
        <mat-card class="events-table-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>event</mat-icon>
              Список мероприятий
              <span class="events-count">({{eventsDataSource.data.length}})</span>
            </mat-card-title>
            <button mat-icon-button (click)="toggleEventsTable()" class="close-table-btn">
              <mat-icon>close</mat-icon>
            </button>
          </mat-card-header>
          
          <mat-card-content>
            <!-- Поиск в таблице -->
            <div class="table-search">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Поиск мероприятий</mat-label>
                <input matInput [formControl]="tableSearchControl" placeholder="Введите название или описание...">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>
              
              <button mat-button (click)="refreshEvents()" [disabled]="isLoading">
                <mat-icon>refresh</mat-icon>
                Обновить
              </button>
            </div>
            
            <!-- Таблица -->
            <div class="table-wrapper">
              <table mat-table [dataSource]="eventsDataSource" matSort class="events-table">
                
                <!-- Название Column -->
                <ng-container matColumnDef="title">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Название</th>
                  <td mat-cell *matCellDef="let event">
                    <div class="event-title">
                      {{event.title}}
                      <span class="event-type">{{getEventTypeText(event.type)}}</span>
                    </div>
                    <div class="event-location" *ngIf="event.location">
                      <mat-icon class="location-icon">location_on</mat-icon>
                      {{getDistance(event)}}
                    </div>
                  </td>
                </ng-container>
                
                <!-- Дата Column -->
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Дата</th>
                  <td mat-cell *matCellDef="let event">
                    <div class="event-date">
                      {{formatDate(event.event_date)}}
                    </div>
                    <div class="event-time-remaining" [class]="getTimeRemainingClass(event)">
                      {{getTimeRemaining(event)}}
                    </div>
                  </td>
                </ng-container>
                
                <!-- Участники Column -->
                <ng-container matColumnDef="participants">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Участники</th>
                  <td mat-cell *matCellDef="let event">
                    <div class="participants-info">
                      <div class="participants-count">
                        <mat-icon>group</mat-icon>
                        {{event.participants_count || 0}}
                        <span *ngIf="event.max_participants">/{{event.max_participants}}</span>
                      </div>
                      <mat-progress-bar 
                        *ngIf="event.max_participants"
                        mode="determinate" 
                        [value]="(event.participants_count / event.max_participants) * 100"
                        class="participants-progress">
                      </mat-progress-bar>
                      <div *ngIf="isEventFull(event)" class="event-full">
                        Мест нет
                      </div>
                    </div>
                  </td>
                </ng-container>
                
                <!-- Статус Column -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Статус</th>
                  <td mat-cell *matCellDef="let event">
                    <div class="status-cell">
                      <mat-chip [color]="getEventStatusColor(event)" selected>
                        {{getEventStatusText(event)}}
                      </mat-chip>
                      <div class="verification-status" *ngIf="!event.is_verified">
                        <mat-icon class="verification-icon">pending</mat-icon>
                        На верификации
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
                              (click)="viewEventOnMap(event)"
                              matTooltip="Показать на карте">
                        <mat-icon>place</mat-icon>
                      </button>
                      
                      <!-- Кнопка записи/отказа от участия -->
                      <ng-container *ngIf="!isEventCreator(event)">
                        <button mat-icon-button 
                                color="primary"
                                *ngIf="!isParticipating(event)"
                                (click)="participateEvent(event)"
                                [disabled]="isEventFull(event) || !event.is_verified"
                                matTooltip="Записаться">
                          <mat-icon>person_add</mat-icon>
                        </button>
                        
                        <button mat-icon-button 
                                color="warn"
                                *ngIf="isParticipating(event)"
                                (click)="cancelParticipation(event)"
                                matTooltip="Отказаться от участия">
                          <mat-icon>person_remove</mat-icon>
                        </button>
                      </ng-container>
                      
                      <!-- Для создателя -->
                      <ng-container *ngIf="isEventCreator(event)">
                        <button mat-icon-button color="accent" 
                                (click)="editEvent(event)"
                                matTooltip="Редактировать">
                          <mat-icon>edit</mat-icon>
                        </button>
                      </ng-container>
                    </div>
                  </td>
                </ng-container>
                
                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                
                <!-- Сообщение о загрузке -->
                <tr *matNoDataRow>
                  <td class="no-data-cell" colspan="5">
                    <div *ngIf="isLoading" class="loading-row">
                      <mat-spinner diameter="30"></mat-spinner>
                      <span>Загрузка мероприятий...</span>
                    </div>
                    <div *ngIf="!isLoading && eventsDataSource.data.length === 0" class="no-data-message">
                      <mat-icon>event_busy</mat-icon>
                      <p>Нет мероприятий, соответствующих фильтрам</p>
                      <button mat-button (click)="resetFilters()">
                        Сбросить фильтры
                      </button>
                    </div>
                  </td>
                </tr>
              </table>
            </div>
            
            <!-- Пагинация -->
            <mat-paginator [pageSizeOptions]="[5, 10, 20]" 
                          showFirstLastButtons
                          aria-label="Select page of events"
                          class="events-paginator">
            </mat-paginator>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    /* Стили остаются без изменений */
    .main-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }
    
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
      flex-shrink: 0;
    }
    
    .logo {
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 1px;
    }
    
    .spacer {
      flex: 1 1 auto;
    }
    
    .notification-btn {
      margin-right: 16px;
    }
    
    .map-container {
      flex: 1;
      width: 100%;
    }
    
    .filters-card {
      position: absolute;
      top: 80px;
      left: 20px;
      z-index: 1000;
      background: white;
      min-width: 300px;
      max-width: 400px;
      transition: transform 0.3s ease;
    }
    
    .filters-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
    }
    
    .filters-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }
    
    .filters-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
    }
    
    .filter-field {
      width: 100%;
    }
    
    .filter-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 8px;
    }
    
    .events-table-container {
      position: absolute;
      top: 80px;
      right: 20px;
      bottom: 20px;
      width: 500px;
      z-index: 1000;
      transition: transform 0.3s ease, opacity 0.3s ease;
      transform: translateX(0);
      opacity: 1;
    }
    
    .events-table-container.hidden {
      transform: translateX(calc(100% + 20px));
      opacity: 0;
      pointer-events: none;
    }
    
    .events-table-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      border-radius: 8px;
    }
    
    .events-table-card mat-card-header {
      background: #3f51b5;
      color: white;
      border-radius: 8px 8px 0 0;
      padding: 16px;
    }
    
    .events-table-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 500;
    }
    
    .events-count {
      font-size: 14px;
      opacity: 0.8;
      margin-left: 4px;
    }
    
    .close-table-btn {
      color: white;
    }
    
    .events-table-card mat-card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 0;
      overflow: hidden;
    }
    
    .table-search {
      display: flex;
      gap: 12px;
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .search-field {
      flex: 1;
    }
    
    .table-wrapper {
      flex: 1;
      overflow-y: auto;
      padding: 0 16px;
    }
    
    .events-table {
      width: 100%;
    }
    
    .events-table th {
      background-color: #f5f5f5;
      font-weight: 600;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    
    .event-title {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .event-type {
      font-size: 11px;
      color: rgba(0, 0, 0, 0.6);
      margin-left: 8px;
      background: #e3f2fd;
      padding: 2px 6px;
      border-radius: 4px;
    }
    
    .event-location {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .location-icon {
      font-size: 14px;
      height: 14px;
      width: 14px;
    }
    
    .event-date {
      font-size: 14px;
      font-weight: 500;
    }
    
    .event-time-remaining {
      font-size: 11px;
      margin-top: 2px;
      padding: 2px 6px;
      border-radius: 4px;
      display: inline-block;
    }
    
    .event-time-remaining.upcoming {
      background: #e8f5e9;
      color: #2e7d32;
    }
    
    .event-time-remaining.ongoing {
      background: #fff3e0;
      color: #ef6c00;
    }
    
    .event-time-remaining.past {
      background: #f5f5f5;
      color: #616161;
    }
    
    .participants-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .participants-count {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      font-weight: 500;
    }
    
    .participants-progress {
      height: 4px;
      border-radius: 2px;
    }
    
    .event-full {
      font-size: 10px;
      color: #f44336;
      font-weight: 500;
    }
    
    .status-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .verification-status {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .verification-icon {
      font-size: 14px;
      height: 14px;
      width: 14px;
    }
    
    .action-buttons {
      display: flex;
      gap: 4px;
    }
    
    .no-data-cell {
      text-align: center;
      padding: 40px !important;
    }
    
    .loading-row {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 20px;
    }
    
    .no-data-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 20px;
      color: rgba(0, 0, 0, 0.54);
    }
    
    .no-data-message mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      opacity: 0.5;
    }
    
    .events-paginator {
      border-top: 1px solid #e0e0e0;
    }
    
    .notifications-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
    }
    
    .no-notifications {
      text-align: center;
      padding: 24px;
      color: rgba(0, 0, 0, 0.54);
    }
    
    .notification-item {
      display: flex;
      align-items: flex-start;
      padding: 12px 16px;
      min-width: 300px;
      border-left: 4px solid transparent;
    }
    
    .notification-item.unread {
      border-left-color: #2196f3;
      background: rgba(33, 150, 243, 0.04);
    }
    
    .notification-content {
      margin-left: 12px;
      flex: 1;
    }
    
    .notification-content p {
      margin: 0;
      font-size: 14px;
    }
    
    .notification-content small {
      color: rgba(0, 0, 0, 0.54);
      font-size: 12px;
    }
    
    .profile-info {
      padding: 16px;
      text-align: center;
    }
    
    .profile-info h4 {
      margin: 0;
    }
    
    .profile-info p {
      margin: 4px 0 8px;
      color: rgba(0, 0, 0, 0.6);
      font-size: 14px;
    }
    
    @media (max-width: 768px) {
      .events-table-container {
        width: calc(100vw - 40px);
        right: 0;
        left: 0;
        margin: 0 auto;
      }
      
      .filters-card {
        left: 0;
        right: 0;
        margin: 0 auto;
        width: calc(100vw - 40px);
      }
    }
  `]
})
export class MainMapComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private map: any;
  private userLocation: { lat: number, lng: number } | null = null;
  private placemarks: any[] = []; // Массив меток
  private userPlacemark: any; // Метка пользователя
  
  // Фильтры
  typeFilter = new FormControl<any[]>([]);
  dateFilter = new FormControl<any>(null);
  sortFilter = new FormControl<string>('date_desc');
  showOnlyAvailableFilter = new FormControl<boolean>(false);
  tableSearchControl = new FormControl<string>('');
  
  // Таблица
  eventsDataSource = new MatTableDataSource<any>([]);
  displayedColumns = ['title', 'date', 'participants', 'status', 'actions'];
  
  // Настройки отображения
  showEventsTable = true;
  showFilters = true;
  
  // Данные
  notifications: any[] = [];
  unreadNotifications = 0;
  isLoading = false;
  userParticipations: Set<number> = new Set();
  
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
  filteredEvents: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    public authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    // Экспортируем this для доступа из глобальной области видимости (для балунов)
    (window as any).openEventDetails = (eventId: number) => {
      this.showEventDetails(eventId);
    };
  }

  ngOnInit(): void {
    this.loadNotifications();
    this.loadUserParticipations();
    this.loadEvents();
    
    // Настройка поиска в таблице
    this.tableSearchControl.valueChanges.subscribe(value => {
      this.eventsDataSource.filter = value?.trim().toLowerCase() || '';
    });
    
    // Получение местоположения пользователя
    this.getUserLocation();
  }

  ngAfterViewInit(): void {
    this.eventsDataSource.paginator = this.paginator;
    this.eventsDataSource.sort = this.sort;
    
    // Настройка сортировки
    this.eventsDataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'date':
          return new Date(item.event_date).getTime();
        case 'participants':
          return item.participants_count || 0;
        default:
          return item[property];
      }
    };
  }

  private initMap(): void {
    if (typeof ymaps === 'undefined') {
      console.error('Yandex Maps API не загружена');
      return;
    }

    ymaps.ready(() => {
      // Создаем карту
      this.map = new ymaps.Map('map', {
        center: this.userLocation ? [this.userLocation.lat, this.userLocation.lng] : [55.751244, 37.618423],
        zoom: 12,
        controls: ['zoomControl', 'typeSelector', 'fullscreenControl']
      });

      // Добавляем метку пользователя, если известно местоположение
      if (this.userLocation) {
        this.addUserPlacemark();
      }

      // Загружаем мероприятия после инициализации карты
      this.loadEvents();
    });
  }

  private addUserPlacemark(): void {
    if (!this.map || !this.userLocation) return;

    // Создаем метку пользователя
    this.userPlacemark = new ymaps.Placemark(
      [this.userLocation.lat, this.userLocation.lng],
      {
        hintContent: 'Ваше местоположение',
        balloonContent: 'Вы здесь'
      },
      {
        preset: 'islands#greenDotIcon',
        draggable: false
      }
    );

    this.map.geoObjects.add(this.userPlacemark);
  }

  private getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.initMap();
        },
        () => {
          this.initMap();
        }
      );
    } else {
      this.initMap();
    }
  }

  loadEvents(): void {
    this.isLoading = true;
    
    const params: any = {};
    if (this.typeFilter.value && this.typeFilter.value.length > 0) {
      params.type = this.typeFilter.value;
    }
    if (this.dateFilter.value) {
      params.date = this.dateFilter.value.toISOString().split('T')[0];
    }

    this.http.get<any[]>('http://localhost:8080/api/events', { params }).subscribe({
      next: (events) => {
        // Обогащаем события дополнительной информацией
        const enrichedEvents = events.map(event => ({
          ...event,
          isParticipating: this.userParticipations.has(event.id),
          distance: this.calculateDistance(event),
          timeStatus: this.getEventTimeStatus(event),
          // Форматируем адрес для отображения
          formattedAddress: this.extractAddressFromLocation(event)
        }));

        // Сортируем события
        this.sortEvents(enrichedEvents);
        
        // Применяем фильтр по доступности мест
        let filteredEvents = enrichedEvents;
        if (this.showOnlyAvailableFilter.value) {
          filteredEvents = filteredEvents.filter(event => 
            !event.max_participants || event.participants_count < event.max_participants
          );
        }

        this.eventsDataSource.data = filteredEvents;
        this.displayEventsOnMap(filteredEvents);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Ошибка загрузки мероприятий:', error);
        this.isLoading = false;
      }
    });
  }

  private extractAddressFromLocation(event: any): string {
    // Здесь можно добавить обратное геокодирование, если в БД не хранится адрес
    return `Широта: ${event.latitude.toFixed(4)}, Долгота: ${event.longitude.toFixed(4)}`;
  }

  private sortEvents(events: any[]): void {
    const sortBy = this.sortFilter.value;
    
    switch (sortBy) {
      case 'date_asc':
        events.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
        break;
      case 'date_desc':
        events.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
        break;
      case 'participants_desc':
        events.sort((a, b) => (b.participants_count || 0) - (a.participants_count || 0));
        break;
      case 'participants_asc':
        events.sort((a, b) => (a.participants_count || 0) - (b.participants_count || 0));
        break;
    }
  }

  private loadUserParticipations(): void {
    this.http.get<any[]>('http://localhost:8080/api/user/participated').subscribe({
      next: (participations) => {
        this.userParticipations = new Set(participations.map(p => p.event_id || p.event?.id));
      },
      error: (error) => {
        console.error('Ошибка загрузки участий:', error);
      }
    });
  }

  private displayEventsOnMap(events: any[]): void {
    if (!this.map || !ymaps) return;
    
    this.filteredEvents = events;
    
    // Удаляем старые метки мероприятий с карты
    this.placemarks.forEach(placemark => {
      this.map.geoObjects.remove(placemark);
    });
    
    // Очищаем массив меток
    this.placemarks = [];

    // Создаем новые метки для каждого мероприятия
    events.forEach(event => {
      if (event.latitude && event.longitude) {
        const placemark = this.createPlacemark(event);
        this.placemarks.push(placemark);
        this.map.geoObjects.add(placemark);
      }
    });
  }

  private createPlacemark(event: any): any {
    // Определяем цвет метки в зависимости от статуса
    let preset = 'islands#blueDotIcon';
    if (this.isParticipating(event)) {
      preset = 'islands#greenDotIcon';
    } else if (!event.is_verified) {
      preset = 'islands#grayDotIcon';
    } else if (this.isEventFull(event)) {
      preset = 'islands#redDotIcon';
    }

    // Создаем содержимое балуна с кнопкой для открытия диалога
    const balloonContent = this.createBalloonContent(event);

    const placemark = new ymaps.Placemark(
      [event.latitude, event.longitude],
      {
        hintContent: event.title,
        balloonContentHeader: `<strong>${event.title}</strong>`,
        balloonContentBody: balloonContent.body,
        balloonContentFooter: balloonContent.footer,
        // Дополнительные данные для обработки кликов
        eventId: event.id,
        eventData: event
      },
      {
        preset: preset,
        balloonCloseButton: true,
        hideIconOnBalloonOpen: false,
        openBalloonOnClick: false, // Отключаем автоматическое открытие балуна при клике
        // Можно задать свой цвет иконки
        iconColor: this.getEventColor(event)
      }
    );

    // Обработчик клика на метку - открываем диалог
    placemark.events.add('click', (e: any) => {
      const target = e.get('target');
      const eventData = target.properties.get('eventData');
      this.showEventDetails(eventData.id);
      // Закрываем балун если он открыт
      target.balloon.close();
    });

    // Обработчик наведения на метку
    placemark.events.add('mouseenter', (e: any) => {
      e.get('target').options.set('preset', 'islands#redIcon');
    });
    
    placemark.events.add('mouseleave', (e: any) => {
      e.get('target').options.set('preset', preset);
    });

    return placemark;
  }

  private createBalloonContent(event: any): any {
    const participantsText = event.max_participants 
      ? `${event.participants_count || 0}/${event.max_participants}`
      : `${event.participants_count || 0}`;

    const body = `
      <div class="event-balloon" style="max-width: 300px; padding: 10px;">
        <p><strong>Тип:</strong> ${this.getEventTypeText(event.type)}</p>
        <p><strong>Дата:</strong> ${this.formatDate(event.event_date)}</p>
        <p><strong>Участники:</strong> ${participantsText}</p>
        <p><strong>Цена:</strong> ${event.price > 0 ? event.price + ' ₽' : 'Бесплатно'}</p>
        ${event.description ? `<p>${event.description.substring(0, 150)}...</p>` : ''}
      </div>
    `;

    const footer = `
      <div class="balloon-actions" style="padding: 10px; text-align: center;">
        <button onclick="window.openEventDetails(${event.id})" 
                style="background: #3f51b5; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
          Подробнее
        </button>
      </div>
    `;

    return { body, footer };
  }

  private getEventColor(event: any): string {
    if (this.isParticipating(event)) return '#4CAF50';
    if (!event.is_verified) return '#9E9E9E';
    if (this.isEventFull(event)) return '#F44336';
    return '#2196F3';
  }

  calculateDistance(event: any): number | null {
    if (!this.userLocation || !event.latitude || !event.longitude) return null;
    
    const R = 6371; // Радиус Земли в км
    const dLat = this.deg2rad(event.latitude - this.userLocation.lat);
    const dLon = this.deg2rad(event.longitude - this.userLocation.lng);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(this.userLocation.lat)) * Math.cos(this.deg2rad(event.latitude)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  getDistance(event: any): string {
    const distance = this.calculateDistance(event);
    if (distance === null) return 'Неизвестно';
    
    if (distance < 1) {
      return `${Math.round(distance * 1000)} м`;
    }
    return `${distance.toFixed(1)} км`;
  }

  getEventTimeStatus(event: any): string {
    const now = new Date();
    const eventDate = new Date(event.event_date);
    const diff = eventDate.getTime() - now.getTime();
    const hoursDiff = diff / (1000 * 60 * 60);
    
    if (hoursDiff < 0) return 'past';
    if (hoursDiff <= 24) return 'ongoing';
    return 'upcoming';
  }

  getTimeRemaining(event: any): string {
    const status = this.getEventTimeStatus(event);
    const eventDate = new Date(event.event_date);
    const now = new Date();
    
    switch (status) {
      case 'past':
        return 'Прошедшее';
      case 'ongoing':
        const hoursToEvent = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60));
        if (hoursToEvent <= 0) return 'Идет сейчас';
        return `Через ${hoursToEvent} ч`;
      case 'upcoming':
        const daysToEvent = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return `Через ${daysToEvent} д`;
      default:
        return '';
    }
  }

  getTimeRemainingClass(event: any): string {
    return this.getEventTimeStatus(event);
  }

  getEventTypeText(type: string): string {
    return this.eventTypes[type as keyof typeof this.eventTypes] || type;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEventStatusColor(event: any): string {
    if (!event.is_verified) return 'primary';
    if (!event.is_active) return 'warn';
    return 'accent';
  }

  getEventStatusText(event: any): string {
    if (!event.is_verified) return 'На верификации';
    if (!event.is_active) return 'Неактивно';
    if (this.isEventFull(event)) return 'Заполнено';
    return 'Активно';
  }

  isEventFull(event: any): boolean {
    return event.max_participants && event.participants_count >= event.max_participants;
  }

  isEventCreator(event: any): boolean {
    return event.creator_id === this.authService.getCurrentUser()?.id;
  }

  isParticipating(event: any): boolean {
    return this.userParticipations.has(event.id);
  }

  toggleEventsTable(): void {
    this.showEventsTable = !this.showEventsTable;
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  applyFilters(): void {
    this.loadEvents();
  }

  resetFilters(): void {
    this.typeFilter.setValue([]);
    this.dateFilter.setValue(null);
    this.sortFilter.setValue('date_desc');
    this.showOnlyAvailableFilter.setValue(false);
    this.tableSearchControl.setValue('');
    this.loadEvents();
  }

  refreshEvents(): void {
    this.loadEvents();
    this.loadUserParticipations();
  }

  viewEventOnMap(event: any): void {
    if (this.map && event.latitude && event.longitude) {
      this.map.setCenter([event.latitude, event.longitude], 15);
      
      // Открываем балун у соответствующей метки
      const placemark = this.placemarks.find(p => 
        p.properties.get('eventId') === event.id
      );
      if (placemark) {
        placemark.balloon.open();
      }
    }
  }

  // Метод для обновления стиля конкретной метки
  private updatePlacemarkStyle(eventId: number): void {
    const placemark = this.placemarks.find(p => 
      p.properties.get('eventId') === eventId
    );
    if (placemark) {
      const event = this.filteredEvents.find((e: { id: number; }) => e.id === eventId);
      if (event) {
        placemark.options.set('preset', this.getEventColor(event));
      }
    }
  }

  // Метод для открытия диалога с деталями мероприятия
  showEventDetails(eventId: number): void {
  // Закрываем все открытые балуны перед открытием диалога
  this.placemarks.forEach(placemark => {
    if (placemark.balloon.isOpen()) {
      placemark.balloon.close();
    }
  });
  
  // Открыть диалог с деталями мероприятия
  this.dialog.open(EventDetailsDialogComponent, {
    width: '800px',
    maxHeight: '90vh',
    data: { eventId }
  });
}
  // После участия/отмены участия обновляем метку
  participateEvent(event: any): void {
    this.http.post(`http://localhost:8080/api/events/${event.id}/participate`, {}).subscribe({
      next: () => {
        this.userParticipations.add(event.id);
        this.updatePlacemarkStyle(event.id);
        this.snackBar.open('Вы записались на мероприятие!', 'OK', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open('Ошибка при записи на мероприятие', 'Ошибка', { duration: 3000 });
      }
    });
  }

  cancelParticipation(event: any): void {
    this.http.delete(`http://localhost:8080/api/events/${event.id}/participate`).subscribe({
      next: () => {
        this.userParticipations.delete(event.id);
        this.loadEvents();
        this.snackBar.open('Вы отказались от участия', 'OK', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open('Ошибка при отказе от участия', 'Ошибка', { duration: 3000 });
      }
    });
  }

  editEvent(event: any): void {
    // Редирект на страницу редактирования или открытие диалога
    this.router.navigate(['/user/dashboard'], { queryParams: { editEvent: event.id } });
  }

  openCreateEventDialog(): void {
    import('../create-event-dialog/create-event-dialog').then(module => {
      const dialogRef = this.dialog.open(module.CreateEventDialogComponent, {
        width: '600px',
        data: { map: this.map }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.refreshEvents();
          this.snackBar.open('Мероприятие создано!', 'OK', { duration: 3000 });
        }
      });
    });
  }

  loadNotifications(): void {
    this.http.get<any[]>('http://localhost:8080/api/notifications').subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.unreadNotifications = notifications.filter(n => !n.read).length;
      }
    });
  }

  markAllAsRead(): void {
    this.http.post('http://localhost:8080/api/notifications/mark-all-read', {}).subscribe({
      next: () => {
        this.loadNotifications();
      }
    });
  }

  getNotificationIcon(type: string): string {
    const icons: {[key: string]: string} = {
      'event_created': 'add_circle',
      'event_updated': 'edit',
      'comment_added': 'comment',
      'participation': 'person_add',
      'system': 'notifications'
    };
    return icons[type] || 'notifications';
  }

  goToProfile(): void {
    this.router.navigate(['/user/dashboard']);
  }

  goToAdmin(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  logout(): void {
    this.authService.logout();
  }
}