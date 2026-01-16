import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CreateEventDialogComponent } from '../../create-event-dialog/create-event-dialog';
import { EditEventDialogComponent } from '../../evet-edit-dialog/evet-edit-dialog';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
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
    MatProgressBarModule 
  ],
  templateUrl: `dashboard.html`,
  styleUrl: `dashboard.scss`,
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
    // Настройка сортировки для таблицы "Мои мероприятия"
    this.myEventsDataSource.sort = this.myEventsSort;
    this.myEventsDataSource.sortingDataAccessor = (item, property) => {
        switch (property) {
            case 'date':
                return new Date(item.event_date).getTime();
            case 'participants':
                return item.participants_count || 0;
            default:
                return item[property];
        }
    };

    // Настройка сортировки для таблицы "Я участвую"
    this.participatedEventsDataSource.sort = this.participatedEventsSort;
    this.participatedEventsDataSource.sortingDataAccessor = (item, property) => {
        switch (property) {
            case 'date':
                return new Date(item.event?.event_date || item.event_date).getTime();
            case 'joined_at':
                return new Date(item.joined_at).getTime();
            default:
                if (item.event && item.event[property]) {
                    return item.event[property];
                }
                return item[property];
        }
    };

    // Устанавливаем пагинаторы
    this.myEventsDataSource.paginator = this.myEventsPaginator;
    this.participatedEventsDataSource.paginator = this.participatedEventsPaginator;
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
    
        // Загрузка созданных мероприятий ТЕКУЩЕГО пользователя
    this.http.get<any[]>('http://localhost:8080/api/user/events').subscribe({
        next: (events) => {
            console.log('Мои мероприятия загружены:', events);
            this.myEventsDataSource.data = events.map(event => ({
                ...event,
                status: this.calculateEventStatus(event)
            }));
            
            // После загрузки данных обновляем пагинатор и сортировку
            setTimeout(() => {
                this.myEventsDataSource.paginator = this.myEventsPaginator;
                this.myEventsDataSource.sort = this.myEventsSort;
                this.setupMyEventsFilter();
            });
        },
        error: (error) => {
            console.error('Ошибка загрузки моих мероприятий:', error);
            this.snackBar.open('Ошибка загрузки мероприятий', 'Ошибка', { duration: 3000 });
        }
    });
    
    // Загрузка мероприятий, на которые записан
    this.loadParticipatedEvents();
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

  private loadParticipatedEvents(): void {
    this.http.get<any[]>('http://localhost:8080/api/user/participated').subscribe({
        next: (participations) => {
            console.log('Участия загружены:', participations);
            
            // Преобразуем данные участия в удобный формат
            const formattedData = participations.map(participation => {
                // Проверяем структуру ответа
                if (participation.event) {
                    // Если ответ содержит поле event
                    return {
                        ...participation,
                        event: {
                            ...participation.event,
                            status: this.calculateEventStatus(participation.event)
                        }
                    };
                } else {
                    // Если ответ уже содержит данные мероприятия напрямую
                    return {
                        event: {
                            ...participation,
                            status: this.calculateEventStatus(participation)
                        },
                        status: participation.participation_status || 'going',
                        joined_at: participation.joined_at || participation.created_at
                    };
                }
            });
            
            this.participatedEventsDataSource.data = formattedData;
            
            // После загрузки данных обновляем пагинатор и сортировку
            setTimeout(() => {
                this.participatedEventsDataSource.paginator = this.participatedEventsPaginator;
                this.participatedEventsDataSource.sort = this.participatedEventsSort;
                this.setupParticipatedEventsFilter();
            });
        },
        error: (error) => {
            console.error('Ошибка загрузки участий:', error);
            this.snackBar.open('Ошибка загрузки мероприятий', 'Ошибка', { duration: 3000 });
        }
    });
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

  // Настройка фильтрации для таблицы "Мои мероприятия"
private setupMyEventsFilter(): void {
    // Фильтр по поиску
    this.myEventsDataSource.filterPredicate = (data: any, filter: string) => {
        if (!filter) return true;
        
        const searchStr = filter.toLowerCase();
        return data.title.toLowerCase().includes(searchStr) ||
               (data.description && data.description.toLowerCase().includes(searchStr));
    };

    // Подписка на изменения поиска
    this.myEventsSearchControl.valueChanges.subscribe(value => {
        this.myEventsDataSource.filter = value?.trim().toLowerCase() || '';
        if (this.myEventsPaginator) {
            this.myEventsPaginator.firstPage();
        }
    });
}

// Настройка фильтрации для таблицы "Я участвую"
private setupParticipatedEventsFilter(): void {
    // Фильтр по статусу мероприятия
    this.participatedEventsDataSource.filterPredicate = (data: any, filter: string) => {
        if (!filter || filter === 'all') return true;
        
        const eventStatus = data.event?.status || data.status;
        return eventStatus === filter;
    };

    // Подписка на изменения фильтра
    this.participationFilterControl.valueChanges.subscribe(value => {
        this.participatedEventsDataSource.filter = value || 'all';
        if (this.participatedEventsPaginator) {
            this.participatedEventsPaginator.firstPage();
        }
    });
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