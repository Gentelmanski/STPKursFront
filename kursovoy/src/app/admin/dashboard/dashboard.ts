import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Панель администратора</h1>
        <div class="user-info">
          <div class="admin-badge">👑 АДМИНИСТРАТОР</div>
          <span>{{ authService.getCurrentUser()?.username }}</span>
          <button (click)="logout()" class="btn-logout">Выйти</button>
        </div>
      </header>

      <main class="dashboard-content">
        <div class="admin-welcome">
          <h2>Административная панель управления</h2>
          <p>Здесь вы можете управлять системой и пользователями.</p>
        </div>

        <div class="admin-stats">
          <div class="stat-card">
            <div class="stat-value">125</div>
            <div class="stat-label">Всего пользователей</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">12</div>
            <div class="stat-label">Новых сегодня</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">3</div>
            <div class="stat-label">Администраторов</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">98%</div>
            <div class="stat-label">Активность системы</div>
          </div>
        </div>

        <div class="admin-controls">
          <h3>Быстрые действия</h3>
          <div class="controls-grid">
            <button class="control-btn">
              <span class="icon">👥</span>
              Управление пользователями
            </button>
            <button class="control-btn">
              <span class="icon">📊</span>
              Статистика системы
            </button>
            <button class="control-btn">
              <span class="icon">⚙️</span>
              Настройки системы
            </button>
            <button class="control-btn">
              <span class="icon">📝</span>
              Логи и отчеты
            </button>
            <button class="control-btn">
              <span class="icon">🔐</span>
              Настройки безопасности
            </button>
            <button class="control-btn">
              <span class="icon">🔄</span>
              Резервное копирование
            </button>
          </div>
        </div>

        <div class="user-management">
          <h3>Последние пользователи</h3>
          <table class="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя пользователя</th>
                <th>Email</th>
                <th>Роль</th>
                <th>Дата регистрации</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              @for (user of sampleUsers; track user.id) {
                <tr>
                  <td>{{ user.id }}</td>
                  <td>{{ user.username }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span [class]="'role-badge ' + user.role">
                      {{ user.role === 'admin' ? 'Админ' : 'Пользователь' }}
                    </span>
                  </td>
                  <td>{{ formatDate(user.created_at) }}</td>
                  <td>
                    <button class="action-btn edit">✏️</button>
                    <button class="action-btn delete">🗑️</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (authService.getCurrentUser()) {
          <div class="admin-info">
            <h3>Информация об администраторе:</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>ID администратора:</label>
                <span>{{ authService.getCurrentUser()?.id }}</span>
              </div>
              <div class="info-item">
                <label>Имя пользователя:</label>
                <span>{{ authService.getCurrentUser()?.username }}</span>
              </div>
              <div class="info-item">
                <label>Email:</label>
                <span>{{ authService.getCurrentUser()?.email }}</span>
              </div>
              <div class="info-item">
                <label>Уровень доступа:</label>
                <span class="admin-role">Администратор</span>
              </div>
            </div>
          </div>
        }

        @if (dashboardData) {
          <div class="api-response">
            <h3>Ответ от сервера (админ):</h3>
            <pre>{{ dashboardDataString }}</pre>
          </div>
        }

        @if (isLoading) {
          <div class="loading">
            <div class="spinner"></div>
            <p>Загрузка данных администратора...</p>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: #1a1a2e;
      color: #fff;
    }
    
    .dashboard-header {
      background: linear-gradient(135deg, #0f3460 0%, #16213e 100%);
      padding: 20px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 15px rgba(0, 0, 0, 0.3);
    }
    
    .dashboard-header h1 {
      margin: 0;
      font-size: 24px;
      color: #fff;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    
    .admin-badge {
      background: #e94560;
      color: white;
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 12px;
      letter-spacing: 1px;
    }
    
    .btn-logout {
      background: #e94560;
      color: white;
      border: none;
      padding: 8px 20px;
      border-radius: 20px;
      cursor: pointer;
      transition: background 0.3s;
    }
    
    .btn-logout:hover {
      background: #d43f57;
    }
    
    .dashboard-content {
      padding: 40px;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .admin-welcome {
      background: linear-gradient(135deg, #0f3460 0%, #16213e 100%);
      padding: 40px;
      border-radius: 15px;
      margin-bottom: 40px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    
    .admin-welcome h2 {
      margin-top: 0;
      color: #fff;
      font-size: 28px;
    }
    
    .admin-welcome p {
      color: #a0aec0;
      font-size: 18px;
    }
    
    .admin-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .stat-card {
      background: rgba(255, 255, 255, 0.05);
      padding: 30px;
      border-radius: 10px;
      text-align: center;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: transform 0.3s;
    }
    
    .stat-card:hover {
      transform: translateY(-5px);
    }
    
    .stat-value {
      font-size: 36px;
      font-weight: bold;
      color: #e94560;
      margin-bottom: 10px;
    }
    
    .stat-label {
      color: #a0aec0;
      font-size: 14px;
    }
    
    .admin-controls {
      background: rgba(255, 255, 255, 0.05);
      padding: 30px;
      border-radius: 15px;
      margin-bottom: 40px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .admin-controls h3 {
      color: #fff;
      margin-top: 0;
      margin-bottom: 25px;
    }
    
    .controls-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 15px;
    }
    
    .control-btn {
      background: rgba(15, 52, 96, 0.5);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 20px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      font-size: 16px;
    }
    
    .control-btn:hover {
      background: rgba(233, 69, 96, 0.2);
      border-color: rgba(233, 69, 96, 0.5);
      transform: translateY(-3px);
    }
    
    .control-btn .icon {
      font-size: 24px;
    }
    
    .user-management {
      background: rgba(255, 255, 255, 0.05);
      padding: 30px;
      border-radius: 15px;
      margin-bottom: 40px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      overflow-x: auto;
    }
    
    .user-management h3 {
      color: #fff;
      margin-top: 0;
      margin-bottom: 25px;
    }
    
    .users-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .users-table thead {
      background: rgba(15, 52, 96, 0.5);
    }
    
    .users-table th {
      padding: 15px;
      text-align: left;
      color: #fff;
      font-weight: 500;
      border-bottom: 2px solid rgba(233, 69, 96, 0.5);
    }
    
    .users-table td {
      padding: 15px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      color: #a0aec0;
    }
    
    .users-table tbody tr:hover {
      background: rgba(233, 69, 96, 0.1);
    }
    
    .role-badge {
      padding: 5px 10px;
      border-radius: 15px;
      font-size: 12px;
      font-weight: bold;
    }
    
    .role-badge.admin {
      background: rgba(233, 69, 96, 0.2);
      color: #e94560;
      border: 1px solid rgba(233, 69, 96, 0.3);
    }
    
    .role-badge.user {
      background: rgba(102, 126, 234, 0.2);
      color: #667eea;
      border: 1px solid rgba(102, 126, 234, 0.3);
    }
    
    .action-btn {
      background: none;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #a0aec0;
      padding: 5px 10px;
      border-radius: 5px;
      cursor: pointer;
      margin-right: 5px;
      transition: all 0.3s;
    }
    
    .action-btn:hover {
      transform: scale(1.1);
    }
    
    .action-btn.edit:hover {
      color: #4ade80;
      border-color: #4ade80;
    }
    
    .action-btn.delete:hover {
      color: #f87171;
      border-color: #f87171;
    }
    
    .admin-info {
      background: rgba(255, 255, 255, 0.05);
      padding: 30px;
      border-radius: 15px;
      margin-bottom: 40px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .admin-info h3 {
      color: #fff;
      margin-top: 0;
      margin-bottom: 25px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }
    
    .info-item {
      background: rgba(15, 52, 96, 0.3);
      padding: 20px;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .info-item label {
      display: block;
      color: #a0aec0;
      font-size: 14px;
      margin-bottom: 5px;
    }
    
    .info-item span {
      color: #fff;
      font-size: 18px;
    }
    
    .admin-role {
      color: #e94560 !important;
      font-weight: bold;
    }
    
    .api-response {
      background: rgba(255, 255, 255, 0.05);
      padding: 30px;
      border-radius: 15px;
      margin-bottom: 40px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .api-response h3 {
      color: #fff;
      margin-top: 0;
      margin-bottom: 15px;
    }
    
    .api-response pre {
      background: rgba(0, 0, 0, 0.3);
      padding: 20px;
      border-radius: 10px;
      overflow: auto;
      font-size: 14px;
      color: #4ade80;
      border: 1px solid rgba(74, 222, 128, 0.2);
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    
    .loading {
      text-align: center;
      padding: 40px;
    }
    
    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255, 255, 255, 0.1);
      border-top: 4px solid #e94560;
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
export class AdminDashboardComponent implements OnInit {
  dashboardData: any;
  dashboardDataString: string = '';
  isLoading = false;
  
  sampleUsers = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      created_at: '2024-01-10'
    },
    {
      id: 2,
      username: 'user1',
      email: 'user1@example.com',
      role: 'user',
      created_at: '2024-01-09'
    },
    {
      id: 3,
      username: 'user2',
      email: 'user2@example.com',
      role: 'user',
      created_at: '2024-01-08'
    },
    {
      id: 4,
      username: 'user3',
      email: 'user3@example.com',
      role: 'user',
      created_at: '2024-01-07'
    }
  ];

  constructor(
    private http: HttpClient,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.http.get('http://localhost:8080/api/admin/dashboard').subscribe({
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  }
}