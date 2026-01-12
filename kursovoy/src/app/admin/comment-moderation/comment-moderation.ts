import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormControl } from '@angular/forms'; // Добавьте этот импорт

// Angular Material imports
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatOptionModule } from '@angular/material/core'; // Добавьте этот импорт
import { MatSelectModule } from '@angular/material/select'; // Добавьте этот импорт

// Компонент диалога
import { EventVerificationDialogComponent } from '../event-verification/event-verification';

@Component({
  selector: 'app-comment-moderation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // Добавьте этот модуль
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatTooltipModule,
    MatOptionModule, // Добавьте этот модуль
    MatSelectModule // Добавьте этот модуль
  ],
  template: `
    <div class="comment-moderation">
      <div class="header">
        <h2>Модерация комментариев</h2>
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Поиск комментариев</mat-label>
          <input matInput [formControl]="searchControl" placeholder="Поиск по содержанию или автору...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>
      
      <mat-card>
        <div class="table-container">
          <table mat-table [dataSource]="dataSource" matSort class="comment-table">
            
            <!-- ID Column -->
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
              <td mat-cell *matCellDef="let comment">{{comment.id}}</td>
            </ng-container>
            
            <!-- Содержание Column -->
            <ng-container matColumnDef="content">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Содержание</th>
              <td mat-cell *matCellDef="let comment">
                <div class="comment-content">
                  {{comment.content | slice:0:100}}{{comment.content.length > 100 ? '...' : ''}}
                  <div class="comment-meta">
                    <span class="event-info">
                      <mat-icon>event</mat-icon>
                      {{comment.event_title || 'Мероприятие #' + comment.event_id}}
                    </span>
                  </div>
                </div>
              </td>
            </ng-container>
            
            <!-- Автор Column -->
            <ng-container matColumnDef="author">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Автор</th>
              <td mat-cell *matCellDef="let comment">
                <div class="author-info">
                  <div>{{comment.user?.username || 'Аноним'}}</div>
                  <div class="author-email">{{comment.user?.email || ''}}</div>
                </div>
              </td>
            </ng-container>
            
            <!-- Дата Column -->
            <ng-container matColumnDef="created_at">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Дата</th>
              <td mat-cell *matCellDef="let comment">{{formatDate(comment.created_at)}}</td>
            </ng-container>
            
            <!-- Рейтинг Column -->
            <ng-container matColumnDef="score">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Рейтинг</th>
              <td mat-cell *matCellDef="let comment">
                <mat-chip [color]="comment.score > 0 ? 'primary' : comment.score < 0 ? 'warn' : ''">
                  {{comment.score}}
                </mat-chip>
              </td>
            </ng-container>
            
            <!-- Статус Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Статус</th>
              <td mat-cell *matCellDef="let comment">
                <mat-chip [color]="comment.is_deleted ? 'warn' : 'accent'" selected>
                  {{comment.is_deleted ? 'Удален' : 'Активен'}}
                </mat-chip>
              </td>
            </ng-container>
            
            <!-- Действия Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Действия</th>
              <td mat-cell *matCellDef="let comment">
                <div class="action-buttons">
                  <button mat-icon-button color="primary" 
                          (click)="viewCommentDetails(comment)"
                          matTooltip="Просмотреть">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" 
                          (click)="deleteComment(comment)"
                          *ngIf="!comment.is_deleted"
                          matTooltip="Удалить">
                    <mat-icon>delete</mat-icon>
                  </button>
                  <button mat-icon-button color="primary" 
                          (click)="restoreComment(comment)"
                          *ngIf="comment.is_deleted"
                          matTooltip="Восстановить">
                    <mat-icon>restore</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>
            
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            
            <!-- Сообщение о пустой таблице -->
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" colspan="7">
                <div class="no-data-message">
                  <mat-icon>comment</mat-icon>
                  <p>Нет комментариев для модерации</p>
                </div>
              </td>
            </tr>
          </table>
        </div>
        
        <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" 
                      showFirstLastButtons
                      aria-label="Select page of comments">
        </mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .comment-moderation {
      padding: 16px 0;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
    }
    
    .search-field {
      width: 300px;
    }
    
    .table-container {
      overflow-x: auto;
      border-radius: 4px;
      border: 1px solid #e0e0e0;
    }
    
    .comment-table {
      width: 100%;
    }
    
    .comment-table th {
      background-color: #f5f5f5;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.87);
    }
    
    .comment-content {
      max-width: 300px;
    }
    
    .comment-meta {
      margin-top: 4px;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
    }
    
    .event-info {
      display: inline-flex;
      align-items: center;
    }
    
    .event-info mat-icon {
      font-size: 14px;
      height: 14px;
      width: 14px;
      margin-right: 4px;
    }
    
    .author-info {
      font-size: 14px;
    }
    
    .author-email {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .action-buttons {
      display: flex;
      gap: 4px;
    }
    
    .no-data-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      color: rgba(0, 0, 0, 0.54);
    }
    
    .no-data-message mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
    }
    
    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
      
      .search-field {
        width: 100%;
      }
    }
  `]
})
export class CommentModerationComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns = ['id', 'content', 'author', 'created_at', 'score', 'status', 'actions'];
  searchControl = new FormControl('');
  isLoading = false;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadComments();
    
    this.searchControl.valueChanges.subscribe(value => {
      this.dataSource.filter = value?.trim().toLowerCase() || '';
    });
  }

  loadComments(): void {
    this.isLoading = true;
    
    // Загрузка комментариев для модерации
    // Нужен соответствующий эндпоинт на бэкенде
    this.http.get<any[]>('http://localhost:8080/api/admin/comments').subscribe({
      next: (comments) => {
        this.dataSource.data = comments;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Ошибка загрузки комментариев:', error);
        this.isLoading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  viewCommentDetails(comment: any): void {
    // Открыть диалог с деталями комментария
    this.dialog.open(EventVerificationDialogComponent, {
      width: '500px',
      data: { 
        action: 'viewComment',
        comment: comment
      }
    });
  }

  deleteComment(comment: any): void {
    if (confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      this.http.delete(`http://localhost:8080/api/admin/comments/${comment.id}`).subscribe({
        next: () => {
          this.snackBar.open('Комментарий удален', 'OK', { duration: 3000 });
          this.loadComments();
        },
        error: (error) => {
          this.snackBar.open('Ошибка при удалении комментария', 'Ошибка', { duration: 3000 });
        }
      });
    }
  }

  restoreComment(comment: any): void {
    // Эндпоинт для восстановления комментария
    // Нужно реализовать на бэкенде
    this.http.put(`http://localhost:8080/api/admin/comments/${comment.id}/restore`, {}).subscribe({
      next: () => {
        this.snackBar.open('Комментарий восстановлен', 'OK', { duration: 3000 });
        this.loadComments();
      },
      error: (error) => {
        this.snackBar.open('Ошибка при восстановлении комментария', 'Ошибка', { duration: 3000 });
      }
    });
  }
}