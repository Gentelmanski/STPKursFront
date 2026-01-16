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
  template: `
    <div *ngIf="action === 'view' || action === 'viewUser' || action === 'viewComment'; else verificationTemplate">
      <!-- Детальный просмотр мероприятия или пользователя -->
      <h2 mat-dialog-title>
        {{getDialogTitle()}}
      </h2>
      <mat-dialog-content>
        <div *ngIf="action === 'view' && event">
          <mat-card>
            <mat-card-header>
              <mat-card-title>{{event.title}}</mat-card-title>
              <mat-card-subtitle>{{getEventTypeText(event.type)}}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="detail-section">
                <h4>Описание:</h4>
                <p>{{event.description}}</p>
              </div>
              
              <mat-divider></mat-divider>
              
              <div class="details-grid">
                <div class="detail-item">
                  <span class="detail-label">Дата мероприятия:</span>
                  <span class="detail-value">{{formatDate(event.event_date)}}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Создатель:</span>
                  <span class="detail-value">{{event.creator?.username || 'Неизвестно'}}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Email создателя:</span>
                  <span class="detail-value">{{event.creator?.email || 'Неизвестно'}}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Участников:</span>
                  <span class="detail-value">{{event.participants_count || 0}}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Цена:</span>
                  <span class="detail-value">{{event.price > 0 ? (event.price + ' ₽') : 'Бесплатно'}}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Статус:</span>
                  <span class="detail-value">
                    <mat-chip [color]="getStatusColor(event)" selected>
                      {{getStatusText(event)}}
                    </mat-chip>
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Создано:</span>
                  <span class="detail-value">{{formatDate(event.created_at)}}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Обновлено:</span>
                  <span class="detail-value">{{formatDate(event.updated_at)}}</span>
                </div>
              </div>
              
              <div *ngIf="event.tags && event.tags.length > 0" class="tags-section">
                <mat-divider></mat-divider>
                <h4>Теги:</h4>
                <div class="tags-container">
                  <mat-chip *ngFor="let tag of event.tags" color="primary">
                    {{tag}}
                  </mat-chip>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
        
        <div *ngIf="action === 'viewUser' && user">
          <mat-card>
            <mat-card-header>
              <mat-card-title>{{user.username}}</mat-card-title>
              <mat-card-subtitle>{{user.email}}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="details-grid">
                <div class="detail-item">
                  <span class="detail-label">ID:</span>
                  <span class="detail-value">{{user.id}}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Роль:</span>
                  <span class="detail-value">
                    <mat-chip [color]="user.role === 'admin' ? 'warn' : 'primary'" selected>
                      {{user.role === 'admin' ? 'Администратор' : 'Пользователь'}}
                    </mat-chip>
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Статус:</span>
                  <span class="detail-value">
                    <mat-chip [color]="user.is_blocked ? 'warn' : 'accent'" selected>
                      {{user.is_blocked ? 'Заблокирован' : 'Активен'}}
                    </mat-chip>
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Дата регистрации:</span>
                  <span class="detail-value">{{formatDate(user.created_at)}}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Последний онлайн:</span>
                  <span class="detail-value">{{formatDate(user.last_online)}}</span>
                </div>
              </div>
              
              <mat-divider></mat-divider>
              
              <div class="user-stats">
                <h4>Статистика активности:</h4>
                <div class="stats-grid">
                  <div class="stat-item">
                    <mat-icon>event</mat-icon>
                    <div class="stat-content">
                      <div class="stat-value">{{user.events_created || 0}}</div>
                      <div class="stat-label">Созданных мероприятий</div>
                    </div>
                  </div>
                  <div class="stat-item">
                    <mat-icon>group</mat-icon>
                    <div class="stat-content">
                      <div class="stat-value">{{user.events_participated || 0}}</div>
                      <div class="stat-label">Участий в мероприятиях</div>
                    </div>
                  </div>
                  <div class="stat-item">
                    <mat-icon>comment</mat-icon>
                    <div class="stat-content">
                      <div class="stat-value">{{user.comments_count || 0}}</div>
                      <div class="stat-label">Комментариев</div>
                    </div>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Закрыть</button>
      </mat-dialog-actions>
    </div>
    
    <ng-template #verificationTemplate>
      <!-- Диалог верификации/отклонения/удаления -->
      <h2 mat-dialog-title>
        {{getDialogTitle()}}
      </h2>
      <mat-dialog-content>
        <p>{{data.message}}</p>
        
        <form *ngIf="action === 'reject'" [formGroup]="rejectForm">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Причина отклонения</mat-label>
            <textarea matInput formControlName="reason" rows="4" required></textarea>
            <mat-error *ngIf="rejectForm.get('reason')?.hasError('required')">
              Укажите причину отклонения
            </mat-error>
          </mat-form-field>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Отмена</button>
        <button mat-raised-button 
                [color]="action === 'verify' ? 'primary' : 'warn'"
                (click)="onConfirm()"
                [disabled]="action === 'reject' && !rejectForm.valid">
          {{getConfirmButtonText()}}
        </button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styles: [`
    .detail-section {
      margin-bottom: 16px;
    }
    
    .detail-section h4 {
      margin-top: 0;
      margin-bottom: 8px;
      color: rgba(0, 0, 0, 0.87);
    }
    
    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 12px;
      margin-top: 16px;
    }
    
    .detail-item {
      display: flex;
      flex-direction: column;
    }
    
    .detail-label {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 4px;
    }
    
    .detail-value {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.87);
      font-weight: 500;
    }
    
    .tags-section {
      margin-top: 16px;
    }
    
    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }
    
    .user-stats {
      margin-top: 16px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    
    .stat-item mat-icon {
      color: #1976d2;
    }
    
    .stat-content {
      display: flex;
      flex-direction: column;
    }
    
    .stat-value {
      font-size: 20px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.87);
    }
    
    .stat-label {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .full-width {
      width: 100%;
    }
  `]
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