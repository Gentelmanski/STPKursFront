import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="register-container">
      <div class="register-card">
        <h2>Регистрация</h2>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="username">Имя пользователя:</label>
            <input 
              type="text" 
              id="username" 
              formControlName="username" 
              placeholder="Введите имя пользователя"
              class="form-control"
            >
            @if (registerForm.get('username')?.invalid && registerForm.get('username')?.touched) {
              <div class="error">
                Имя должно содержать минимум 3 символа
              </div>
            }
          </div>

          <div class="form-group">
            <label for="email">Email:</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email" 
              placeholder="Введите email"
              class="form-control"
            >
            @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
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
            @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
              <div class="error">
                Пароль должен содержать минимум 6 символов
              </div>
            }
          </div>

          <div class="form-group">
            <label for="confirmPassword">Подтвердите пароль:</label>
            <input 
              type="password" 
              id="confirmPassword" 
              formControlName="confirmPassword" 
              placeholder="Повторите пароль"
              class="form-control"
            >
            @if (registerForm.errors?.['mismatch'] && registerForm.get('confirmPassword')?.touched) {
              <div class="error">
                Пароли не совпадают
              </div>
            }
          </div>

          <!-- Комбобокс для выбора роли -->
          <div class="form-group">
            <label for="role">Выберите роль:</label>
            <select 
              id="role" 
              formControlName="role"
              class="form-control"
            >
              <option value="" disabled selected>Выберите роль</option>
              <option value="user">👤 Обычный пользователь</option>
              <option value="admin">👑 Администратор</option>
            </select>
            @if (registerForm.get('role')?.invalid && registerForm.get('role')?.touched) {
              <div class="error">
                Пожалуйста, выберите роль
              </div>
            }
          </div>

          <button 
            type="submit" 
            class="btn btn-primary"
            [disabled]="registerForm.invalid || isLoading"
          >
            @if (isLoading) {
              Регистрация...
            } @else {
              Зарегистрироваться
            }
          </button>

          @if (errorMessage) {
            <div class="error-message">
              {{ errorMessage }}
            </div>
          }
        </form>

        <div class="login-link">
          Уже есть аккаунт? <a routerLink="/login">Войдите</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      padding: 20px;
    }
    
    .register-card {
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
    
    select.form-control {
      appearance: none;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 12px center;
      background-size: 16px;
      padding-right: 40px;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #f5576c;
      box-shadow: 0 0 0 2px rgba(245, 87, 108, 0.2);
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
      background-color: #f5576c;
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background-color: #e4465b;
    }
    
    .btn-primary:disabled {
      background-color: #f8a5af;
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
    
    .login-link {
      text-align: center;
      margin-top: 20px;
      color: #666;
    }
    
    .login-link a {
      color: #f5576c;
      text-decoration: none;
      font-weight: 500;
    }
    
    .login-link a:hover {
      text-decoration: underline;
    }
    
    option[value="user"] {
      color: #495057;
    }
    
    option[value="admin"] {
      color: #e4465b;
      font-weight: bold;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { confirmPassword, ...registerData } = this.registerForm.value;
    
    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        const roleName = response.user.role === 'admin' ? 'администратор' : 'пользователь';
        alert(`✅ Вы успешно зарегистрированы как ${roleName}!`);
        
        if (response.user.role === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/user/dashboard']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'Ошибка регистрации';
      }
    });
  }
}