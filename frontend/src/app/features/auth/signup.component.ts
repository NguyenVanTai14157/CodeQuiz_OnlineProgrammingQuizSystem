import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">
          <span class="logo-icon">⟨/⟩</span>
          <h2>CodeQuiz</h2>
        </div>
        <div class="auth-header">
          <h1>Tạo tài khoản</h1>
          <p>Bắt đầu hành trình lập trình của bạn ngay hôm nay</p>
        </div>

        <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>
        <div class="success-msg" *ngIf="successMsg">{{ successMsg }}</div>

        <form (ngSubmit)="onSignup()" autocomplete="off">
          <div class="form-group">
            <label>Tên đăng nhập</label>
            <input type="text" [(ngModel)]="form.username" name="username" placeholder="" required autocomplete="off" (input)="errorMsg = ''">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="form.email" name="email" placeholder="" required autocomplete="off" (input)="errorMsg = ''">
          </div>
          <div class="form-group">
            <label>Họ và tên</label>
            <input type="text" [(ngModel)]="form.fullName" name="fullName" placeholder="" autocomplete="off" (input)="errorMsg = ''">
          </div>
          <div class="form-group">
            <label>Mật khẩu</label>
            <input type="password" [(ngModel)]="form.password" name="password" placeholder="" required autocomplete="new-password" (input)="errorMsg = ''">
          </div>
          <button type="submit" class="btn-submit" [disabled]="loading">
            {{ loading ? 'Đang xử lý...' : 'Đăng ký' }}
          </button>
          <div class="auth-footer">
            <p>Đã có tài khoản? <a routerLink="/login">Đăng nhập</a></p>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex; justify-content: center; align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      position: relative; overflow: hidden;
    }
    .auth-container::before {
      content: ''; position: absolute; width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(16,185,129,0.15), transparent 70%);
      top: -200px; left: -200px; border-radius: 50%;
    }
    .auth-card {
      width: 100%; max-width: 420px; padding: 2.5rem;
      background: rgba(30,41,59,0.8); backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.08); border-radius: 20px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.4); position: relative; z-index: 1;
    }
    .auth-logo { text-align: center; margin-bottom: 1rem; }
    .logo-icon { font-size: 2rem; color: #10b981; font-weight: 800; background: rgba(16,185,129,0.1); padding: 0.5rem 1rem; border-radius: 12px; display: inline-block; margin-bottom: 0.5rem; }
    .auth-logo h2 { color: #e2e8f0; font-size: 1.5rem; margin: 0; }
    .auth-header { text-align: center; margin-bottom: 1.5rem; }
    .auth-header h1 { margin: 0; font-size: 1.5rem; color: #f1f5f9; }
    .auth-header p { color: #94a3b8; margin-top: 0.5rem; }
    .error-msg { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; padding: 0.75rem 1rem; border-radius: 10px; margin-bottom: 1rem; font-size: 0.875rem; text-align: center; }
    .success-msg { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: #6ee7b7; padding: 0.75rem 1rem; border-radius: 10px; margin-bottom: 1rem; font-size: 0.875rem; text-align: center; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.4rem; font-size: 0.875rem; color: #94a3b8; font-weight: 500; }
    .form-group input { width: 100%; padding: 0.8rem 1rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(15,23,42,0.6); color: #e2e8f0; border-radius: 10px; font-size: 1rem; transition: all 0.3s; box-sizing: border-box; }
    .form-group input:focus { outline: none; border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.15); }
    .form-group input::placeholder { color: #475569; }
    .btn-submit { width: 100%; padding: 0.875rem; border: none; border-radius: 10px; background: linear-gradient(135deg, #10b981, #059669); color: white; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
    .btn-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(16,185,129,0.3); }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .auth-footer { margin-top: 1.5rem; text-align: center; font-size: 0.875rem; color: #94a3b8; }
    .auth-footer a { color: #10b981; text-decoration: none; font-weight: 600; }
  `]
})
export class SignupComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  form = { username: '', email: '', password: '', fullName: '' };
  loading = false;
  errorMsg = '';
  successMsg = '';

  onSignup() {
    if (!this.form.username) {
      this.errorMsg = 'Vui lòng nhập tên đăng nhập!';
      this.cdr.markForCheck();
      return;
    }
    if (!this.form.email) {
      this.errorMsg = 'Vui lòng nhập địa chỉ email!';
      this.cdr.markForCheck();
      return;
    }
    if (!this.form.password) {
      this.errorMsg = 'Vui lòng nhập mật khẩu!';
      this.cdr.markForCheck();
      return;
    }
    if (this.form.password.length < 6) {
      this.errorMsg = 'Mật khẩu phải có ít nhất 6 ký tự!';
      this.cdr.markForCheck();
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';
    this.cdr.markForCheck();
    
    this.authService.register(this.form).subscribe({
      next: () => {
        this.successMsg = 'Đăng ký thành công! Đang chuyển đến trang đăng nhập...';
        this.cdr.markForCheck();
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.errorMsg = err.error?.message || err.error || 'Đã xảy ra lỗi khi đăng ký!';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
