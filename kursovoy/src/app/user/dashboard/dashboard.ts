import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-user-dashboard',
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Панель пользователя</h1>
        <div class="user-info">
          <span>Добро пожаловать, {{ authService.getCurrentUser()?.username }}!</span>
          <button (click)="logout()" class="btn-logout">Выйти</button>
        </div>
      </header>

      <main class="dashboard-content">
        <div class="welcome-section">
          <h2>Добро пожаловать в личный кабинет!</h2>
          <p>Здесь вы можете управлять своим профилем и настройками.</p>
        </div>

        <div class="dashboard-cards">
          <div class="card">
            <div class="card-icon">👤</div>
            <h3>Профиль</h3>
            <p>Управление личной информацией</p>
          </div>

          <div class="card">
            <div class="card-icon">⚙️</div>
            <h3>Настройки</h3>
            <p>Настройки аккаунта</p>
          </div>

          <div class="card">
            <div class="card-icon">📊</div>
            <h3>Статистика</h3>
            <p>Просмотр активности</p>
          </div>

          <div class="card">
            <div class="card-icon">🔒</div>
            <h3>Безопасность</h3>
            <p>Настройки безопасности</p>
          </div>
        </div>

        @if (authService.getCurrentUser()) {
          <div class="user-details">
            <h3>Информация о пользователе:</h3>
            <ul>
              <li><strong>ID:</strong> {{ authService.getCurrentUser()?.id }}</li>
              <li><strong>Имя пользователя:</strong> {{ authService.getCurrentUser()?.username }}</li>
              <li><strong>Email:</strong> {{ authService.getCurrentUser()?.email }}</li>
              <li><strong>Роль:</strong> {{ authService.getCurrentUser()?.role }}</li>
              <li><strong>Дата регистрации:</strong> {{ formatDate(authService.getCurrentUser()?.created_at) }}</li>
            </ul>
          </div>
        }

        @if (dashboardData) {
          <div class="api-response">
            <h3>Ответ от сервера:</h3>
            <pre>{{ dashboardDataString }}</pre>
          </div>
        }

        @if (isLoading) {
          <div class="loading">
            <div class="spinner"></div>
            <p>Загрузка данных...</p>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: #f5f7fa;
    }
    
    .dashboard-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .dashboard-header h1 {
      margin: 0;
      font-size: 24px;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    
    .btn-logout {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 8px 20px;
      border-radius: 20px;
      cursor: pointer;
      transition: background 0.3s;
    }
    
    .btn-logout:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    
    .dashboard-content {
      padding: 40px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .welcome-section {
      background: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .welcome-section h2 {
      color: #333;
      margin-top: 0;
    }
    
    .welcome-section p {
      color: #666;
      font-size: 18px;
    }
    
    .dashboard-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .card {
      background: white;
      padding: 30px;
      border-radius: 10px;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s, box-shadow 0.3s;
      cursor: pointer;
    }
    
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
    }
    
    .card-icon {
      font-size: 40px;
      margin-bottom: 15px;
    }
    
    .card h3 {
      color: #333;
      margin-bottom: 10px;
    }
    
    .card p {
      color: #666;
      margin: 0;
    }
    
    .user-details {
      background: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .user-details h3 {
      color: #333;
      margin-top: 0;
      margin-bottom: 20px;
    }
    
    .user-details ul {
      list-style: none;
      padding: 0;
    }
    
    .user-details li {
      padding: 10px 0;
      border-bottom: 1px solid #eee;
      color: #555;
    }
    
    .user-details li:last-child {
      border-bottom: none;
    }
    
    .user-details strong {
      color: #333;
      min-width: 200px;
      display: inline-block;
    }
    
    .api-response {
      background: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .api-response h3 {
      color: #333;
      margin-top: 0;
      margin-bottom: 15px;
    }
    
    .api-response pre {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      overflow: auto;
      font-size: 14px;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    
    .loading {
      text-align: center;
      padding: 40px;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class UserDashboardComponent implements OnInit {
  dashboardData: any;
  dashboardDataString: string = '';
  isLoading = false;

  constructor(
    private http: HttpClient,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.http.get('http://localhost:8080/api/user/dashboard').subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.dashboardDataString = JSON.stringify(data, null, 2);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load dashboard:', error);
        this.isLoading = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  }
}