// edit-event-dialog/edit-event-dialog.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormGroupDirective } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms'; // Для ngModel

@Component({
  selector: 'app-edit-event-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule, // Добавлен для ngModel
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatDividerModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatRadioModule // Добавлен для mat-radio-group
  ],
  template: `
    <div [ngSwitch]="action">
      
      <!-- Редактирование мероприятия -->
      <div *ngSwitchCase="'editEvent'">
        <h2 mat-dialog-title>Редактировать мероприятие</h2>
        <mat-dialog-content>
          <form [formGroup]="eventForm">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Название мероприятия</mat-label>
                <input matInput formControlName="title" required>
                <mat-error *ngIf="eventForm.get('title')?.hasError('required')">
                  Название обязательно
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Тип мероприятия</mat-label>
                <mat-select formControlName="type" required>
                  <mat-option value="concert">🎵 Концерт</mat-option>
                  <mat-option value="exhibition">🖼 Выставка</mat-option>
                  <mat-option value="meetup">👥 Встреча</mat-option>
                  <mat-option value="workshop">🔧 Мастер-класс</mat-option>
                  <mat-option value="sport">⚽ Спорт</mat-option>
                  <mat-option value="festival">🎉 Фестиваль</mat-option>
                  <mat-option value="other">📌 Другое</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Дата и время</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="event_date" required>
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Описание</mat-label>
                <textarea matInput formControlName="description" rows="4" required></textarea>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Макс. участников</mat-label>
                <input matInput type="number" formControlName="max_participants" min="1">
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Цена (₽)</mat-label>
                <input matInput type="number" formControlName="price" min="0" step="0.01">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-checkbox formControlName="is_active">
                Активное мероприятие
              </mat-checkbox>
            </div>
          </form>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
          <button mat-button (click)="onCancel()">Отмена</button>
          <button mat-raised-button color="primary" 
                  (click)="saveEvent()"
                  [disabled]="!eventForm.valid">
            Сохранить
          </button>
        </mat-dialog-actions>
      </div>
      
      <!-- Изменение статуса участия -->
      <div *ngSwitchCase="'changeParticipation'">
        <h2 mat-dialog-title>Изменение статуса участия</h2>
        <mat-dialog-content>
          <p>Выберите новый статус участия в мероприятии:</p>
          <p><strong>{{data.event?.title}}</strong></p>
          
          <div class="status-options">
            <mat-radio-group [(ngModel)]="selectedParticipationStatus">
              <mat-radio-button value="going" class="status-option">
                <div class="status-content">
                  <mat-icon class="status-icon going">check_circle</mat-icon>
                  <div>
                    <div class="status-title">Пойду</div>
                    <div class="status-description">Точно буду участвовать</div>
                  </div>
                </div>
              </mat-radio-button>
              
              <mat-radio-button value="maybe" class="status-option">
                <div class="status-content">
                  <mat-icon class="status-icon maybe">help</mat-icon>
                  <div>
                    <div class="status-title">Возможно</div>
                    <div class="status-description">Пока не уверен</div>
                  </div>
                </div>
              </mat-radio-button>
              
              <mat-radio-button value="declined" class="status-option">
                <div class="status-content">
                  <mat-icon class="status-icon declined">cancel</mat-icon>
                  <div>
                    <div class="status-title">Не пойду</div>
                    <div class="status-description">Не смогу участвовать</div>
                  </div>
                </div>
              </mat-radio-button>
            </mat-radio-group>
          </div>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
          <button mat-button (click)="onCancel()">Отмена</button>
          <button mat-raised-button color="primary" 
                  (click)="saveParticipationStatus()"
                  [disabled]="!selectedParticipationStatus">
            Сохранить
          </button>
        </mat-dialog-actions>
      </div>
      
      <!-- Редактирование профиля -->
      <div *ngSwitchCase="'editProfile'">
        <h2 mat-dialog-title>Редактировать профиль</h2>
        <mat-dialog-content>
          <form [formGroup]="profileForm">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Имя пользователя</mat-label>
                <input matInput formControlName="username" required>
                <mat-error *ngIf="profileForm.get('username')?.hasError('required')">
                  Имя пользователя обязательно
                </mat-error>
              </mat-form-field>
            </div>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" required>
                <mat-error *ngIf="profileForm.get('email')?.hasError('required')">
                  Email обязателен
                </mat-error>
                <mat-error *ngIf="profileForm.get('email')?.hasError('email')">
                  Введите корректный email
                </mat-error>
              </mat-form-field>
            </div>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Аватар (URL)</mat-label>
                <input matInput formControlName="avatar_url">
              </mat-form-field>
            </div>
          </form>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
          <button mat-button (click)="onCancel()">Отмена</button>
          <button mat-raised-button color="primary" 
                  (click)="saveProfile()"
                  [disabled]="!profileForm.valid">
            Сохранить
          </button>
        </mat-dialog-actions>
      </div>
      
      <!-- Смена пароля -->
      <div *ngSwitchDefault>
        <h2 mat-dialog-title>Сменить пароль</h2>
        <mat-dialog-content>
          <form [formGroup]="passwordForm">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Текущий пароль</mat-label>
                <input matInput type="password" formControlName="current_password" required>
              </mat-form-field>
            </div>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Новый пароль</mat-label>
                <input matInput type="password" formControlName="new_password" required minlength="6">
                <mat-error *ngIf="passwordForm.get('new_password')?.hasError('minlength')">
                  Пароль должен содержать минимум 6 символов
                </mat-error>
              </mat-form-field>
            </div>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Подтвердите новый пароль</mat-label>
                <input matInput type="password" formControlName="confirm_password" required>
                <mat-error *ngIf="passwordForm.hasError('passwordMismatch')">
                  Пароли не совпадают
                </mat-error>
              </mat-form-field>
            </div>
          </form>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
          <button mat-button (click)="onCancel()">Отмена</button>
          <button mat-raised-button color="primary" 
                  (click)="changePassword()"
                  [disabled]="!passwordForm.valid">
            Сменить пароль
          </button>
        </mat-dialog-actions>
      </div>
      
    </div>
  `,
  styles: [`
    .form-row {
      margin-bottom: 20px;
      display: flex;
      gap: 16px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .half-width {
      flex: 1;
    }
    
    .status-options {
      margin: 20px 0;
    }
    
    .status-option {
      display: block;
      margin: 10px 0;
    }
    
    .status-content {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
    }
    
    .status-icon {
      font-size: 24px;
      height: 24px;
      width: 24px;
    }
    
    .status-icon.going {
      color: #4caf50;
    }
    
    .status-icon.maybe {
      color: #ff9800;
    }
    
    .status-icon.declined {
      color: #f44336;
    }
    
    .status-title {
      font-weight: 500;
    }
    
    .status-description {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }
  `]
})
export class EditEventDialogComponent implements OnInit {
  action: string;
  eventForm: FormGroup;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  selectedParticipationStatus: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EditEventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.action = data.action || 'editEvent';
    this.selectedParticipationStatus = data.currentStatus || 'going';
    
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      type: ['', Validators.required],
      description: ['', Validators.required],
      event_date: ['', Validators.required],
      max_participants: [null],
      price: [0],
      is_active: [true]
    });
    
    this.profileForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      avatar_url: ['']
    });
    
    this.passwordForm = this.fb.group({
      current_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    if (this.action === 'editEvent' && this.data.event) {
      this.eventForm.patchValue({
        title: this.data.event.title,
        type: this.data.event.type,
        description: this.data.event.description,
        event_date: new Date(this.data.event.event_date),
        max_participants: this.data.event.max_participants,
        price: this.data.event.price,
        is_active: this.data.event.is_active
      });
    }
    
    if (this.action === 'editProfile' && this.data.user) {
      this.profileForm.patchValue({
        username: this.data.user.username,
        email: this.data.user.email,
        avatar_url: this.data.user.avatar_url || ''
      });
    }
  }

  passwordMatchValidator(g: FormGroup) {
    const newPassword = g.get('new_password')?.value;
    const confirmPassword = g.get('confirm_password')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  saveEvent(): void {
    if (this.eventForm.valid) {
      const eventData = this.eventForm.value;
      // Преобразуем дату в формат ISO
      eventData.event_date = new Date(eventData.event_date).toISOString();
      
      this.http.put(`http://localhost:8080/api/events/${this.data.event.id}`, eventData).subscribe({
        next: () => {
          this.dialogRef.close(true);
          this.snackBar.open('Мероприятие обновлено', 'OK', { duration: 3000 });
        },
        error: (error) => {
          console.error('Ошибка обновления мероприятия:', error);
          this.snackBar.open('Ошибка при обновлении мероприятия', 'Ошибка', { duration: 3000 });
        }
      });
    }
  }

  saveParticipationStatus(): void {
    this.dialogRef.close({ status: this.selectedParticipationStatus });
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      this.http.put(`http://localhost:8080/api/profile`, this.profileForm.value).subscribe({
        next: () => {
          this.dialogRef.close(true);
          this.snackBar.open('Профиль обновлен', 'OK', { duration: 3000 });
        },
        error: (error) => {
          console.error('Ошибка обновления профиля:', error);
          this.snackBar.open('Ошибка при обновлении профиля', 'Ошибка', { duration: 3000 });
        }
      });
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      this.http.post(`http://localhost:8080/api/change-password`, this.passwordForm.value).subscribe({
        next: () => {
          this.dialogRef.close(true);
          this.snackBar.open('Пароль успешно изменен', 'OK', { duration: 3000 });
        },
        error: (error) => {
          console.error('Ошибка смены пароля:', error);
          this.snackBar.open('Ошибка при смене пароля', 'Ошибка', { duration: 3000 });
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}