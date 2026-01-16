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
  templateUrl: `event-details-dialog.html`,
  styleUrl:`event-details-dialog.scss`,
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