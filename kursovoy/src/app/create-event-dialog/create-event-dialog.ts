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
  templateUrl: `create-event-dialog.html`,
  styleUrl: `create-event-dialog.scss`,
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
      // Создаем карту в контейнере
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

    private setupAddressAutocomplete(): void {
    if (typeof ymaps === 'undefined') {
      console.error('Yandex Maps API не загружена');
      return;
    }

    ymaps.ready(() => {
      // Находим input для адреса по его id
      const addressInput = document.getElementById('address-input');
      
      if (!addressInput) {
        console.error('Поле ввода адреса не найдено');
        return;
      }

      // Создаем SuggestView для автодополнения
      const suggestView = new ymaps.SuggestView('address-input', {
        provider: {
          // Можно указать конкретные регионы для ограничения
          boundedBy: [[55.55, 37.35], [55.95, 37.85]] // Пример для Москвы
        },
        results: 5 // Количество подсказок
      });

      // Обработчик выбора подсказки
      suggestView.events.add('select', (e: any) => {
        const selectedItem = e.get('item');
        const address = selectedItem.value;
        
        this.addressControl.setValue(address);
        
        // Автоматически выполняем геокодирование при выборе подсказки
        setTimeout(() => {
          this.geocodeAddress();
        }, 100);
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