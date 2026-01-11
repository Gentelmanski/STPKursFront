import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-container">
      <h1>Профиль пользователя</h1>
      @if (authService.getCurrentUser()) {
        <div class="profile-info">
          <p><strong>ID:</strong> {{authService.getCurrentUser()?.id}}</p>
          <p><strong>Имя пользователя:</strong> {{authService.getCurrentUser()?.username}}</p>
          <p><strong>Email:</strong> {{authService.getCurrentUser()?.email}}</p>
          <p><strong>Роль:</strong> {{authService.getCurrentUser()?.role}}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 20px;
    }
  `]
})
export class UserProfileComponent implements OnInit {
  constructor(
    public authService: AuthService
  ) {}

  ngOnInit(): void {}
}