// create-event-dialog/create-event-dialog.ts
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
import { MatSnackBar } from '@angular/material/snack-bar';

declare const ymaps: any;

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

        <!-- Поле для ввода адреса -->
        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Адрес мероприятия</mat-label>
            <input matInput [formControl]="addressControl" placeholder="Введите адрес для поиска на карте">
            <button mat-icon-button matSuffix (click)="geocodeAddress()" [disabled]="!addressControl.value">
              <mat-icon>search</mat-icon>
            </button>
            <mat-hint>Начните вводить адрес и нажмите поиск для определения координат</mat-hint>
          </mat-form-field>
        </div>

        <!-- Карта для отображения найденного местоположения -->
        <div class="form-row" *ngIf="showMap">
          <div id="map-container" style="height: 300px; width: 100%; margin-top: 20px;"></div>
        </div>

        <!-- Отображение координат и кнопка ручного выбора -->
        <div class="form-row" *ngIf="selectedLocation">
          <div class="location-info">
            <p><strong>Координаты:</strong> {{selectedLocation.lat.toFixed(6)}}, {{selectedLocation.lng.toFixed(6)}}</p>
            <p><strong>Адрес:</strong> {{selectedLocation.address}}</p>
            <button mat-button color="primary" (click)="openMapForSelection()">
              <mat-icon>place</mat-icon>
              Выбрать точку на карте вручную
            </button>
          </div>
        </div>

        <!-- Поле для тегов -->
        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Теги (через запятую)</mat-label>
            <input matInput formControlName="tags" placeholder="Например: музыка, вечер, встреча">
          </mat-form-field>
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
      padding: 15px;
      background: #f5f5f5;
      border-radius: 8px;
      border-left: 4px solid #1976d2;
    }
    
    .location-info p {
      margin: 8px 0;
    }
    
    #map-container {
      border-radius: 8px;
      overflow: hidden;
      border: 2px solid #e0e0e0;
    }
  `]
})
export class CreateEventDialogComponent implements OnInit {
  eventForm: FormGroup;
  addressControl = new FormControl('');
  selectedLocation: { 
    lat: number; 
    lng: number; 
    address: string;
  } | null = null;
  
  showMap = false;
  private map: any;
  private placemark: any;
  isGeocoding = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<CreateEventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      type: ['', Validators.required],
      description: ['', Validators.required],
      event_date: ['', Validators.required],
      max_participants: [null],
      price: [0],
      tags: ['']
    });
  }

  ngOnInit(): void {
    // Инициализация карты при открытии диалога
    this.initMap();
  }

  private initMap(): void {
    if (typeof ymaps === 'undefined') {
      console.error('Yandex Maps API не загружена');
      return;
    }

    ymaps.ready(() => {
      // Создаем карту в контейнере (пока скрыта)
      this.map = new ymaps.Map('map-container', {
        center: [55.751244, 37.618423], // Москва
        zoom: 10,
        controls: ['zoomControl', 'fullscreenControl']
      });

      // Добавляем обработчик клика по карте
      this.map.events.add('click', (e: any) => {
        const coords = e.get('coords');
        this.setLocationFromCoords(coords);
      });
    });
  }

  geocodeAddress(): void {
    const address = this.addressControl.value?.trim();
    if (!address) {
      this.snackBar.open('Введите адрес', 'Ошибка', { duration: 3000 });
      return;
    }

    this.isGeocoding = true;

    ymaps.ready(() => {
      ymaps.geocode(address, {
        results: 1
      }).then((res: any) => {
        const firstGeoObject = res.geoObjects.get(0);
        
        if (firstGeoObject) {
          const coords = firstGeoObject.geometry.getCoordinates();
          const addressName = firstGeoObject.getAddressLine();
          
          this.selectedLocation = {
            lat: coords[0],
            lng: coords[1],
            address: addressName
          };
          
          // Показываем карту и устанавливаем метку
          this.showMap = true;
          this.setMapCenter(coords);
          this.addPlacemark(coords, addressName);
          
          this.snackBar.open('Адрес найден!', 'OK', { duration: 3000 });
        } else {
          this.snackBar.open('Адрес не найден', 'Ошибка', { duration: 3000 });
        }
      }).catch((error: any) => {
        console.error('Ошибка геокодирования:', error);
        this.snackBar.open('Ошибка при поиске адреса', 'Ошибка', { duration: 3000 });
      }).finally(() => {
        this.isGeocoding = false;
      });
    });
  }

  private setMapCenter(coords: [number, number]): void {
    if (this.map) {
      this.map.setCenter(coords, 15);
    }
  }

  private addPlacemark(coords: [number, number], address: string): void {
    // Удаляем старую метку если есть
    if (this.placemark) {
      this.map.geoObjects.remove(this.placemark);
    }
    
    this.placemark = new ymaps.Placemark(coords, {
      balloonContent: address,
      iconCaption: 'Место мероприятия'
    }, {
      preset: 'islands#redDotIcon'
    });
    
    this.map.geoObjects.add(this.placemark);
  }

  private setLocationFromCoords(coords: [number, number]): void {
    ymaps.geocode(coords).then((res: any) => {
      const firstGeoObject = res.geoObjects.get(0);
      const address = firstGeoObject.getAddressLine();
      
      this.selectedLocation = {
        lat: coords[0],
        lng: coords[1],
        address: address
      };
      
      this.addressControl.setValue(address);
      this.addPlacemark(coords, address);
      
      this.snackBar.open('Местоположение выбрано', 'OK', { duration: 2000 });
    });
  }

  openMapForSelection(): void {
    this.showMap = true;
    if (this.selectedLocation) {
      this.setMapCenter([this.selectedLocation.lat, this.selectedLocation.lng]);
    }
  }

  onSubmit(): void {
    if (!this.selectedLocation) return;

    // Преобразуем строку тегов в массив
    const tagsStr = this.eventForm.get('tags')?.value || '';
    const tags = tagsStr.split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0);

    const eventData = {
      ...this.eventForm.value,
      latitude: this.selectedLocation.lat,
      longitude: this.selectedLocation.lng,
      tags: tags
    };

    this.http.post('http://localhost:8080/api/events', eventData).subscribe({
      next: () => {
        this.snackBar.open('Мероприятие создано успешно!', 'OK', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Ошибка создания мероприятия:', error);
        this.snackBar.open('Ошибка при создании мероприятия', 'Ошибка', { duration: 3000 });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}