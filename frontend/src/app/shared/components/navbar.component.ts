import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand" routerLink="/">CodeQuiz<span>.</span></div>
        
        <button class="mobile-toggle" (click)="isMenuOpen = !isMenuOpen">
          <i class="fas" [ngClass]="isMenuOpen ? 'fa-times' : 'fa-bars'"></i>
        </button>

        <div class="nav-links" [class.open]="isMenuOpen">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="isMenuOpen = false">Trang chủ</a>
          <a routerLink="/quiz" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="isMenuOpen = false">Luyện tập</a>
          
          <ng-container *ngIf="authService.currentUser$ | async as user; else guestLinks">
            <a routerLink="/quiz/history" routerLinkActive="active" (click)="isMenuOpen = false">Lịch sử</a>
            
            <div class="admin-dropdown" *ngIf="authService.hasRole('ADMIN')">
              <a class="dropdown-trigger">Quản trị ▾</a>
              <div class="dropdown-content">
                <a routerLink="/admin/users" (click)="isMenuOpen = false">Quản lý người dùng</a>
                <a routerLink="/admin/subjects" (click)="isMenuOpen = false">Quản lý môn học</a>
                <a routerLink="/admin/questions" (click)="isMenuOpen = false">Quản lý câu hỏi</a>
                <a routerLink="/admin/exams" (click)="isMenuOpen = false">Quản lý đề thi</a>
              </div>
            </div>

            <div class="user-profile">
              <span class="user-name">{{ user.username }}</span>
              <button (click)="logout()" class="btn-logout">Đăng xuất</button>
            </div>
          </ng-container>

          <ng-template #guestLinks>
            <div class="guest-group">
              <a routerLink="/login" class="nav-link" (click)="isMenuOpen = false">Đăng nhập</a>
              <button routerLink="/signup" class="btn btn-primary" (click)="isMenuOpen = false">Bắt đầu ngay</button>
            </div>
          </ng-template>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: white;
      border-bottom: 1px solid #f1f5f9;
      position: sticky;
      top: 0;
      z-index: 1000;
      height: 80px;
      display: flex;
      align-items: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .nav-container {
      width: min(1200px, calc(100% - 2rem));
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .nav-brand { font-size: 1.75rem; font-weight: 800; color: #1e293b; cursor: pointer; letter-spacing: -0.025em; }
    .nav-brand span { color: #6366f1; }
    
    .nav-links { display: flex; gap: 2rem; align-items: center; }
    .nav-links a { text-decoration: none; color: #64748b; font-weight: 600; font-size: 1rem; transition: all 0.2s; cursor: pointer; }
    .nav-links a:hover, .nav-links a.active { color: #6366f1; }
    .guest-group { display: flex; gap: 1.5rem; align-items: center; }
    
    .mobile-toggle {
      display: none;
      background: transparent;
      border: none;
      font-size: 1.5rem;
      color: #1e293b;
      cursor: pointer;
      z-index: 1001;
    }

    .btn-logout { background: transparent; border: 1px solid #e2e8f0; color: #ef4444; padding: 0.5rem 1.25rem; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-logout:hover { background: #fee2e2; border-color: #fecaca; }
    
    .btn-primary { background: #6366f1; color: white; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 700; border: none; cursor: pointer; }
    
    .user-profile { display: flex; align-items: center; gap: 1rem; border-left: 1px solid #f1f5f9; padding-left: 1.5rem; }
    .user-name { font-weight: 600; color: #1e293b; }

    .admin-dropdown { position: relative; display: inline-block; }
    .dropdown-trigger { cursor: pointer; color: #64748b; font-weight: 600; }
    .dropdown-content {
      display: none; position: absolute; background-color: white; min-width: 200px;
      box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.1); border-radius: 12px;
      padding: 0.5rem; z-index: 1001; top: 100%; left: 0; border: 1px solid #f1f5f9;
    }
    .dropdown-content a {
      color: #1e293b; padding: 10px 16px; text-decoration: none; display: block;
      border-radius: 8px; font-size: 0.9rem;
    }
    .dropdown-content a:hover { background-color: #f8fafc; color: #6366f1; }
    .admin-dropdown:hover .dropdown-content { display: block; }

    @media (max-width: 992px) {
      .mobile-toggle { display: block; }
      
      .nav-links {
        position: fixed; top: 0; right: -100%; width: 80%; height: 100vh;
        background: white; flex-direction: column; padding: 6rem 2rem;
        transition: 0.3s ease; box-shadow: -10px 0 30px rgba(0,0,0,0.1);
        align-items: flex-start;
      }
      .nav-links.open { right: 0; }
      .guest-group { flex-direction: column; width: 100%; align-items: flex-start; }
      .guest-group button { width: 100%; }
      .user-profile { border-left: none; padding-left: 0; flex-direction: column; align-items: flex-start; gap: 1rem; width: 100%; }
      .admin-dropdown { width: 100%; }
      .dropdown-content { position: static; box-shadow: none; border: none; display: block; padding-left: 1.5rem; }
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  isMenuOpen = false;

  logout() {
    this.authService.logout();
    this.isMenuOpen = false;
  }
}
