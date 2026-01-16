import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
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
import { MatOptionModule } from '@angular/material/core'; 
import { MatSelectModule } from '@angular/material/select'; 
import { EventVerificationDialogComponent } from '../event-verification/event-verification';

@Component({
  selector: 'app-comment-moderation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
    MatOptionModule, 
    MatSelectModule 
  ],
  templateUrl: `comment-moderation.html`,
  styleUrl: `comment-moderation.scss`,
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