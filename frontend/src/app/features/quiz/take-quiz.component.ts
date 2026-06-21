import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuizService } from '../../core/services/quiz.service';
import { Exam, ExamSubmission } from '../../models/quiz.model';

@Component({
  selector: 'app-take-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="quiz-container animate-fade" *ngIf="!loading && exam">
      <!-- High-End Header -->
      <header class="quiz-header">
        <div class="header-left">
          <button (click)="exitQuiz()" class="btn-exit" style="background: var(--slate-50); border: none; padding: 0.8rem 1.5rem; border-radius: 12px; cursor: pointer;">
            <i class="fas fa-sign-out-alt"></i> Thoát
          </button>
          <div style="width: 1px; height: 30px; background: var(--slate-200); margin: 0 1rem;"></div>
          <div class="quiz-info">
            <h1 style="font-size: 1.5rem; margin: 0;">{{ exam.title }}</h1>
          </div>
        </div>
        
        <div class="header-right" style="display: flex; align-items: center; gap: 2rem;">
          <div class="timer-display" [class.urgent]="remainingTime < 300" 
               style="background: var(--slate-900); color: white; padding: 0.8rem 1.5rem; border-radius: 16px; font-weight: 800; font-family: monospace; font-size: 1.4rem; display: flex; align-items: center; gap: 0.8rem;">
            <i class="far fa-clock"></i>
            <span>{{ formatTime(remainingTime) }}</span>
          </div>
          <button (click)="submitExam()" class="btn-primary" style="padding: 0.8rem 2rem; border-radius: 16px;">
            Nộp bài ngay
          </button>
        </div>
      </header>

      <!-- Smooth Progress Bar -->
      <div style="height: 6px; background: var(--slate-200); width: 100%;">
        <div [style.width.%]="getProgress()" style="height: 100%; background: var(--bg-gradient); transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);"></div>
      </div>

      <main class="page-shell" style="display: grid; grid-template-columns: 1fr 350px; gap: 3rem; padding-top: 3rem;">
        <!-- Question Area -->
        <section class="question-column">
          <div class="question-card-premium">
            <!-- Question Header -->
            <div class="q-header">
              <div class="q-progress-label">
                <span class="q-badge">CÂU {{ currentQuestionIndex + 1 }} / {{ exam.questions?.length }}</span>
              </div>
              <button (click)="toggleFlag(currentQuestionIndex)"
                      [style.color]="isFlagged(currentQuestionIndex) ? '#f59e0b' : '#94a3b8'"
                      [style.background]="isFlagged(currentQuestionIndex) ? '#fffbeb' : 'white'"
                      style="border: 1px solid #e2e8f0; padding: 0.4rem 0.9rem; border-radius: 8px; font-size: 0.85rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.4rem; transition: all 0.2s;">
                <i class="fas fa-flag"></i> {{ isFlagged(currentQuestionIndex) ? 'Đã đánh dấu' : 'Đánh dấu' }}
              </button>
            </div>

            <!-- Question Text -->
            <div class="q-body">
              <h2 class="q-text">{{ exam.questions ? exam.questions[currentQuestionIndex].content : '' }}</h2>
              
              <!-- Answer Options -->
              <div class="options-stack">
                <div *ngFor="let answer of exam.questions ? exam.questions[currentQuestionIndex].answers : []; let i = index"
                     (click)="selectAnswer(exam.questions![currentQuestionIndex].id!, answer.id!)"
                     class="option-row"
                     [class.option-selected]="isAnswerSelected(exam.questions![currentQuestionIndex].id!, answer.id!)">
                  <div class="option-letter" [class.letter-selected]="isAnswerSelected(exam.questions![currentQuestionIndex].id!, answer.id!)">
                    {{ getOptionLabel(i) }}
                  </div>
                  <span class="option-text">{{ answer.answerContent }}</span>
                  <div class="option-check-icon" *ngIf="isAnswerSelected(exam.questions![currentQuestionIndex].id!, answer.id!)">
                    <i class="fas fa-check"></i>
                  </div>
                </div>
              </div>
            </div>

            <!-- Question Footer Navigation -->
            <div class="q-footer">
              <button (click)="previousQuestion()" [disabled]="currentQuestionIndex === 0"
                      class="nav-btn nav-prev">
                <i class="fas fa-chevron-left"></i> Trước
              </button>
              <div class="q-dots-mini">
                <span *ngFor="let q of exam.questions; let i = index"
                      [class.dot-current]="i === currentQuestionIndex"
                      [class.dot-answered]="isQuestionAnswered(i) && i !== currentQuestionIndex"
                      [class.dot-flagged]="isFlagged(i)"></span>
              </div>
              <button *ngIf="currentQuestionIndex < (exam.questions?.length || 0) - 1"
                      (click)="nextQuestion()" class="nav-btn nav-next">
                Tiếp theo <i class="fas fa-chevron-right"></i>
              </button>
              <button *ngIf="currentQuestionIndex === (exam.questions?.length || 1) - 1"
                      (click)="submitExam()" class="nav-btn nav-finish">
                <i class="fas fa-paper-plane"></i> Nộp bài
              </button>
            </div>
          </div>
        </section>

        <!-- Sidebar Navigation -->
        <aside>
          <div class="premium-card" style="padding: 2rem; border-radius: 30px;">
            <h3 style="font-size: 0.9rem; color: var(--slate-400); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2rem;">Navigation</h3>
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.8rem;">
              <button *ngFor="let q of exam.questions; let i = index" 
                      (click)="goToQuestion(i)"
                      [style.background]="i === currentQuestionIndex ? 'var(--primary)' : (isQuestionAnswered(i) ? 'var(--slate-900)' : 'var(--slate-50)')"
                      [style.color]="(i === currentQuestionIndex || isQuestionAnswered(i)) ? 'white' : 'var(--slate-400)'"
                      style="height: 45px; border-radius: 12px; border: none; font-weight: 800; cursor: pointer;">
                {{ i + 1 }}
              </button>
            </div>
          </div>
          
          <div class="premium-card" style="margin-top: 2rem; background: var(--bg-gradient); color: white; border: none; border-radius: 30px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
              <span style="opacity: 0.8; font-weight: 600;">Progress</span>
              <span style="font-weight: 900;">{{ getAnsweredCount() }}/{{ exam.questions?.length }}</span>
            </div>
            <div style="height: 8px; background: rgba(255,255,255,0.2); border-radius: 10px; overflow: hidden;">
              <div [style.width.%]="(getAnsweredCount() / (exam.questions?.length || 1)) * 100" style="height: 100%; background: white;"></div>
            </div>
          </div>
        </aside>
      </main>
    </div>

    <!-- LOADING STATE -->
    <div class="quiz-fullscreen-loading" *ngIf="loading">
      <div class="spinner-box">
        <div class="spinner"></div>
        <h2>Vui lòng đợi</h2>
        <p>Hệ thống đang chuẩn bị đề thi của bạn...</p>
      </div>
    </div>

    <!-- EMPTY STATE -->
    <div class="quiz-fullscreen-error" *ngIf="!loading && !exam">
      <div class="error-box">
        <i class="fas fa-exclamation-triangle"></i>
        <h2>Không tìm thấy đề thi</h2>
        <p>Giao diện này hiện không thể tải được bài thi. Vui lòng quay lại.</p>
        <button (click)="exitQuiz()" class="btn-nav primary">Quay lại</button>
      </div>
    </div>
  `,
  styles: [`
    .quiz-container {
      min-height: 100vh;
      background: #f1f5f9;
      display: flex;
      flex-direction: column;
    }

    .quiz-header {
      background: white;
      height: 70px;
      padding: 0 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      z-index: 10;
    }

    .header-left, .header-right { display: flex; align-items: center; gap: 1.5rem; }
    
    .btn-exit {
      background: none; border: none; font-weight: 700; color: #64748b;
      cursor: pointer; display: flex; align-items: center; gap: 0.5rem;
      padding: 0.5rem 1rem; border-radius: 10px; transition: 0.2s;
    }
    .btn-exit:hover { background: #f1f5f9; color: #1e293b; }

    /* --- Premium Question Card --- */
    .question-card-premium {
      background: white;
      border-radius: 28px;
      box-shadow: 0 20px 60px -10px rgba(99, 102, 241, 0.12), 0 4px 12px rgba(0,0,0,0.04);
      border: 1px solid #e8eaf6;
      overflow: hidden;
    }

    .q-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 2.5rem;
      background: linear-gradient(135deg, #f8f9ff, #f0f4ff);
      border-bottom: 1px solid #e8eaf6;
    }

    .q-badge {
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: #6366f1;
      text-transform: uppercase;
      background: #ede9fe;
      padding: 0.3rem 0.9rem;
      border-radius: 20px;
    }

    .q-body {
      padding: 2.5rem 3rem 2rem;
    }

    .q-text {
      font-size: 1.45rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.5;
      margin-bottom: 2rem;
    }

    .options-stack {
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
    }

    .option-row {
      display: flex;
      align-items: center;
      gap: 1.2rem;
      padding: 1.1rem 1.5rem;
      border-radius: 16px;
      border: 2px solid #f1f5f9;
      background: #f8fafc;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .option-row:hover {
      border-color: #c7d2fe;
      background: #eef2ff;
      transform: translateX(4px);
    }

    .option-row.option-selected {
      border-color: #6366f1;
      background: linear-gradient(135deg, #eef2ff, #f5f3ff);
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.15);
    }

    .option-letter {
      flex-shrink: 0;
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: white;
      border: 1.5px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 0.95rem;
      color: #64748b;
      transition: all 0.2s;
    }

    .option-letter.letter-selected {
      background: #6366f1;
      color: white;
      border-color: #6366f1;
      box-shadow: 0 4px 10px rgba(99, 102, 241, 0.4);
    }

    .option-text {
      flex: 1;
      font-size: 1rem;
      font-weight: 600;
      color: #334155;
      line-height: 1.4;
    }

    .option-selected .option-text {
      color: #4338ca;
    }

    .option-check-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #6366f1;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
      animation: popIn 0.2s ease;
    }

    @keyframes popIn {
      from { transform: scale(0.5); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .q-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2.5rem;
      border-top: 1px solid #f1f5f9;
      background: #fafbff;
    }

    .q-dots-mini {
      display: flex;
      gap: 5px;
      align-items: center;
    }

    .q-dots-mini span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #e2e8f0;
      transition: all 0.2s;
    }

    .q-dots-mini span.dot-current {
      width: 22px;
      border-radius: 6px;
      background: #6366f1;
    }

    .q-dots-mini span.dot-answered {
      background: #a5b4fc;
    }

    .q-dots-mini span.dot-flagged {
      background: #f59e0b;
    }

    .nav-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.5rem;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      border: 1.5px solid #e2e8f0;
      background: white;
      color: #475569;
      transition: all 0.2s;
    }

    .nav-btn:hover:not(:disabled) { border-color: #6366f1; color: #6366f1; }
    .nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .nav-next {
      background: #6366f1;
      color: white;
      border-color: #6366f1;
    }
    .nav-next:hover { background: #4f46e5 !important; color: white !important; }

    .nav-finish {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      border-color: #10b981;
    }
    .nav-finish:hover { opacity: 0.9; color: white !important; }

    .quiz-fullscreen-loading { position: fixed; inset: 0; background: white; z-index: 100; display: flex; align-items: center; justify-content: center; text-align: center; }
    .spinner-box h2 { margin-top: 1.5rem; font-weight: 800; color: #1e293b; }

    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class TakeQuizComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private quizService = inject(QuizService);
  private cdr = inject(ChangeDetectorRef);

  exam?: Exam;
  currentQuestionIndex = 0;
  answers: { questionId: number; selectedAnswerId: number }[] = [];
  flaggedQuestions: Set<number> = new Set();
  remainingTime = 0;
  timerInterval: any;
  loading: boolean = true;

  ngOnInit() {
    window.scrollTo(0, 0);
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.quizService.getExamWithQuestions(id).subscribe({
      next: (data) => {
        this.exam = data;
        this.remainingTime = data.duration * 60;
        this.startTimer();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => this.loading = false
    });
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.remainingTime--;
      if (this.remainingTime <= 0) {
        this.submitExam(true); // Auto-submit
      }
      this.cdr.detectChanges();
    }, 1000);
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }

  selectAnswer(questionId: number, answerId: number) {
    const index = this.answers.findIndex(a => a.questionId === questionId);
    if (index > -1) {
      if (this.answers[index].selectedAnswerId === answerId) {
        // Toggle off if clicking the same one (optional, but real sites usually keep it)
        // this.answers.splice(index, 1);
      } else {
        this.answers[index].selectedAnswerId = answerId;
      }
    } else {
      this.answers.push({ questionId, selectedAnswerId: answerId });
    }
    this.cdr.detectChanges();
  }

  isAnswerSelected(questionId: number, answerId: number): boolean {
    return this.answers.some(a => a.questionId === questionId && a.selectedAnswerId === answerId);
  }

  isQuestionAnswered(index: number): boolean {
    if (!this.exam || !this.exam.questions) return false;
    const qId = this.exam.questions[index].id;
    return this.answers.some(a => a.questionId === qId);
  }

  getAnsweredCount(): number {
    return this.answers.length;
  }

  getProgress(): number {
    if (!this.exam || !this.exam.questions?.length) return 0;
    return (this.currentQuestionIndex + 1) / this.exam.questions.length * 100;
  }

  toggleFlag(index: number) {
    if (this.flaggedQuestions.has(index)) {
      this.flaggedQuestions.delete(index);
    } else {
      this.flaggedQuestions.add(index);
    }
  }

  isFlagged(index: number): boolean {
    return this.flaggedQuestions.has(index);
  }

  nextQuestion() {
    if (this.exam && this.currentQuestionIndex < (this.exam.questions?.length ?? 0) - 1) {
      this.currentQuestionIndex++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToQuestion(index: number) {
    this.currentQuestionIndex = index;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  exitQuiz() {
    if (confirm('Bạn có chắc chắn muốn thoát khỏi bài thi? Kết quả của bạn sẽ không được lưu lại.')) {
      this.router.navigate(['/quiz']);
    }
  }

  submitExam(force: boolean = false) {
    if (!this.exam) return;
    
    if (force || confirm('Bạn có chắc chắn muốn nộp bài thi?')) {
      const submission: ExamSubmission = {
        examId: this.exam.id!,
        answers: this.answers
      };
      this.quizService.submitExam(submission).subscribe(result => {
        // Store for review
        this.quizService.lastResult = result;
        this.quizService.lastExam = this.exam;
        this.quizService.lastUserAnswers = this.answers;
        
        const id = result.attemptId || 'guest';
        this.router.navigate(['/quiz/result', id]);
      });
    }
  }
}
