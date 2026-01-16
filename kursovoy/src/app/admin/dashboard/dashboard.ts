import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
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
     MatOptionModule, 
    MatSelectModule, 
    MatTooltipModule,
    AdminStatisticsComponent,
    CommentModerationComponent
  ],
  templateUrl: `dashboard.html`,
  styleUrl: `dashboard.scss`,
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