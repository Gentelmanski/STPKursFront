import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
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
  templateUrl: `main-map.html`,
  styleUrl: `main-map.scss`,
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
    // Здесь можно добавить обратное геокодирование
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
        eventId: event.id,
        eventData: event
      },
      {
        preset: preset,
        balloonCloseButton: true,
        hideIconOnBalloonOpen: false,
        openBalloonOnClick: false,
        iconColor: this.getEventColor(event)
      }
    );

    // Обработчик клика на метку - открываем диалог
    placemark.events.add('click', (e: any) => {
      const target = e.get('target');
      const eventData = target.properties.get('eventData');
      this.showEventDetails(eventData.id);
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