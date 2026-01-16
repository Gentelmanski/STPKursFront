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
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-event-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
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
    MatRadioModule
  ],
  templateUrl: `evet-edit-dialog.html`,
  styleUrl: `evet-edit-dialog.scss`,
})
export class EditEventDialogComponent implements OnInit {
  action: string;
  eventForm: FormGroup;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  selectedParticipationStatus: string = '';
  event: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EditEventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.action = data.action || 'editEvent';
    this.selectedParticipationStatus = data.currentStatus || 'going';
    this.loadEventDetails();
    
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

    loadEventDetails(): void {
    this.http.get<any>(`http://localhost:8080/api/events/${this.data.eventId}`).subscribe({
      next: (event) => {
        this.event = event;
      },
      error: (error) => {
        console.error('Ошибка загрузки мероприятия:', error);
      }
    });
  }

    formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

}