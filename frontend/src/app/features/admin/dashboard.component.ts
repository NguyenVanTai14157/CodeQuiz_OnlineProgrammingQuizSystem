import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="animate-fade">
      <header class="section-header" style="margin-bottom: 4rem;">
        <span class="eyebrow">Administrative Control</span>
        <h1 style="font-size: 3rem; margin: 0;">Tổng quan hệ thống</h1>
        <p style="color: var(--text-muted); font-size: 1.1rem; margin-top: 0.5rem;">Cập nhật tình hình hoạt động của nền tảng CodeQuiz theo thời gian thực.</p>
      </header>

      <div class="metric-grid">
        <div class="metric-card" routerLink="/admin/users">
          <span>Người dùng hệ thống</span>
          <h2>{{ stats?.totalUsers || 0 }}</h2>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
            <span class="badge badge-blue">Active Members</span>
            <i class="fas fa-users-cog" style="font-size: 1.5rem; color: var(--primary); opacity: 0.5;"></i>
          </div>
        </div>

        <div class="metric-card" routerLink="/admin/subjects">
          <span>Danh mục môn học</span>
          <h2>{{ stats?.totalSubjects || 0 }}</h2>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
            <span class="badge badge-green">Curriculum</span>
            <i class="fas fa-atlas" style="font-size: 1.5rem; color: var(--success); opacity: 0.5;"></i>
          </div>
        </div>

        <div class="metric-card" routerLink="/admin/questions">
          <span>Ngân hàng câu hỏi</span>
          <h2>{{ stats?.totalQuestions || 0 }}</h2>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
            <span class="badge badge-blue" style="background: #fef3c7; color: #92400e;">Knowledge Assets</span>
            <i class="fas fa-brain" style="font-size: 1.5rem; color: var(--warning); opacity: 0.5;"></i>
          </div>
        </div>

        <div class="metric-card" routerLink="/admin/exams">
          <span>Bộ đề thi công bố</span>
          <h2>{{ stats?.totalExams || 0 }}</h2>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
            <span class="badge" style="background: #fee2e2; color: #b91c1c;">Published Exams</span>
            <i class="fas fa-certificate" style="font-size: 1.5rem; color: var(--danger); opacity: 0.5;"></i>
          </div>
        </div>
      </div>
      
      <div class="premium-card" style="display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 3rem; margin-top: 2rem; background: var(--slate-900); color: white; border: none;">
        <div>
          <h3 style="font-size: 1.5rem; margin-bottom: 1rem; color: white;">Trạng thái Database</h3>
          <p style="color: var(--slate-400); margin: 0;">
            Hệ thống đang kết nối ổn định với PostgreSQL. Tất cả dữ liệu người dùng, môn học và ngân hàng câu hỏi đều được mã hóa bằng JWT.
          </p>
        </div>
        <div style="text-align: right;">
          <div class="badge-green" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 50px;">
            <span style="width: 8px; height: 8px; background: currentColor; border-radius: 50%;"></span>
            Connected
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  
  private baseUrl = environment.apiUrl;
  stats: any;
  private routerSubscription?: Subscription;

  ngOnInit() {
    this.loadStats();

    // Listen for same-URL navigations
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.loadStats();
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loadStats() {
    this.http.get<any>(`${this.baseUrl}/admin/dashboard`).subscribe({
      next: (data) => {
        this.stats = data;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Failed to fetch dashboard data:', err)
    });
  }
}
