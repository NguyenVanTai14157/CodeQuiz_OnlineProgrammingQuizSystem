import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-container">
      <aside class="sidebar">
        <div class="sidebar-header">
           <div class="logo-text">CodeQuiz <span>ADMIN</span></div>
        </div>
        <nav class="sidebar-nav">
          <div class="nav-group">QUẢN TRỊ</div>
          <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <i class="fas fa-chart-line"></i> Tổng quan
          </a>
          
          <div class="nav-group">QUẢN LÝ</div>
          <a routerLink="/admin/users" routerLinkActive="active" class="nav-item">
            <i class="fas fa-users"></i> Người dùng
          </a>
          <a routerLink="/admin/subjects" routerLinkActive="active" class="nav-item">
            <i class="fas fa-book"></i> Môn học
          </a>
          <a routerLink="/admin/questions" routerLinkActive="active" class="nav-item">
            <i class="fas fa-question-circle"></i> Câu hỏi
          </a>
          <a routerLink="/admin/exams" routerLinkActive="active" class="nav-item">
            <i class="fas fa-file-alt"></i> Đề thi
          </a>

          <div style="margin-top: auto; padding: 1rem;">
             <button (click)="logout()" class="nav-item" style="width: 100%; border: none; background: rgba(239, 68, 68, 0.1); color: #ef4444; justify-content: center;">
               Đăng xuất
             </button>
          </div>
        </nav>
      </aside>
      
      <main class="main-content">
        <div class="content-wrapper">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-container {
      display: flex; min-height: 100vh; background-color: #f8fafc;
    }
    .sidebar {
      width: 280px; background: #1e293b; color: white; display: flex; flex-direction: column;
      position: fixed; height: 100vh; z-index: 100;
    }
    .sidebar-header {
      padding: 2.5rem 1.5rem; display: flex; align-items: center; gap: 12px;
    }
    .logo-text { font-weight: 800; font-size: 1.25rem; letter-spacing: -1px; }
    .logo-text span { font-size: 0.65rem; background: #3b82f6; padding: 2px 6px; border-radius: 4px; margin-left: 4px; vertical-align: middle; }
    
    .sidebar-nav { padding: 0 1rem; flex: 1; display: flex; flex-direction: column; }
    .nav-group {
      font-size: 0.7rem; font-weight: 800; color: #64748b; letter-spacing: 0.1em;
      margin: 1.5rem 0 0.75rem 0.75rem; text-transform: uppercase;
    }
    .nav-item {
      display: flex; align-items: center; gap: 12px; padding: 0.85rem 1rem;
      color: #94a3b8; text-decoration: none; border-radius: 12px; font-weight: 600;
      transition: all 0.2s; margin-bottom: 4px; cursor: pointer;
    }
    .nav-item i { width: 20px; font-size: 1.1rem; }
    .nav-item:hover { background: rgba(255,255,255,0.05); color: white; }
    .nav-item.active { background: #3b82f6; color: white; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }

    .main-content {
      flex: 1; margin-left: 280px; width: calc(100% - 280px);
    }
    .content-wrapper {
      padding: 2.5rem; max-width: 1400px; margin: 0 auto;
    }

    @media (max-width: 1024px) {
      .sidebar { width: 80px; }
      .logo-text, .nav-group, .nav-item span { display: none; }
      .main-content { margin-left: 80px; width: calc(100% - 80px); }
      .nav-item { justify-content: center; padding: 1rem; }
    }
  `]
})
export class AdminLayoutComponent {
  authService = inject(AuthService);
  router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
