// event-details-dialog/event-details-dialog.ts
import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-event-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  template: `
    <div class="event-details-container">
      <!-- Заголовок -->
      <div mat-dialog-title class="dialog-header">
        <h2>{{event?.title || 'Загрузка...'}}</h2>
        <button mat-icon-button (click)="onClose()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-divider></mat-divider>

      <!-- Контент -->
      <div mat-dialog-content class="dialog-content">
        <!-- Загрузка -->
        <div *ngIf="isLoading" class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Загрузка информации о мероприятии...</p>
        </div>

        <!-- Основная информация -->
        <div *ngIf="!isLoading && event" class="content">
          <!-- Статус мероприятия -->
          <div class="status-section">
            <mat-chip [color]="getEventStatusColor()" selected class="status-chip">
              <mat-icon>{{getEventStatusIcon()}}</mat-icon>
              {{getEventStatusText()}}
            </mat-chip>
            
            <span class="event-type">{{getEventTypeText()}}</span>
            
            <div *ngIf="!event?.is_verified" class="verification-status">
              <mat-icon class="warning-icon">warning</mat-icon>
              <span>На верификации администратора</span>
            </div>
          </div>

          <!-- Основная информация -->
          <div class="main-info">
            <div class="info-row">
              <mat-icon>event</mat-icon>
              <div class="info-content">
                <strong>Дата и время:</strong>
                <span>{{formatDate(event?.event_date)}}</span>
                <small [class]="getTimeRemainingClass()">
                  {{getTimeRemaining()}}
                </small>
              </div>
            </div>

            <div class="info-row">
              <mat-icon>location_on</mat-icon>
              <div class="info-content">
                <strong>Местоположение:</strong>
                <span>{{event?.address || 'Адрес не указан'}}</span>
                <small *ngIf="event?.latitude && event?.longitude">
                  Координаты: {{event.latitude.toFixed(4)}}, {{event.longitude.toFixed(4)}}
                </small>
              </div>
            </div>

            <div class="info-row" *ngIf="event?.price !== undefined">
              <mat-icon>attach_money</mat-icon>
              <div class="info-content">
                <strong>Стоимость:</strong>
                <span>{{event?.price > 0 ? event.price + ' ₽' : 'Бесплатно'}}</span>
              </div>
            </div>

            <div class="info-row" *ngIf="event?.duration">
              <mat-icon>schedule</mat-icon>
              <div class="info-content">
                <strong>Продолжительность:</strong>
                <span>{{event.duration}} минут</span>
              </div>
            </div>
          </div>

          <!-- Участники -->
          <mat-card class="participants-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>group</mat-icon>
                Участники
                <span class="participants-count">
                  {{event?.participants_count || 0}}
                  <span *ngIf="event?.max_participants">/{{event.max_participants}}</span>
                </span>
              </mat-card-title>
            </mat-card-header>

            <mat-card-content>
              <mat-progress-bar 
                *ngIf="event?.max_participants"
                mode="determinate" 
                [value]="getParticipantsPercentage()"
                [color]="getParticipantsColor()"
                class="participants-progress">
              </mat-progress-bar>

              <div class="participants-status">
                <div *ngIf="isEventFull()" class="event-full-warning">
                  <mat-icon>info</mat-icon>
                  <span>Мероприятие заполнено</span>
                </div>
                <div *ngIf="isEventCreator()" class="creator-badge">
                  <mat-icon>star</mat-icon>
                  <span>Вы организатор</span>
                </div>
                <div *ngIf="isParticipating()" class="participating-badge">
                  <mat-icon>check_circle</mat-icon>
                  <span>Вы участник</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Описание -->
          <mat-expansion-panel class="description-panel" [expanded]="true">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>description</mat-icon>
                Описание мероприятия
              </mat-panel-title>
            </mat-expansion-panel-header>
            
            <div class="description-content">
              <p *ngIf="event?.description; else noDescription">
                {{event.description}}
              </p>
              <ng-template #noDescription>
                <p class="no-description">Описание отсутствует</p>
              </ng-template>
            </div>
          </mat-expansion-panel>

          <!-- Информация о создателе -->
          <mat-card class="creator-card" *ngIf="event?.creator">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>person</mat-icon>
                Организатор
              </mat-card-title>
            </mat-card-header>
            
            <mat-card-content>
              <div class="creator-info">
                <div class="creator-avatar">
                  <mat-icon>account_circle</mat-icon>
                </div>
                <div class="creator-details">
                  <h4>{{event.creator.username}}</h4>
                  <p>{{event.creator.email}}</p>
                  <small>Создано: {{formatDate(event.created_at)}}</small>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Ошибка загрузки -->
        <div *ngIf="!isLoading && !event && loadError" class="error-container">
          <mat-icon class="error-icon">error_outline</mat-icon>
          <h3>Не удалось загрузить информацию</h3>
          <p>{{loadError}}</p>
          <button mat-raised-button color="primary" (click)="retryLoad()">
            <mat-icon>refresh</mat-icon>
            Повторить попытку
          </button>
        </div>
      </div>

      <mat-divider *ngIf="!isLoading && event"></mat-divider>

      <!-- Действия -->
      <div mat-dialog-actions class="dialog-actions" *ngIf="!isLoading && event">
        <div class="action-buttons">
          <!-- Кнопка закрытия -->
          <button mat-button (click)="onClose()">
            Закрыть
          </button>

          <div class="event-actions">
            <!-- Кнопка показа на карте -->
            <button mat-icon-button color="primary" 
                    (click)="viewEventOnMap()"
                    matTooltip="Показать на карте"
                    class="map-btn">
              <mat-icon>place</mat-icon>
            </button>
            
            <!-- Кнопки для не-создателя -->
            <ng-container *ngIf="!isEventCreator()">
              <button mat-raised-button 
                      color="primary"
                      *ngIf="!isParticipating()"
                      (click)="participate()"
                      [disabled]="isEventFull() || !event?.is_verified || actionLoading"
                      matTooltip="Записаться на мероприятие"
                      class="participate-btn">
                <mat-icon>person_add</mat-icon>
                Записаться
              </button>
              
              <button mat-raised-button 
                      color="warn"
                      *ngIf="isParticipating()"
                      (click)="cancelParticipation()"
                      [disabled]="actionLoading"
                      matTooltip="Отказаться от участия"
                      class="cancel-btn">
                <mat-icon>person_remove</mat-icon>
                Отказаться от участия
              </button>
            </ng-container>

            <!-- Для создателя -->
            <ng-container *ngIf="isEventCreator()">
              <button mat-raised-button color="accent" 
                      (click)="editEvent()"
                      matTooltip="Редактировать мероприятие"
                      class="edit-btn">
                <mat-icon>edit</mat-icon>
                Редактировать
              </button>
            </ng-container>
          </div>
        </div>
      </div>

      <!-- Индикатор загрузки действия -->
      <div *ngIf="actionLoading" class="action-loading">
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      </div>
    </div>
  `,
  styles: [`
    .event-details-container {
      max-width: 800px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 24px 0;
      margin: 0;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
      flex: 1;
    }

    .dialog-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .loading-container p {
      margin-top: 16px;
      color: #666;
    }

    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
    }

    .error-icon {
      font-size: 60px;
      height: 60px;
      width: 60px;
      color: #f44336;
      margin-bottom: 20px;
    }

    .error-container h3 {
      margin: 0 0 8px;
      color: #333;
    }

    .error-container p {
      color: #666;
      margin-bottom: 20px;
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .status-section {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }

    .status-chip {
      font-weight: 500;
    }

    .event-type {
      background: #e3f2fd;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 500;
    }

    .verification-status {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #ff9800;
      font-size: 14px;
      background: #fff3e0;
      padding: 8px 12px;
      border-radius: 4px;
    }

    .warning-icon {
      color: #ff9800;
    }

    .main-info {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .info-row {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .info-row mat-icon {
      color: #666;
      margin-top: 2px;
      flex-shrink: 0;
    }

    .info-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-content strong {
      font-weight: 500;
      color: #333;
    }

    .info-content small {
      font-size: 12px;
      margin-top: 2px;
      padding: 2px 6px;
      border-radius: 4px;
      display: inline-block;
      width: fit-content;
    }

    .info-content small.upcoming {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .info-content small.ongoing {
      background: #fff3e0;
      color: #ef6c00;
    }

    .info-content small.past {
      background: #f5f5f5;
      color: #616161;
    }

    .participants-card {
      margin-bottom: 0;
    }

    .participants-card mat-card-header {
      margin-bottom: 16px;
    }

    .participants-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
    }

    .participants-count {
      font-size: 16px;
      font-weight: 500;
      color: #333;
      margin-left: 8px;
    }

    .participants-progress {
      height: 8px;
      border-radius: 4px;
      margin-top: 8px;
    }

    .participants-status {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 16px;
    }

    .event-full-warning {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #f44336;
      font-weight: 500;
      background: #ffebee;
      padding: 6px 12px;
      border-radius: 4px;
    }

    .creator-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #ff9800;
      font-weight: 500;
      background: #fff3e0;
      padding: 6px 12px;
      border-radius: 4px;
    }

    .participating-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #4caf50;
      font-weight: 500;
      background: #e8f5e9;
      padding: 6px 12px;
      border-radius: 4px;
    }

    .description-panel {
      margin-bottom: 0;
    }

    .description-panel mat-expansion-panel-header {
      padding: 0 24px;
    }

    .description-panel mat-panel-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .description-content {
      padding: 16px 24px;
      line-height: 1.6;
      color: #333;
    }

    .no-description {
      color: #999;
      font-style: italic;
    }

    .creator-card {
      margin-bottom: 0;
    }

    .creator-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .creator-avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .creator-avatar mat-icon {
      font-size: 40px;
      height: 40px;
      width: 40px;
      color: #666;
    }

    .creator-details {
      flex: 1;
    }

    .creator-details h4 {
      margin: 0 0 4px;
      font-size: 16px;
      font-weight: 500;
    }

    .creator-details p {
      margin: 0 0 8px;
      color: #666;
      font-size: 14px;
    }

    .creator-details small {
      color: #999;
      font-size: 12px;
    }

    .dialog-actions {
      padding: 16px 24px;
      background: #fafafa;
      border-top: 1px solid #e0e0e0;
    }

    .action-buttons {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .event-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .map-btn {
      margin-right: 8px;
    }

    .participate-btn,
    .cancel-btn,
    .edit-btn {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .action-loading {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
    }

    /* Стили для скроллбара */
    ::ng-deep .mat-dialog-content::-webkit-scrollbar {
      width: 8px;
    }

    ::ng-deep .mat-dialog-content::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }

    ::ng-deep .mat-dialog-content::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 4px;
    }

    ::ng-deep .mat-dialog-content::-webkit-scrollbar-thumb:hover {
      background: #555;
    }

    /* Стили для спиннера */
    ::ng-deep .mat-spinner circle {
      stroke: #3f51b5;
    }
  `]
})
export class EventDetailsDialogComponent implements OnInit {
  event: any = null;
  isLoading = false;
  actionLoading = false;
  loadError: string = '';
  userParticipations: Set<number> = new Set();
  userLocation: { lat: number, lng: number } | null = null;

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
    private dialogRef: MatDialogRef<EventDetailsDialogComponent>,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: { eventId: number, map?: any }
  ) {}

  ngOnInit(): void {
    this.loadEventDetails();
    this.loadUserParticipations();
    this.getUserLocation();
  }

  loadEventDetails(): void {
    this.isLoading = true;
    this.loadError = '';
    this.cdr.markForCheck();

    this.http.get<any>(`http://localhost:8080/api/events/${this.data.eventId}`).subscribe({
      next: (event) => {
        this.event = event;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Ошибка загрузки мероприятия:', error);
        this.loadError = error.error?.message || 'Не удалось загрузить информацию о мероприятии';
        this.isLoading = false;
        this.cdr.detectChanges();
        this.snackBar.open(this.loadError, 'OK', { duration: 3000 });
      }
    });
  }

  loadUserParticipations(): void {
    this.http.get<any[]>('http://localhost:8080/api/user/participated').subscribe({
      next: (participations) => {
        this.userParticipations = new Set(participations.map(p => p.event_id || p.event?.id));
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Ошибка загрузки участий:', error);
      }
    });
  }

  getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
        },
        () => {
          this.userLocation = null;
        }
      );
    }
  }

  calculateDistance(): number | null {
    if (!this.userLocation || !this.event?.latitude || !this.event?.longitude) return null;
    
    const R = 6371; // Радиус Земли в км
    const dLat = this.deg2rad(this.event.latitude - this.userLocation.lat);
    const dLon = this.deg2rad(this.event.longitude - this.userLocation.lng);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(this.userLocation.lat)) * Math.cos(this.deg2rad(this.event.latitude)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  getDistance(): string {
    const distance = this.calculateDistance();
    if (distance === null) return 'Неизвестно';
    
    if (distance < 1) {
      return `${Math.round(distance * 1000)} м`;
    }
    return `${distance.toFixed(1)} км`;
  }

  getEventTimeStatus(): string {
    if (!this.event?.event_date) return 'past';
    const now = new Date();
    const eventDate = new Date(this.event.event_date);
    const diff = eventDate.getTime() - now.getTime();
    const hoursDiff = diff / (1000 * 60 * 60);
    
    if (hoursDiff < 0) return 'past';
    if (hoursDiff <= 24) return 'ongoing';
    return 'upcoming';
  }

  getTimeRemaining(): string {
    const status = this.getEventTimeStatus();
    if (!this.event?.event_date) return '';
    const eventDate = new Date(this.event.event_date);
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

  getTimeRemainingClass(): string {
    return this.getEventTimeStatus();
  }

  retryLoad(): void {
    this.loadEventDetails();
  }

  getEventTypeText(): string {
    if (!this.event?.type) return '';
    return this.eventTypes[this.event.type as keyof typeof this.eventTypes] || this.event.type;
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

  getEventStatusColor(): string {
    if (!this.event?.is_verified) return 'primary';
    if (!this.event?.is_active) return 'warn';
    if (this.isEventFull()) return 'warn';
    return 'accent';
  }

  getEventStatusIcon(): string {
    if (!this.event?.is_verified) return 'pending';
    if (!this.event?.is_active) return 'block';
    if (this.isEventFull()) return 'hourglass_full';
    return 'check_circle';
  }

  getEventStatusText(): string {
    if (!this.event?.is_verified) return 'На верификации';
    if (!this.event?.is_active) return 'Неактивно';
    if (this.isEventFull()) return 'Заполнено';
    return 'Активно';
  }

  getParticipantsPercentage(): number {
    if (!this.event?.max_participants) return 0;
    return ((this.event.participants_count || 0) / this.event.max_participants) * 100;
  }

  getParticipantsColor(): string {
    const percentage = this.getParticipantsPercentage();
    if (percentage >= 90) return 'warn';
    if (percentage >= 70) return 'accent';
    return 'primary';
  }

  isEventFull(): boolean {
    return this.event?.max_participants && 
           (this.event.participants_count || 0) >= this.event.max_participants;
  }

  isEventCreator(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return !!currentUser && this.event?.creator_id === currentUser.id;
  }

  isParticipating(): boolean {
    return this.userParticipations.has(this.event?.id);
  }

  viewEventOnMap(): void {
    if (this.data.map && this.event?.latitude && this.event?.longitude) {
      this.data.map.setCenter([this.event.latitude, this.event.longitude], 15);
      this.snackBar.open('Мероприятие показано на карте', 'OK', { duration: 2000 });
    }
    this.onClose();
  }

  participate(): void {
    this.actionLoading = true;
    this.http.post(`http://localhost:8080/api/events/${this.event.id}/participate`, {}).subscribe({
      next: () => {
        this.userParticipations.add(this.event.id);
        this.event.participants_count = (this.event.participants_count || 0) + 1;
        this.actionLoading = false;
        this.cdr.detectChanges();
        this.snackBar.open('Вы успешно записались на мероприятие!', 'OK', { duration: 3000 });
      },
      error: (error) => {
        console.error('Ошибка при записи на мероприятие:', error);
        this.actionLoading = false;
        this.cdr.detectChanges();
        this.snackBar.open(error.error?.message || 'Не удалось записаться на мероприятие', 'OK', { duration: 3000 });
      }
    });
  }

  cancelParticipation(): void {
    this.actionLoading = true;
    this.http.delete(`http://localhost:8080/api/events/${this.event.id}/participate`).subscribe({
      next: () => {
        this.userParticipations.delete(this.event.id);
        this.event.participants_count = Math.max(0, (this.event.participants_count || 1) - 1);
        this.actionLoading = false;
        this.cdr.detectChanges();
        this.snackBar.open('Вы отказались от участия в мероприятии', 'OK', { duration: 3000 });
      },
      error: (error) => {
        console.error('Ошибка при отказе от участия:', error);
        this.actionLoading = false;
        this.cdr.detectChanges();
        this.snackBar.open(error.error?.message || 'Не удалось отказаться от участия', 'OK', { duration: 3000 });
      }
    });
  }

  editEvent(): void {
    this.dialogRef.close({ edit: true, eventId: this.event.id });
  }

  onClose(): void {
    this.dialogRef.close({ refresh: true });
  }
}