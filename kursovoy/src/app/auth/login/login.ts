import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Вход в систему</h2>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email:</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email" 
              placeholder="Введите email"
              class="form-control"
            >
            @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
              <div class="error">
                Введите корректный email
              </div>
            }
          </div>

          <div class="form-group">
            <label for="password">Пароль:</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password" 
              placeholder="Введите пароль"
              class="form-control"
            >
            @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
              <div class="error">
                Пароль должен содержать минимум 6 символов
              </div>
            }
          </div>

          <button 
            type="submit" 
            class="btn btn-primary"
            [disabled]="loginForm.invalid || isLoading"
          >
            @if (isLoading) {
              Вход...
            } @else {
              Войти
            }
          </button>

          @if (errorMessage) {
            <div class="error-message">
              {{ errorMessage }}
            </div>
          }
        </form>

        <div class="register-link">
          Нет аккаунта? <a routerLink="/register">Зарегистрируйтесь</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    
    .login-card {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      width: 100%;
      max-width: 400px;
    }
    
    h2 {
      text-align: center;
      color: #333;
      margin-bottom: 30px;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    label {
      display: block;
      margin-bottom: 8px;
      color: #555;
      font-weight: 500;
    }
    
    .form-control {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 16px;
      transition: border-color 0.3s;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
    }
    
    .error {
      color: #e74c3c;
      font-size: 14px;
      margin-top: 5px;
    }
    
    .btn {
      width: 100%;
      padding: 12px;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .btn-primary {
      background-color: #667eea;
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background-color: #5a67d8;
    }
    
    .btn-primary:disabled {
      background-color: #a3bffa;
      cursor: not-allowed;
    }
    
    .error-message {
      background-color: #fee;
      color: #e74c3c;
      padding: 10px;
      border-radius: 5px;
      margin-top: 15px;
      text-align: center;
    }
    
    .register-link {
      text-align: center;
      margin-top: 20px;
      color: #666;
    }
    
    .register-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }
    
    .register-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.user.role === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/user/dashboard']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'Login failed';
      }
    });
  }
}