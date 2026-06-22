import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar glass-effect">
      <div class="nav-container">
        <div class="nav-brand" routerLink="/">CodeQuiz<span>.</span></div>
        
        <div class="nav-main">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Trang chủ</a>
          <a routerLink="/quiz" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Luyện tập</a>
          
          <ng-container *ngIf="authService.currentUser$ | async as user">
            <a routerLink="/quiz/history" routerLinkActive="active">Lịch sử</a>
            
            <div class="admin-dropdown" *ngIf="authService.hasRole('ADMIN')">
              <a class="dropdown-trigger">Quản trị <i class="fas fa-chevron-down"></i></a>
              <div class="dropdown-content">
                <div class="dropdown-arrow"></div>
                <a routerLink="/admin/users"><i class="fas fa-users"></i> Người dùng</a>
                <a routerLink="/admin/subjects"><i class="fas fa-book"></i> Môn học</a>
                <a routerLink="/admin/questions"><i class="fas fa-question-circle"></i> Câu hỏi</a>
                <a routerLink="/admin/exams"><i class="fas fa-file-alt"></i> Đề thi</a>
              </div>
            </div>
          </ng-container>
        </div>

        <div class="nav-actions">
          <ng-container *ngIf="authService.currentUser$ | async as user; else guestActions">
            <div class="user-info">
              <div class="user-avatar">
                {{ (user.fullName || user.username).charAt(0) }}
              </div>
              <div class="user-details">
                <span class="user-name">{{ user.fullName || user.username }}</span>
              </div>
              <button (click)="authService.logout()" class="btn-icon-logout" title="Đăng xuất">
                <i class="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </ng-container>

          <ng-template #guestActions>
            <div class="guest-group">
              <a routerLink="/login" class="nav-link-subtle">Đăng nhập</a>
              <button routerLink="/signup" class="btn-primary-small">Bắt đầu ngay</button>
            </div>
          </ng-template>
        </div>

        <!-- Mobile Menu Toggle (Mockup) -->
        <div class="mobile-toggle">
          <i class="fas fa-bars"></i>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky; top: 0; z-index: 1000; height: 80px;
      display: flex; align-items: center;
      transition: all 0.3s ease;
    }
    
    .glass-effect {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(226, 232, 240, 0.8);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
    }
    
    .nav-container {
      width: min(1200px, calc(100% - 3rem));
      margin: 0 auto;
      display: flex; justify-content: space-between; align-items: center;
    }
    
    .nav-brand {
      font-family: 'Outfit', sans-serif;
      font-size: 1.75rem; font-weight: 800; color: #0f172a;
      cursor: pointer; letter-spacing: -0.04em;
    }
    .nav-brand span { color: #6366f1; }
    
    .nav-main { display: flex; gap: 2.25rem; align-items: center; }
    .nav-main a {
      text-decoration: none; color: #64748b; font-weight: 700;
      font-size: 0.95rem; transition: all 0.2s ease;
      position: relative;
    }
    .nav-main a:hover, .nav-main a.active { color: #6366f1; }
    .nav-main a.active::after {
      content: ''; position: absolute; bottom: -8px; left: 0; width: 100%;
      height: 2px; background: #6366f1; border-radius: 2px;
    }
    
    .nav-actions { display: flex; align-items: center; gap: 1.5rem; }
    
    .user-info {
      display: flex; align-items: center; gap: 0.8rem;
      background: #f8fafc; padding: 0.4rem; padding-right: 0.8rem;
      border-radius: 99px; border: 1px solid #e2e8f0;
    }
    .user-avatar {
      width: 32px; height: 32px; background: linear-gradient(135deg, #6366f1, #ec4899);
      color: white; border-radius: 50%; display: flex; align-items: center;
      justify-content: center; font-weight: 800; font-size: 0.8rem;
    }
    .user-name { font-weight: 700; color: #1e293b; font-size: 0.9rem; }
    
    .btn-icon-logout {
      background: transparent; border: none; color: #94a3b8; cursor: pointer;
      font-size: 1.1rem; padding: 0.25rem; margin-left: 0.5rem; transition: color 0.2s;
    }
    .btn-icon-logout:hover { color: #ef4444; }
    
    .guest-group { display: flex; gap: 1.25rem; align-items: center; }
    .nav-link-subtle { color: #64748b; font-weight: 700; font-size: 0.95rem; }
    .nav-link-subtle:hover { color: #6366f1; }
    
    .btn-primary-small {
      background: #6366f1; color: white; padding: 0.6rem 1.25rem;
      border-radius: 12px; font-weight: 700; border: none; cursor: pointer;
      box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2); font-size: 0.9rem;
    }
    .btn-primary-small:hover { background: #4f46e5; transform: translateY(-1px); }

    /* Admin Dropdown */
    .admin-dropdown { position: relative; }
    .dropdown-trigger { cursor: pointer; }
    .dropdown-trigger i { font-size: 0.75rem; margin-left: 0.25rem; opacity: 0.5; }
    
    .dropdown-content {
      display: none; position: absolute; background-color: white; min-width: 200px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); border-radius: 16px;
      padding: 0.75rem; z-index: 1001; top: calc(100% + 15px); left: 50%;
      transform: translateX(-50%); border: 1px solid #f1f5f9;
    }
    .dropdown-arrow {
      position: absolute; top: -6px; left: 50%; transform: translateX(-50%) rotate(45deg);
      width: 12px; height: 12px; background: white; border-top: 1px solid #f1f5f9; border-left: 1px solid #f1f5f9;
    }
    .dropdown-content a {
      color: #475569; padding: 0.75rem 1rem; border-radius: 10px;
      font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 0.75rem;
    }
    .dropdown-content a i { width: 1.25rem; opacity: 0.6; }
    .dropdown-content a:hover { background: #f1f5f9; color: #6366f1; }
    .admin-dropdown:hover .dropdown-content { display: block; animation: slideUp 0.2s ease-out; }
    
    @keyframes slideUp { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }
    
    .mobile-toggle { display: none; font-size: 1.5rem; color: #1e293b; cursor: pointer; }

    @media (max-width: 992px) {
      .nav-main { display: none; }
      .mobile-toggle { display: block; }
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
}
