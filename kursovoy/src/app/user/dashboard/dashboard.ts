import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: 'dashboard.html',
  styleUrls: ['dashboard.scss']
})
export class UserDashboardComponent implements OnInit {
  dashboardData: any;
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
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load dashboard:', error);
        this.isLoading = false;
      }
    });
  }
}