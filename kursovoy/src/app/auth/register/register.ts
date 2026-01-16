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
  templateUrl: `register.html`,
  styleUrl: `register.scss`,
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
      this.router.navigate(['/']);
    },
    error: (error) => {
      this.isLoading = false;
      this.errorMessage = error.error?.error || 'Ошибка регистрации';
    }
  });
}
}