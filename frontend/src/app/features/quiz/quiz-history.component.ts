import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { QuizService } from '../../core/services/quiz.service';
import { ExamResult } from '../../models/quiz.model';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-quiz-history',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-shell animate-fade">
      <div class="page-header">
        <h1>Lịch sử thi của tôi</h1>
        <p>Xem lại các lượt thi và điểm số đã đạt được.</p>
      </div>

      <!-- Loading state -->
      <div class="table-card" *ngIf="loading">
        <div class="loading-row">
          <div class="spinner"></div>
          <span>Đang tải lịch sử...</span>
        </div>
      </div>

      <div *ngIf="error && !loading" class="animate-fade" style="background: white; border-radius: 24px; padding: 5rem 2rem; text-align: center; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; margin-top: 2rem;">
        <div style="width: 100px; height: 100px; border-radius: 50%; background: #f1f5f9; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; font-size: 3rem;">🔐</div>
        <h2 style="font-size: 1.75rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">Bạn chưa đăng nhập</h2>
        <p style="color: #64748b; font-size: 1.1rem; max-width: 400px; margin: 0 auto 2.5rem; line-height: 1.6;">
          Rất tiếc, bạn cần có tài khoản để lưu trữ và xem lại lịch sử các bài thi đã thực hiện.
        </p>
        <button (click)="goToLogin()" class="btn-primary-premium" style="padding: 1rem 3rem; font-size: 1.1rem;">
          <i class="fas fa-sign-in-alt" style="margin-right: 0.75rem;"></i> Đăng nhập ngay
        </button>
      </div>

      <!-- Data table -->
      <div class="table-card" *ngIf="!loading && !error">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Tên đề thi</th>
              <th>Ngày thi</th>
              <th>Điểm số</th>
              <th>Đúng/Sai</th>
              <th>Kết quả</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let h of history; let i = index" class="table-row-animate">
              <td><span class="row-num">{{ i + 1 }}</span></td>
              <td><strong>{{ h.examTitle }}</strong></td>
              <td>{{ h.submitTime | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>
                <span class="score-pill" [ngClass]="getScoreClass(h.score)">{{ h.score | number:'1.1-1' }}/10</span>
              </td>
              <td><span class="correct-count">{{ h.totalCorrect }}</span> đúng / <span class="wrong-count">{{ h.totalWrong }}</span> sai</td>
              <td>
                <span *ngIf="h.score >= 5" class="status-badge published">Đạt</span>
                <span *ngIf="h.score < 5" class="status-badge closed">Chưa đạt</span>
              </td>
              <td class="right">
                <button [routerLink]="['/quiz/result', h.attemptId]" class="link-button">Chi tiết</button>
              </td>
            </tr>
            <tr *ngIf="history.length === 0">
              <td colspan="7" class="empty-cell">
                <div class="empty-state-inner">
                  <i class="fas fa-history"></i>
                  <p>Không tìm thấy lịch sử thi. Hãy bắt đầu bài thi đầu tiên ngay hôm nay!</p>
                  <a routerLink="/quiz" class="btn-start">Làm bài thi ngay</a>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .loading-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 3rem;
      color: #64748b;
      font-size: 1rem;
    }
    .spinner {
      width: 28px;
      height: 28px;
      border: 3px solid #e2e8f0;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .error-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 2rem;
      color: #ef4444;
    }
    .error-row i { font-size: 1.5rem; }

    .row-num {
      display: inline-flex;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #f1f5f9;
      color: #64748b;
      font-size: 0.8rem;
      font-weight: 700;
      align-items: center;
      justify-content: center;
    }
    .correct-count { color: #10b981; font-weight: 700; }
    .wrong-count { color: #ef4444; font-weight: 700; }

    .score-pill {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-weight: 700;
      font-size: 0.9rem;
    }
    .score-pill.success { background: #d1fae5; color: #047857; }
    .score-pill.warning { background: #fef3c7; color: #b45309; }
    .score-pill.danger  { background: #fee2e2; color: #b91c1c; }

    .table-row-animate {
      animation: rowIn 0.3s ease;
    }
    @keyframes rowIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .empty-state-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 2rem 0;
      color: #94a3b8;
    }
    .empty-state-inner i { font-size: 2.5rem; color: #cbd5e1; }
    .empty-state-inner p { margin: 0; font-size: 1rem; }
    .btn-start {
      display: inline-block;
      margin-top: 0.5rem;
      padding: 0.5rem 1.5rem;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      transition: opacity 0.2s;
    }
    .btn-start:hover { opacity: 0.9; }
    .btn-start:hover { opacity: 0.9; }

    .btn-primary-premium {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
    }
    .btn-primary-premium:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
    }
  `]
})
export class QuizHistoryComponent implements OnInit, OnDestroy {
  private quizService = inject(QuizService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private routerSub?: Subscription;

  history: ExamResult[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit() {
    // Load data immediately
    this.loadHistory();

    // Also reload every time we navigate back to this page (e.g. from quiz result)
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        if (e.urlAfterRedirects === '/quiz/history' || e.url === '/quiz/history') {
          this.loadHistory();
        }
      });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  loadHistory() {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      this.error = 'AUTH_REQUIRED';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.error = null;
    this.quizService.getHistory().subscribe({
      next: (data) => {
        this.history = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load history:', err);
        if (err.status === 401 || err.status === 403) {
          this.error = 'AUTH_REQUIRED';
        } else {
          this.error = 'Không thể tải lịch sử. Vui lòng thử lại.';
        }
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login'], { queryParams: { returnUrl: '/quiz/history' } });
  }

  getScoreClass(score: number): string {
    if (score >= 8) return 'success';
    if (score >= 5) return 'warning';
    return 'danger';
  }
}
