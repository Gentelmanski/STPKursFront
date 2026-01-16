import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-event-verification-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: `event-verification.html`,
  styleUrl: `event-verification.scss`,
})
export class EventVerificationDialogComponent {
  action: string;
  event: any;
  user: any;
  comment: any;
  rejectForm: FormGroup;
  
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
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EventVerificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.action = data.action || 'verify';
    this.event = data.event;
    this.user = data.user;
    this.comment = data.comment;
    
    this.rejectForm = this.fb.group({
      reason: ['', Validators.required]
    });
  }

  getDialogTitle(): string {
    switch (this.action) {
      case 'verify': return 'Подтверждение мероприятия';
      case 'reject': return 'Отклонение мероприятия';
      case 'delete': return 'Удаление мероприятия';
      case 'view': return 'Детали мероприятия';
      case 'viewUser': return 'Детали пользователя';
      case 'viewComment': return 'Детали комментария';
      default: return 'Подтверждение действия';
    }
  }

  getEventTypeText(type: string): string {
    return this.eventTypes[type as keyof typeof this.eventTypes] || type;
  }

  getConfirmButtonText(): string {
    switch (this.action) {
      case 'verify': return 'Подтвердить';
      case 'reject': return 'Отклонить';
      case 'delete': return 'Удалить';
      default: return 'Подтвердить';
    }
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

  getStatusColor(event: any): string {
    if (!event.is_verified && event.is_active) return 'primary';
    if (event.is_verified && event.is_active) return 'accent';
    return 'warn';
  }

  getStatusText(event: any): string {
    if (!event.is_verified && event.is_active) return 'На верификации';
    if (event.is_verified && event.is_active) return 'Подтверждено';
    if (!event.is_active) return 'Неактивно';
    return 'Отклонено';
  }

  onConfirm(): void {
    if (this.action === 'reject') {
      this.dialogRef.close({ reason: this.rejectForm.value.reason });
    } else {
      this.dialogRef.close(true);
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}