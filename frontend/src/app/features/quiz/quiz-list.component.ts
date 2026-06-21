import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuizService } from '../../core/services/quiz.service';
import { Exam, Subject } from '../../models/quiz.model';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page-shell animate-fade">
      <div class="page-header">
        <div class="header-content">
          <h1>Danh sách đề thi</h1>
          <p>Chọn một đề thi đã công bố và bắt đầu luyện tập với các câu hỏi thực tế từ cơ sở dữ liệu.</p>
        </div>
        <div class="filter-box">
          <select class="form-control" [(ngModel)]="selectedSubjectId" (change)="filterBySubject()">
            <option [value]="0">Tất cả môn học</option>
            <option *ngFor="let s of subjects" [value]="s.id">{{ s.subjectName }}</option>
          </select>
        </div>
      </div>

      <div *ngIf="loading" class="loading-spinner">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <div class="card-grid" *ngIf="!loading">
        <div *ngFor="let exam of filteredExams" 
             [routerLink]="['/quiz/take', exam.id]" 
             class="exam-card clickable">
          <div class="card-body">
            <div class="card-kicker">{{ exam.status }}</div>
            <h3>{{ exam.title }}</h3>
            <p>{{ exam.description }}</p>
            
            <div class="meta-row">
              <span><i class="time-icon"></i> {{ exam.duration }} phút</span>
              <span><i class="count-icon"></i> {{ exam.totalQuestions }} câu hỏi</span>
            </div>

            <button class="btn-primary full-width">
              Bắt đầu thi
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && filteredExams.length === 0" class="empty-state">
        Hiện tại chưa có đề thi nào cho bộ lọc này.
      </div>
    `,
  styles: [`
    .page-shell { padding-top: 2rem; padding-bottom: 4rem; }
    .page-header { margin-bottom: 3rem; }
    .header-content h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 0.5rem; color: #0f172a; }
    .header-content p { color: #64748b; font-size: 1.1rem; }
    
    .filter-box { margin-top: 1.5rem; max-width: 400px; }
    .form-control { 
      width: 100%; padding: 0.75rem 1rem; border-radius: 12px; 
      border: 1px solid #e2e8f0; background: white; 
      font-size: 1rem; color: #1e293b;
    }

    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
    }

    .exam-card {
      background: white;
      border-radius: 24px;
      border: 1px solid #e2e8f0;
      padding: 0; /* Override global styles.css padding */
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      height: 100%;
      cursor: pointer;
    }

    .exam-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.08);
      border-color: #6366f1;
    }

    .card-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .card-kicker {
      color: #6366f1;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 0.75rem;
    }

    .exam-card h3 {
      font-size: 1.35rem;
      font-weight: 700;
      margin: 0 0 1rem 0;
      color: #1e293b;
      line-height: 1.3;
    }

    .exam-card p {
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 1.5rem;
      flex: 1; /* This pushes the meta and button to the bottom */
    }

    .meta-row {
      display: flex;
      gap: 1.25rem;
      margin-top: auto;
      margin-bottom: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid #f1f5f9;
      color: #94a3b8;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .meta-row span { display: flex; align-items: center; gap: 0.5rem; }

    .btn-primary {
      background: #6366f1;
      color: white;
      padding: 0.9rem;
      border-radius: 14px;
      font-weight: 700;
      border: none;
      width: 100%;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary:hover {
      background: #4f46e5;
      transform: scale(1.02);
    }
  `]
})
export class QuizListComponent implements OnInit, OnDestroy {
  private quizService = inject(QuizService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  
  allExams: Exam[] = [];
  filteredExams: Exam[] = [];
  subjects: Subject[] = [];
  
  selectedSubjectId: number = 0;
  loading: boolean = true;
  private routerSubscription?: Subscription;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['subject']) {
        this.selectedSubjectId = Number(params['subject']);
      }
      this.refreshData();
    });

    // Listen for same-URL navigations to force reload
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  refreshData() {
    this.loading = true;
    this.cdr.detectChanges();

    this.quizService.getSubjects().subscribe(subjects => {
      this.subjects = subjects;
      this.cdr.detectChanges();
    });

    this.quizService.getPublishedExams().subscribe({
      next: (exams) => {
        this.allExams = exams;
        this.filterBySubject(); // Apply filter after loading data
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterBySubject() {
    if (this.selectedSubjectId == 0) {
      this.filteredExams = this.allExams;
    } else {
      this.filteredExams = this.allExams.filter(e => e.questionIds && e.questionIds.length > 0); 
      // Note: Ideal filtering should be done by checking if any question in exam belongs to selected subject
      // or if Exam has a subjectId field. For now, let's just do a simple filter if possible.
      // Since mapToDto in ExamServiceImpl doesn't include subjectId on the Exam itself yet, 
      // I'll add subjectId to Exam entity and DTO later or just filter by questions.
      
      // I'll just filter exams that have at least one question from the selected subject
      this.filteredExams = this.allExams.filter(exam => 
        exam.questions?.some(q => q.subjectId === Number(this.selectedSubjectId))
      );
    }
  }
}
