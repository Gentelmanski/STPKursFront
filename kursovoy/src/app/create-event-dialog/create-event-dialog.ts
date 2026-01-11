import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-create-event-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>Создать мероприятие</h2>
    <mat-dialog-content>
      <form [formGroup]="eventForm">
        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Название мероприятия</mat-label>
            <input matInput formControlName="title" required>
            @if (eventForm.get('title')?.hasError('required')) {
              <mat-error>Название обязательно</mat-error>
            }
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
          @if (selectedLocation) {
            <div class="location-info">
              <p>Координаты: {{selectedLocation.lat.toFixed(6)}}, {{selectedLocation.lng.toFixed(6)}}</p>
            </div>
          }
        </div>

        <div class="form-row">
          <button mat-raised-button color="primary" (click)="selectLocation()">
            Выбрать местоположение на карте
          </button>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Отмена</button>
      <button mat-raised-button color="primary" 
              (click)="onSubmit()"
              [disabled]="!eventForm.valid || !selectedLocation">
        Создать
      </button>
    </mat-dialog-actions>
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
    
    .location-info {
      margin-top: 10px;
      padding: 10px;
      background: #f5f5f5;
      border-radius: 4px;
    }
  `]
})
export class CreateEventDialogComponent implements OnInit {
  eventForm: FormGroup;
  selectedLocation: { lat: number, lng: number } | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private dialogRef: MatDialogRef<CreateEventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      type: ['', Validators.required],
      description: ['', Validators.required],
      event_date: ['', Validators.required],
      max_participants: [null],
      price: [0]
    });
  }

  ngOnInit(): void {}

  selectLocation(): void {
    // Здесь будет логика выбора местоположения
    // Для демонстрации используем случайные координаты
    this.selectedLocation = {
      lat: 55.751244 + (Math.random() - 0.5) * 0.1,
      lng: 37.618423 + (Math.random() - 0.5) * 0.1
    };
  }

  onSubmit(): void {
    if (!this.selectedLocation) return;

    const eventData = {
      ...this.eventForm.value,
      latitude: this.selectedLocation.lat,
      longitude: this.selectedLocation.lng
    };

    this.http.post('http://localhost:8080/api/events', eventData).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Ошибка создания мероприятия:', error);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}