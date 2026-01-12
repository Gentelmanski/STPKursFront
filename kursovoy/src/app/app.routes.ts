// app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth-guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./main-map/main-map').then(m => m.MainMapComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'login', 
    loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent)
  },
  { 
    path: 'register', 
    loadComponent: () => import('./auth/register/register').then(m => m.RegisterComponent)
  },
  { 
    path: 'profile', 
    loadComponent: () => import('./user/dashboard/dashboard').then(m => m.UserDashboardComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'user/dashboard', 
    loadComponent: () => import('./user/dashboard/dashboard').then(m => m.UserDashboardComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'admin/dashboard', 
    loadComponent: () => import('./admin/dashboard/dashboard').then(m => m.AdminDashboardComponent),
    canActivate: [AuthGuard],
    data: { role: 'admin' }
  },
  { path: '**', redirectTo: '' }
];