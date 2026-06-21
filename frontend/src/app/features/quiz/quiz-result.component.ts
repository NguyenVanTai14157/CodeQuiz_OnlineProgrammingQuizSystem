import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { QuizService } from '../../core/services/quiz.service';
import { ExamResult, Exam, Question } from '../../models/quiz.model';

@Component({
  selector: 'app-quiz-result',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="result-page animate-fade" *ngIf="result">
      
      <!-- SCORE OVERVIEW (Default View) -->
      <div class="result-hero-section" *ngIf="!showReview">
        <div class="score-card premium-card animate-slide-up">
          <div class="score-header">
            <div class="icon-circle" [ngClass]="getScoreClass()">
              <i class="fas" [ngClass]="getScoreIcon()"></i>
            </div>
            <h2>{{ getScoreMessage() }}</h2>
            <p>{{ result.examTitle }}</p>
          </div>
          
          <div class="score-body">
            <div class="score-huge">
              <span class="number" [ngClass]="getScoreClass()">{{ result.totalCorrect }}</span>
              <span class="max">/ {{ getTotalQuestions() }}</span>
            </div>
            <p style="font-size: 1.2rem; font-weight: bold; color: #475569; margin-top: -10px; margin-bottom: 20px;">
              Điểm số: {{ result.score | number:'1.1-1' }} / 10
            </p>

            <div class="stats-grid">
              <div class="stat-box">
                <i class="fas fa-check-circle" style="color: #10b981;"></i>
                <div class="stat-info">
                  <span class="stat-val">{{ result.totalCorrect }}</span>
                  <span class="stat-label">Câu đúng</span>
                </div>
              </div>
              <div class="stat-box">
                <i class="fas fa-times-circle" style="color: #ef4444;"></i>
                <div class="stat-info">
                  <span class="stat-val">{{ result.totalWrong }}</span>
                  <span class="stat-label">Câu sai</span>
                </div>
              </div>
            </div>
          </div>

          <div class="score-actions">
            <button class="btn-premium btn-primary full-width" (click)="toggleReview()">
              <i class="fas fa-search"></i> Xem lại bài làm
            </button>
            <div class="action-row">
              <button routerLink="/quiz" class="btn-premium flex-1" style="background: #f1f5f9; color: #475569;">
                Thi bài khác
              </button>
              <button routerLink="/quiz/history" class="btn-premium flex-1" style="background: #f1f5f9; color: #475569;">
                Lịch sử của tôi
              </button>
            </div>
            <p class="guest-notice" *ngIf="isGuest">
              *Bạn chưa đăng nhập. Kết quả này sẽ không được lưu vào lịch sử.
            </p>
          </div>
        </div>
      </div>

      <!-- REVIEW MODE -->
      <div class="review-section animate-fade" *ngIf="showReview">
        <header class="review-header">
          <div class="review-header-inner">
            <button class="btn-back" (click)="toggleReview()">
              <i class="fas fa-arrow-left"></i> Đóng xem lại
            </button>
            <div class="review-meta">
              <h3>Xem lại: {{ result.examTitle }}</h3>
              <span class="badge" [ngClass]="getScoreClass()">Điểm: {{ result.score | number:'1.1-1' }}/10</span>
            </div>
          </div>
        </header>

        <div class="review-container" *ngIf="exam && userAnswers">
          <div class="q-list">
            <div class="q-card premium-card" *ngFor="let q of exam.questions; let i = index">
              <div class="q-card-header">
                <span class="q-num">Câu hỏi {{ i + 1 }}</span>
                <span class="q-result-badge" [class.correct]="isCorrectlyAnswered(q)" [class.wrong]="!isCorrectlyAnswered(q)">
                  <i class="fas" [ngClass]="isCorrectlyAnswered(q) ? 'fa-check' : 'fa-times'"></i>
                  {{ isCorrectlyAnswered(q) ? 'Đúng' : 'Sai' }}
                </span>
              </div>
              
              <h3 class="q-text">{{ q.content }}</h3>

              <div class="options-list">
                <div class="opt-item" *ngFor="let ans of q.answers; let j = index" 
                     [ngClass]="getOptionReviewClass(q, ans.id!)">
                  <div class="opt-letter">{{ getOptionLetter(j) }}</div>
                  <div class="opt-text">{{ ans.answerContent }}</div>
                  
                  <div class="opt-indicator">
                    <span class="badge-your-ans" *ngIf="isUserAnswer(q.id!, ans.id!)">Bạn chọn</span>
                    <i class="fas fa-check-circle correct-icon" *ngIf="ans.isCorrect"></i>
                    <i class="fas fa-times-circle wrong-icon" *ngIf="isUserAnswer(q.id!, ans.id!) && !ans.isCorrect"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="empty-state" *ngIf="!(exam && userAnswers)">
          Dữ liệu bài làm không còn khả dụng để xem lại do phiên đã hết hạn.
        </div>
      </div>

    </div>
  `,
  styles: [`
    .result-page { min-height: calc(100vh - 80px); background: #f8fafc; padding: 3rem 0; }
    
    .result-hero-section { display: flex; justify-content: center; align-items: center; }
    .score-card { max-width: 500px; width: 100%; text-align: center; overflow: hidden; padding: 0 !important; }
    
    .score-header { padding: 3rem 2rem 2rem; background: #f8fafc; border-bottom: 1px solid #f1f5f9; display: flex; flex-direction: column; align-items: center; }
    .icon-circle { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin-bottom: 1.5rem; color: white; }
    .icon-circle.success { background: #10b981; box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4); }
    .icon-circle.warning { background: #f59e0b; box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.4); }
    .icon-circle.danger { background: #ef4444; box-shadow: 0 10px 25px -5px rgba(239, 68, 68, 0.4); }
    
    .score-header h2 { font-size: 1.8rem; font-weight: 800; color: #1e293b; margin-bottom: 0.5rem; }
    .score-header p { color: #64748b; font-size: 1.1rem; }

    .score-body { padding: 3rem 3rem 2rem; }
    .score-huge { margin-bottom: 2.5rem; }
    .score-huge .number { font-size: 5rem; font-weight: 900; line-height: 1; letter-spacing: -2px; }
    .score-huge .number.success { color: #10b981; }
    .score-huge .number.warning { color: #f59e0b; }
    .score-huge .number.danger { color: #ef4444; }
    .score-huge .max { font-size: 1.5rem; color: #94a3b8; font-weight: 700; margin-left: 0.5rem; }

    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .stat-box { background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 16px; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; text-align: left; }
    .stat-box i { font-size: 2rem; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-val { font-size: 1.4rem; font-weight: 800; color: #1e293b; }
    .stat-label { font-size: 0.85rem; color: #64748b; font-weight: 600; text-transform: uppercase; }

    .score-actions { padding: 0 3rem 3rem; display: flex; flex-direction: column; gap: 1rem; }
    .action-row { display: flex; gap: 1rem; }
    .guest-notice { font-size: 0.85rem; color: #f59e0b; font-weight: 500; margin-top: 0.5rem; }

    /* REVIEW MODE STYLES */
    .review-section { padding-bottom: 5rem; }
    .review-header { background: white; padding: 1rem 0; box-shadow: 0 2px 10px rgba(0,0,0,0.05); position: sticky; top: 0; z-index: 10; margin-bottom: 3rem; }
    .review-header-inner { width: min(1000px, calc(100% - 4rem)); margin: 0 auto; display: flex; align-items: center; gap: 2rem; }
    
    .btn-back { background: #f1f5f9; border: none; padding: 0.6rem 1.2rem; border-radius: 10px; font-weight: 700; color: #475569; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 0.5rem; }
    .btn-back:hover { background: #e2e8f0; }

    .review-meta h3 { margin: 0; font-size: 1.2rem; font-weight: 800; color: #1e293b; margin-bottom: 0.2rem; }
    .badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
    .badge.success { background: #d1fae5; color: #047857; }
    .badge.warning { background: #fef3c7; color: #b45309; }
    .badge.danger { background: #fee2e2; color: #b91c1c; }

    .review-container { width: min(800px, calc(100% - 4rem)); margin: 0 auto; }
    .q-list { display: flex; flex-direction: column; gap: 2rem; }
    
    .q-card { padding: 2.5rem !important; border-top: 0 !important;   }
    .q-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #f1f5f9; }
    .q-num { font-weight: 800; color: #64748b; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.05em; }
    .q-result-badge { display: flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; font-weight: 700; }
    .q-result-badge.correct { background: #d1fae5; color: #059669; }
    .q-result-badge.wrong { background: #fee2e2; color: #dc2626; }
    
    .q-text { font-size: 1.3rem; font-weight: 700; color: #0f172a; margin-bottom: 2rem; line-height: 1.5; }

    .options-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .opt-item { display: flex; align-items: center; padding: 1rem 1.5rem; border-radius: 12px; border: 2px solid #f1f5f9; background: white; gap: 1rem; }
    .opt-letter { width: 32px; height: 32px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #64748b; }
    .opt-text { flex: 1; font-weight: 600; color: #334155; }
    
    /* Option States */
    .opt-item.is-correct { border-color: #10b981; background: #ecfdf5; }
    .opt-item.is-correct .opt-letter { background: #10b981; color: white; border-color: #10b981; }
    
    .opt-item.is-wrong { border-color: #ef4444; background: #fef2f2; }
    .opt-item.is-wrong .opt-letter { background: #ef4444; color: white; border-color: #ef4444; }

    .opt-item.not-selected-correct { border-color: #6ee7b7; border-style: dashed; }

    .opt-indicator { display: flex; align-items: center; gap: 0.75rem; }
    .badge-your-ans { font-size: 0.7rem; font-weight: 800; background: #e2e8f0; color: #475569; padding: 0.2rem 0.5rem; border-radius: 4px; text-transform: uppercase; }
    .correct-icon { color: #10b981; font-size: 1.25rem; }
    .wrong-icon { color: #ef4444; font-size: 1.25rem; }
  `]
})
export class QuizResultComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private quizService = inject(QuizService);
  private router = inject(Router);

  result?: ExamResult;
  exam?: Exam;
  userAnswers: any[] = [];
  
  isGuest = false;
  showReview = false;

  ngOnInit() {
    window.scrollTo(0, 0);
    const idParam = this.route.snapshot.paramMap.get('id');
    
    if (idParam === 'guest') {
      this.isGuest = true;
      this.loadFromServiceCache();
    } else {
      const attemptId = Number(idParam);
      // Even if logged in, we might just use cache if it matches, 
      // because history fetching might not include full exam details easily without another API call.
      if (this.quizService.lastResult && this.quizService.lastResult.attemptId === attemptId) {
        this.loadFromServiceCache();
      } else {
        // Fallback to fetching history if User refreshed the page
        this.quizService.getHistory().subscribe(history => {
            const found = history.find(h => h.attemptId === attemptId);
            if (found) {
              this.result = found;
              // Note: Cannot do full review without fetching full exam + user answers from DB
              // In a complete app, we'd call a dedicated endpoint like getReviewData(attemptId)
            }
        });
      }
    }
  }

  loadFromServiceCache() {
    this.result = this.quizService.lastResult;
    this.exam = this.quizService.lastExam;
    this.userAnswers = this.quizService.lastUserAnswers;
    if (!this.result) {
      // No cache found, go back
      this.router.navigate(['/quiz']);
    }
  }

  getScoreClass(): string {
    if (!this.result) return '';
    if (this.result.score >= 8) return 'success';
    if (this.result.score >= 5) return 'warning';
    return 'danger';
  }

  getTotalQuestions(): number {
    if (this.result && this.result.totalQuestions) return this.result.totalQuestions;
    if (this.exam) return this.exam.totalQuestions;
    if (this.result) return this.result.totalCorrect + this.result.totalWrong;
    return 0;
  }

  getScoreIcon(): string {
    if (!this.result) return '';
    if (this.result.score >= 8) return 'fa-trophy';
    if (this.result.score >= 5) return 'fa-thumbs-up';
    return 'fa-exclamation-triangle';
  }

  getScoreMessage(): string {
    if (!this.result) return '';
    if (this.result.score == 10) return 'Xuất sắc!';
    if (this.result.score >= 8) return 'Rất tốt!';
    if (this.result.score >= 5) return 'Hoàn thành!';
    return 'Cần cố gắng hơn!';
  }

  toggleReview() {
    this.showReview = !this.showReview;
    if (this.showReview) {
      window.scrollTo(0, 0);
    }
  }

  // Review Logic
  getOptionLetter(index: number) {
    return String.fromCharCode(65 + index);
  }

  isUserAnswer(questionId: number, answerId: number): boolean {
    return this.userAnswers.some(a => a.questionId === questionId && a.selectedAnswerId === answerId);
  }

  isCorrectlyAnswered(q: Question): boolean {
    const userAns = this.userAnswers.find(a => a.questionId === q.id);
    if (!userAns) return false;
    const correctAns = q.answers.find(a => a.isCorrect);
    return !!(correctAns && correctAns.id === userAns.selectedAnswerId);
  }

  getOptionReviewClass(q: Question, answerId: number): string {
    const isSelected = this.isUserAnswer(q.id!, answerId);
    const isActuallyCorrect = !!q.answers.find(a => a.id === answerId)?.isCorrect;

    if (isSelected && isActuallyCorrect) return 'is-correct';
    if (isSelected && !isActuallyCorrect) return 'is-wrong';
    if (!isSelected && isActuallyCorrect) return 'not-selected-correct';
    
    return '';
  }
}
