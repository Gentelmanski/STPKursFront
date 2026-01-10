import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { UserDashboardComponent } from './user/dashboard/dashboard';
import { AdminDashboardComponent } from './admin/dashboard/dashboard';
import { AuthGuard } from './auth/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'user/dashboard', 
    component: UserDashboardComponent,
    canActivate: [AuthGuard],
    data: { role: 'user' }
  },
  { 
    path: 'admin/dashboard', 
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    data: { role: 'admin' }
  },
  { path: '**', redirectTo: '/login' } // Все несуществующие маршруты ведут на вход
];