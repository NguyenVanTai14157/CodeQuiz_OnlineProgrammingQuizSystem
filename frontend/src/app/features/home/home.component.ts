import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuizService } from '../../core/services/quiz.service';
import { Exam, Subject } from '../../models/quiz.model';
import { filter, Subscription } from 'rxjs';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SkeletonComponent],
  template: `
    <div class="home-page animate-fade">
      <!-- High-End Hero Section -->
      <section class="hero-section">
        <div class="hero-bg-glow glow-1"></div>
        <div class="hero-bg-glow glow-2"></div>
        <div class="page-shell">
          <div class="hero-content">
            <span class="eyebrow-glowing"><i class="fas fa-sparkles"></i> Future of Learning</span>
            <h1>Knowledge is Power.<br>Test your <span class="text-gradient">Skills.</span></h1>
            <p class="hero-subtitle">
              Hệ thống luyện tập lập trình hiện đại. 
              Trải nghiệm môi trường thi chuyên nghiệp và nâng cao kỹ năng của bạn mỗi ngày.
            </p>
            <div class="hero-actions">
              <button routerLink="/quiz" class="btn-primary-premium">
                Bắt đầu ngay <i class="fas fa-arrow-right"></i>
              </button>
              <button routerLink="/signup" class="btn-glass-premium">
                Đăng ký thành viên
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <div class="page-shell main-content-shift">
        <!-- Featured Subjects -->
        <section class="mb-section">
          <div class="section-heading-flex">
            <div>
              <span class="eyebrow-accent">Khám phá nội dung</span>
              <h2>Môn học phổ biến</h2>
            </div>
            <a routerLink="/quiz" class="btn-link">Tất cả môn học <i class="fas fa-chevron-right"></i></a>
          </div>
          
          <!-- Loading State for Subjects -->
          <div *ngIf="loading" class="subject-grid">
            <div *ngFor="let i of [1,2,3,4]" class="subject-card-skeleton">
              <app-skeleton width="56px" height="56px" borderRadius="16px" class="mb-4"></app-skeleton>
              <app-skeleton width="70%" height="24px" class="mb-3"></app-skeleton>
              <app-skeleton width="100%" height="16px" class="mb-2"></app-skeleton>
              <app-skeleton width="100%" height="16px" class="mb-4"></app-skeleton>
            </div>
          </div>

          <div *ngIf="!loading" class="subject-grid">
            <div *ngFor="let s of subjects" [routerLink]="['/quiz']" [queryParams]="{subject: s.id}" class="subject-card-premium">
              <div class="subject-icon-box">
                <span>{{ s.subjectName.charAt(0) }}</span>
              </div>
              <h3>{{ s.subjectName }}</h3>
              <p class="desc">{{ s.description }}</p>
              <div class="action-footer">
                Explore <i class="fas fa-arrow-right"></i>
              </div>
            </div>
          </div>
        </section>

        <!-- Featured Exams -->
        <section class="mb-section">
          <div class="section-heading-flex">
            <div>
              <span class="eyebrow-accent">Nghiêm túc rèn luyện</span>
              <h2>Các đề thi nổi bật</h2>
            </div>
          </div>
          
          <!-- Loading State for Exams -->
          <div *ngIf="loading" class="exam-grid-premium">
            <div *ngFor="let i of [1,2,3]" class="exam-card-skeleton">
              <app-skeleton width="100px" height="28px" borderRadius="99px" class="mb-4"></app-skeleton>
              <app-skeleton width="80%" height="32px" class="mb-3"></app-skeleton>
              <app-skeleton width="100%" height="60px" class="mb-4"></app-skeleton>
              <div class="flex gap-4 mt-auto">
                <app-skeleton width="80px" height="20px"></app-skeleton>
                <app-skeleton width="80px" height="20px"></app-skeleton>
              </div>
            </div>
          </div>

          <div *ngIf="!loading" class="exam-grid-premium">
            <div *ngFor="let exam of featuredExams" [routerLink]="['/quiz/take', exam.id]" class="exam-card-premium">
              <div class="card-tag-row">
                <span class="premium-tag">Official</span>
                <div class="rating-stars">
                  <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                </div>
              </div>
              <h3>{{ exam.title }}</h3>
              <p class="desc">{{ exam.description }}</p>
              
              <div class="exam-meta-footer">
                <div class="meta-pill">
                  <i class="far fa-clock"></i> <span>{{ exam.duration }}'</span>
                </div>
                <div class="meta-pill">
                  <i class="far fa-file-alt"></i> <span>{{ exam.totalQuestions }} Qs</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .home-page { background: #f8fafc; min-height: 100vh; }
    
    .hero-section {
      background: #0f172a;
      position: relative;
      padding: 6rem 0 8rem 0;
      color: white;
      z-index: 1;
      overflow: hidden;
    }
    
    .hero-bg-glow {
      position: absolute; border-radius: 50%; filter: blur(100px); z-index: -1; opacity: 0.5;
    }
    .glow-1 { top: -10%; left: -5%; width: 600px; height: 600px; background: rgba(99, 102, 241, 0.4); animation: float-glow 20s infinite alternate; }
    .glow-2 { bottom: -10%; right: -5%; width: 700px; height: 700px; background: rgba(236, 72, 153, 0.3); animation: float-glow 25s infinite alternate-reverse; }
    
    @keyframes float-glow {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(100px, 50px) scale(1.2); }
    }
    
    .hero-content { text-align: center; max-width: 850px; margin: 0 auto; }
    
    .eyebrow-glowing {
      display: inline-block; padding: 0.5rem 1.5rem; background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1); border-radius: 99px;
      color: #a5b4fc; font-weight: 700; font-size: 0.85rem; text-transform: uppercase;
      letter-spacing: 0.1em; margin-bottom: 2.5rem;
      backdrop-filter: blur(5px);
    }
    
    h1 { font-size: clamp(3rem, 7vw, 4.8rem); font-weight: 800; line-height: 1.1; margin-bottom: 1.5rem; letter-spacing: -0.04em; }
    
    .text-gradient {
      background: linear-gradient(135deg, #a5b4fc 0%, #f472b6 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      color: transparent;
    }
    
    .hero-subtitle { font-size: 1.25rem; color: #94a3b8; max-width: 600px; margin: 0 auto 3.5rem; line-height: 1.7; }
    
    .hero-actions { display: flex; gap: 1.5rem; justify-content: center; }
    
    .btn-primary-premium {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: white; border: none; padding: 1rem 2.5rem; border-radius: 16px;
      font-weight: 700; font-size: 1.1rem; cursor: pointer;
      box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.5);
      display: flex; align-items: center; gap: 0.8rem;
    }
    .btn-primary-premium:hover { transform: translateY(-3px); box-shadow: 0 20px 30px -10px rgba(79, 70, 229, 0.6); }
    
    .btn-glass-premium {
      background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.2);
      padding: 1rem 2.5rem; border-radius: 16px; font-weight: 700; font-size: 1.1rem;
      cursor: pointer; backdrop-filter: blur(10px);
    }
    .btn-glass-premium:hover { background: rgba(255,255,255,0.1); transform: translateY(-3px); }

    .main-content-shift { margin-top: -3rem; position: relative; z-index: 10; }
    
    .mb-section { margin-bottom: 8rem; }
    .section-heading-flex { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 3.5rem; }
    .eyebrow-accent { color: #6366f1; font-weight: 800; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.5rem; }
    .btn-link { color: #6366f1; font-weight: 700; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem; }
    .btn-link:hover { gap: 0.8rem; text-decoration: underline; }

    /* Cards */
    .subject-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2.5rem; }
    .subject-card-premium {
      background: white; padding: 3rem 2rem; border-radius: 32px;
      border: 1px solid #f1f5f9; box-shadow: 0 10px 30px -5px rgba(0,0,0,0.03);
      transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); cursor: pointer;
    }
    .subject-card-premium:hover { transform: translateY(-12px); box-shadow: 0 30px 60px -12px rgba(0,0,0,0.08); border-color: #e2e8f0; }
    
    .subject-icon-box {
      width: 64px; height: 64px; background: #eef2ff; color: #6366f1;
      border-radius: 20px; display: flex; align-items: center; justify-content: center;
      font-size: 1.8rem; font-weight: 800; margin-bottom: 2rem;
    }
    .subject-card-premium h3 { font-size: 1.4rem; margin-bottom: 1rem; }
    .subject-card-premium .desc { color: #64748b; line-height: 1.6; margin-bottom: 2.5rem; }
    .action-footer { color: #6366f1; font-weight: 800; display: flex; align-items: center; gap: 0.6rem; }

    .exam-grid-premium { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 2.5rem; }
    .exam-card-premium {
      background: white; border-radius: 32px; padding: 2.5rem;
      border: 1px solid #f1f5f9; transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex; flex-direction: column; cursor: pointer;
    }
    .exam-card-premium:hover { transform: translateY(-12px); box-shadow: 0 30px 60px -12px rgba(99, 102, 241, 0.15); border-color: #c7d2fe; }
    
    .card-tag-row { display: flex; justify-content: space-between; margin-bottom: 2rem; }
    .premium-tag { background: #fef2f2; color: #ef4444; padding: 0.5rem 1.2rem; border-radius: 99px; font-weight: 800; font-size: 0.75rem; text-transform: uppercase; }
    .rating-stars { color: #fbbf24; font-size: 0.85rem; display: flex; gap: 0.3rem; }
    
    .exam-card-premium h3 { font-size: 1.6rem; line-height: 1.3; margin-bottom: 1rem; }
    .exam-card-premium .desc { color: #64748b; margin-bottom: 2.5rem; flex: 1; }
    
    .exam-meta-footer { display: flex; gap: 1.5rem; padding-top: 2rem; border-top: 1px solid #f1f5f9; }
    .meta-pill { display: flex; align-items: center; gap: 0.6rem; color: #475569; font-weight: 700; font-size: 0.9rem; }
    .meta-pill i { color: #94a3b8; }

    /* Skeleton Helpers */
    .subject-card-skeleton, .exam-card-skeleton {
      background: white; padding: 2.5rem; border-radius: 32px; border: 1px solid #f1f5f9;
      display: flex; flex-direction: column;
    }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mt-auto { margin-top: auto; }
    .gap-4 { gap: 1rem; }
    .flex { display: flex; }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  private quizService = inject(QuizService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  
  featuredExams: Exam[] = [];
  subjects: Subject[] = [];
  loading: boolean = true;
  private routerSubscription?: Subscription;

  ngOnInit() {
    this.loadData();
    
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.loadData();
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loadData() {
    this.loading = true;
    this.cdr.detectChanges();

    // Fetch both and wait for completion
    const subjects$ = this.quizService.getSubjects();
    const exams$ = this.quizService.getPublishedExams();

    subjects$.subscribe({
      next: (data) => {
        this.subjects = data.slice(0, 4);
        this.checkLoadingState();
      },
      error: (err) => {
        console.error('Error loading subjects:', err);
        this.checkLoadingState();
      }
    });

    exams$.subscribe({
      next: (data) => {
        this.featuredExams = data.slice(0, 3);
        this.checkLoadingState();
      },
      error: (err) => {
        console.error('Error loading exams:', err);
        this.checkLoadingState();
      }
    });
  }

  private checkLoadingState() {
    if (this.subjects.length > 0 || this.featuredExams.length > 0) {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
