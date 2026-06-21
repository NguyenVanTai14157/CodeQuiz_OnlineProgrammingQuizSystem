import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuizService } from '../../core/services/quiz.service';
import { Exam, Subject } from '../../models/quiz.model';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="home-page animate-fade">
      <!-- High-End Hero Section -->
      <section class="hero-section">
        <div class="hero-bg-glow glow-1"></div>
        <div class="hero-bg-glow glow-2"></div>
        <div class="page-shell">
          <div class="hero-content">
            <span class="eyebrow-glowing"><i class="fas fa-sparkles"></i> Leading the Future of Learning</span>
            <h1>Knowledge is Power.<br>Test your <span class="text-gradient">Skills.</span></h1>
            <p class="hero-subtitle">
              Hệ thống luyện tập lập trình hàng đầu với các bài thi thực tế từ Java, Spring Boot cho đến Python. 
              Trải nghiệm môi trường thi chuyên nghiệp ngay tại CodeQuiz.
            </p>
            <div class="hero-actions">
              <button routerLink="/quiz" class="btn-primary glow-btn">
                Bắt đầu ngay <i class="fas fa-arrow-right" style="margin-left: 0.5rem;"></i>
              </button>
              <button routerLink="/signup" class="btn-outline light-glass">
                Đăng ký thành viên
              </button>
            </div>
          </div>
        </div>
        
      </section>
      
      <div class="page-shell" style="padding-top: 4rem;">
        <!-- Featured Subjects -->
        <section class="mb-section">
          <div class="section-heading-flex">
            <div>
              <span class="eyebrow text-gradient">Khám phá nội dung</span>
              <h2>Môn học phổ biến</h2>
            </div>
            <a routerLink="/quiz" class="btn-outline modern-btn">Tất cả môn học</a>
          </div>
          
          <div class="subject-grid">
            <div *ngFor="let s of subjects" [routerLink]="['/quiz']" [queryParams]="{subject: s.id}" class="subject-card modern">
              <div class="subject-mark-modern">{{ s.subjectName.charAt(0) }}</div>
              <h3>{{ s.subjectName }}</h3>
              <p class="desc">{{ s.description }}</p>
              <div class="action-link">
                Tham gia ngay <i class="fas fa-arrow-right"></i>
              </div>
            </div>
          </div>
        </section>

        <!-- Featured Exams -->
        <section class="mb-section">
          <div class="section-heading-flex">
            <div>
              <span class="eyebrow text-gradient">Nghiêm túc rèn luyện</span>
              <h2>Các đề thi nổi bật</h2>
            </div>
          </div>
          
          <div class="exam-modern-grid">
            <div *ngFor="let exam of featuredExams" [routerLink]="['/quiz/take', exam.id]" class="exam-card-modern">
              <div class="card-header">
                <span class="badge badge-indigo">Official Exam</span>
                <div class="stars">
                  <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                </div>
              </div>
              <h3>{{ exam.title }}</h3>
              <p class="desc">{{ exam.description }}</p>
              
              <div class="meta-row">
                <div class="meta-item">
                  <span class="icon-wrap"><i class="far fa-clock"></i></span> {{ exam.duration }} Min
                </div>
                <div class="meta-item">
                  <span class="icon-wrap"><i class="far fa-question-circle"></i></span> {{ exam.totalQuestions }} Questions
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .home-page {
      background: #f8fafc;
      min-height: 100vh;
      overflow-x: hidden;
    }
    
    /* Hero Section */
    .hero-section {
      background: #0f172a;
      position: relative;
      padding: 4rem 0 5rem 0;
      color: white;
      z-index: 1;
    }
    
    /* Background blob animations */
    .hero-bg-glow {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      z-index: -1;
      opacity: 0.6;
      animation: float 10s infinite ease-in-out alternate;
    }
    .glow-1 {
      top: -10%; left: -5%;
      width: 500px; height: 500px;
      background: rgba(99, 102, 241, 0.4);
    }
    .glow-2 {
      bottom: -10%; right: -5%;
      width: 600px; height: 600px;
      background: rgba(236, 72, 153, 0.3);
      animation-delay: -5s;
    }
    
    @keyframes float {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(30px, -50px) scale(1.1); }
    }
    
    .hero-content {
      text-align: center;
      max-width: 800px;
      margin: 0 auto;
      position: relative;
      z-index: 2;
    }
    
    .eyebrow-glowing {
      display: inline-block;
      padding: 0.5rem 1.25rem;
      background: rgba(129, 140, 248, 0.1);
      border: 1px solid rgba(129, 140, 248, 0.3);
      border-radius: 9999px;
      color: #a5b4fc;
      font-weight: 600;
      font-size: 0.9rem;
      margin-bottom: 2rem;
      box-shadow: 0 0 20px rgba(129, 140, 248, 0.2);
    }
    .eyebrow-glowing i { margin-right: 0.5rem; color: #fbbf24; }
    
    .hero-content h1 {
      font-size: clamp(3rem, 6vw, 4.5rem);
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 1.5rem;
      letter-spacing: -0.03em;
    }
    
    .text-gradient {
      background: linear-gradient(135deg, #a5b4fc 0%, #f472b6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      color: transparent;
    }
    
    .hero-subtitle {
      font-size: 1.2rem;
      color: #94a3b8;
      max-width: 650px;
      margin: 0 auto;
      line-height: 1.7;
    }
    
    .hero-actions {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
      margin-top: 3rem;
    }
    
    .glow-btn {
      padding: 0.8rem 2rem;
      font-size: 1.1rem;
      border-radius: 12px;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.5);
      border: none;
      color: white;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    .glow-btn:hover {
      box-shadow: 0 15px 35px -5px rgba(79, 70, 229, 0.7);
      transform: translateY(-2px);
    }
    
    .light-glass {
      padding: 0.8rem 2rem;
      font-size: 1.1rem;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      color: white !important;
      backdrop-filter: blur(10px);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    .light-glass:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-2px);
    }
    
    /* Layout Helpers */
    .mb-section { margin-bottom: 6rem; }
    .section-heading-flex {
      display: flex; justify-content: space-between; align-items: flex-end;
      margin-bottom: 3rem;
    }
    .section-heading-flex h2 { font-size: 2.2rem; font-weight: 800; color: #0f172a; margin: 0; }
    .modern-btn { border-radius: 12px; padding: 0.6rem 1.5rem; font-weight: 600; }
    
    /* Subject Cards */
    .subject-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2rem;
    }
    .subject-card.modern {
      background: white;
      padding: 2.5rem 2rem;
      border-radius: 24px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      overflow: hidden;
      cursor: pointer;
    }
    .subject-card.modern::before {
      content: '';
      position: absolute; top: 0; left: 0; width: 100%; height: 4px;
      background: linear-gradient(90deg, #4f46e5, #ec4899);
      opacity: 0; transition: opacity 0.3s;
    }
    .subject-card.modern:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
      border-color: transparent;
    }
    .subject-card.modern:hover::before { opacity: 1; }
    
    .subject-mark-modern {
      width: 56px; height: 56px;
      background: linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%);
      color: #4f46e5;
      border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; font-weight: 800;
      margin-bottom: 1.5rem;
    }
    .subject-card.modern h3 { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin-bottom: 0.8rem; }
    .subject-card.modern .desc { color: #64748b; margin-bottom: 2rem; line-height: 1.6; }
    .action-link {
      color: #4f46e5; font-weight: 700; font-size: 0.95rem;
      display: flex; align-items: center; gap: 0.5rem;
      transition: gap 0.2s;
    }
    .subject-card.modern:hover .action-link { gap: 0.8rem; }
    
    /* Exam Cards */
    .exam-modern-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2rem;
    }
    .exam-card-modern {
      background: white;
      border-radius: 24px;
      padding: 2.5rem;
      border: 1px solid #e2e8f0;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex; flex-direction: column;
      cursor: pointer;
    }
    .exam-card-modern:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px -5px rgba(79, 70, 229, 0.15);
      border-color: #a5b4fc;
    }
    
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .badge-indigo { background: #e0e7ff; color: #4338ca; padding: 0.4rem 1rem; border-radius: 999px; font-weight: 700; font-size: 0.8rem; }
    .stars { color: #f59e0b; display: flex; gap: 0.3rem; font-size: 0.9rem; }
    
    .exam-card-modern h3 { font-size: 1.4rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem; line-height: 1.3; }
    .exam-card-modern .desc { color: #64748b; line-height: 1.6; margin-bottom: 2rem; flex: 1; min-height: 60px; }
    
    .meta-row {
      display: flex; gap: 1.5rem;
      padding-top: 1.5rem; border-top: 1px dashed #e2e8f0;
    }
    .meta-item { display: flex; align-items: center; gap: 0.5rem; color: #475569; font-weight: 600; font-size: 0.95rem; }
    .icon-wrap { width: 32px; height: 32px; border-radius: 50%; background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #64748b; }
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
    
    // Listen for same-URL navigations to force reload
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
    // Safety timeout to prevent infinite loading
    setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.cdr.detectChanges();
      }
    }, 5000);

    // Fetch subjects
    this.quizService.getSubjects().subscribe({
      next: (data) => {
        this.subjects = data.slice(0, 4);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading subjects:', err);
        this.cdr.detectChanges();
      }
    });

    // Fetch exams
    this.quizService.getPublishedExams().subscribe({
      next: (data) => {
        this.featuredExams = data.slice(0, 3);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading exams:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
