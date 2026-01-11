import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import {NotificationService} from '../notifications/notifications';
// Измените импорты на:
import { CreateEventDialogComponent } from '../create-event-dialog/create-event-dialog';
import { EventDetailsDialogComponent } from '../event-details-dialog/event-details-dialog';

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
//import { MatChipModule } from '@angular/material/chips';
import { MatChip, MatChipsModule } from '@angular/material/chips';
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
    MatChipsModule
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
            <span>Мой профиль</span>
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
      
      <!-- Фильтры событий -->
      <mat-card class="filters-card">
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
        
        <button mat-button color="primary" (click)="applyFilters()">
          <mat-icon>filter_alt</mat-icon>
          Применить
        </button>
        
        <button mat-button (click)="resetFilters()">
          <mat-icon>clear_all</mat-icon>
          Сбросить
        </button>
      </mat-card>
    </div>
  `,
  styles: [`
    .main-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
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
      padding: 16px;
      z-index: 1000;
      background: white;
      min-width: 300px;
    }
    
    .filter-field {
      width: 100%;
      margin-bottom: 12px;
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
  `]
})
export class MainMapComponent implements OnInit, AfterViewInit {
  private map: any;
  private objectManager: any;
  typeFilter = new FormControl<any[]>([]);
  dateFilter = new FormControl<any>(null);
  notifications: any[] = [];
  unreadNotifications = 0;

  constructor(
    private http: HttpClient,
    private router: Router,
    public authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    //private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.loadEvents();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    // Инициализация Яндекс.Карт
    ymaps.ready(() => {
      this.map = new ymaps.Map('map', {
        center: [55.751244, 37.618423], // Москва
        zoom: 10,
        controls: ['zoomControl', 'fullscreenControl']
      });

      // Создаем менеджер объектов для кластеризации
      this.objectManager = new ymaps.ObjectManager({
        clusterize: true,
        gridSize: 64,
        clusterDisableClickZoom: true,
        clusterBalloonContentLayout: 'cluster#balloonCarousel'
      });

      // Обработка клика по кластеру
      this.objectManager.objects.events.add('click', (event: any) => {
        const objectId = event.get('objectId');
        const object = this.objectManager.objects.getById(objectId);
        
        if (object) {
          this.openEventDetails(object.properties.eventId);
        }
      });

      // Обработка клика по кластеру
      this.objectManager.clusters.events.add('click', (event: any) => {
        const clusterId = event.get('objectId');
        const cluster = this.objectManager.clusters.getById(clusterId);
        
        // Приближаем карту к кластеру
        this.map.setBounds(cluster.geometry.getBounds(), {
          checkZoomRange: true
        });
      });

      this.map.geoObjects.add(this.objectManager);
    });
  }

  private loadEvents(): void {
    this.http.get<any[]>('http://localhost:8080/api/events').subscribe({
      next: (events) => {
        this.displayEventsOnMap(events);
      },
      error: (error) => {
        console.error('Ошибка загрузки мероприятий:', error);
      }
    });
  }

  private displayEventsOnMap(events: any[]): void {
    const features = events.map(event => ({
      type: 'Feature',
      id: event.id,
      geometry: {
        type: 'Point',
        coordinates: [event.longitude, event.latitude]
      },
      properties: {
        eventId: event.id,
        balloonContent: `
          <div class="event-balloon">
            <h3>${event.title}</h3>
            <p>${event.type}</p>
            <p>${new Date(event.event_date).toLocaleDateString()}</p>
            <button onclick="window.dispatchEvent(new CustomEvent('openEvent', {detail: ${event.id}}))">
              Подробнее
            </button>
          </div>
        `
      }
    }));

    this.objectManager.add(features);
  }

  openCreateEventDialog(): void {
    const dialogRef = this.dialog.open(CreateEventDialogComponent, {
      width: '600px',
      data: { map: this.map }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEvents(); // Перезагружаем события
        this.snackBar.open('Мероприятие создано!', 'OK', { duration: 3000 });
      }
    });
  }

  openEventDetails(eventId: number): void {
    this.dialog.open(EventDetailsDialogComponent, {
      width: '800px',
      data: { eventId }
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
    this.router.navigate(['/profile']);
  }

  goToAdmin(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  logout(): void {
    this.authService.logout();
  }

  applyFilters(): void {
    const filters = {
      type: this.typeFilter.value,
      date: this.dateFilter.value
    };
    
    this.http.post<any[]>('http://localhost:8080/api/events/filter', filters).subscribe({
      next: (events) => {
        this.objectManager.removeAll();
        this.displayEventsOnMap(events);
      }
    });
  }

  resetFilters(): void {
    this.typeFilter.setValue([]);
    this.dateFilter.setValue(null);
    this.loadEvents();
  }
}