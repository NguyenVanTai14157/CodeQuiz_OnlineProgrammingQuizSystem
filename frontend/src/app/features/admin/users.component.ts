import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-slide-up">
      <div class="flex-between" style="margin-bottom: 2rem;">
        <div>
          <h1 class="section-title">Quản lý người dùng</h1>
          <p class="section-desc">Theo dõi danh sách thành viên và điều chỉnh quyền truy cập.</p>
        </div>
        <button class="btn-premium btn-primary" (click)="resetForm(); showForm = true">
          <i class="fas fa-plus"></i> {{ showForm ? 'Hủy' : 'Thêm người dùng' }}
        </button>
      </div>

      <!-- Premium User Modal -->
      <div class="modal-overlay" *ngIf="showForm" (click)="$event.target === $event.currentTarget && toggleForm()">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ editingId ? 'Chỉnh sửa tài khoản' : 'Thêm người dùng mới' }}</h3>
            <button class="btn-close" (click)="toggleForm()">✕</button>
          </div>

          <form (submit)="$event.preventDefault()" autocomplete="off">
            <div class="modal-body">
              <div class="form-row">
                <div class="input-group">
                  <label>Tên đăng nhập</label>
                  <input type="text" [(ngModel)]="newData.username" name="username" required [disabled]="!!editingId">
                </div>
                <div class="input-group">
                  <label>Họ và tên</label>
                  <input type="text" [(ngModel)]="newData.fullName" name="fullName" required>
                </div>
              </div>
              
              <div class="form-row">
                <div class="input-group">
                  <label>Email liên hệ</label>
                  <input type="email" [(ngModel)]="newData.email" name="email" required>
                </div>
                <div class="input-group">
                  <label>Vai trò hệ thống</label>
                  <select [(ngModel)]="newData.role" name="role" required>
                    <option value="" disabled selected>Chọn vai trò...</option>
                    <option value="ROLE_USER">Người dùng (User)</option>
                    <option value="ROLE_ADMIN">Quản trị viên (Admin)</option>
                  </select>
                </div>
                <div class="input-group" *ngIf="!editingId">
                  <label>Mật khẩu <span style="color: var(--danger)">*</span></label>
                  <input type="password" [(ngModel)]="newData.password" name="password" placeholder="Nhập mật khẩu cho tài khoản" required>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" (click)="toggleForm()" class="btn-premium btn-ghost">Hủy bỏ</button>
              <button type="button" (click)="save()" class="btn-premium btn-primary" [disabled]="loading">
                {{ loading ? 'Đang xử lý...' : (editingId ? 'Cập nhật tài khoản' : 'Tạo tài khoản') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="table-container animate-slide-up">
        <table>
          <thead>
            <tr>
              <th>THÀNH VIÊN</th>
              <th>ĐỊA CHỈ EMAIL</th>
              <th>HỌ VÀ TÊN</th>
              <th>VAI TRÒ</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of users">
              <td>
                <div class="flex-row">
                  <div class="user-avatar-mini">{{ u.username.charAt(0).toUpperCase() }}</div>
                  <strong>{{ u.username }}</strong>
                </div>
              </td>
              <td style="color: var(--text-muted);">{{ u.email }}</td>
              <td style="font-weight: 600;">{{ u.fullName }}</td>
              <td>
                <span class="role-badge" [style.background]="u.roles?.[0] === 'ROLE_ADMIN' ? '#fef3c7' : '#f1f5f9'"
                      [style.color]="u.roles?.[0] === 'ROLE_ADMIN' ? '#d97706' : '#475569'">
                  {{ (u.roles?.[0] || u.role) === 'ROLE_ADMIN' ? 'QUẢN TRỊ' : 'NGƯỜI DÙNG' }}
                </span>
              </td>
              <td>
                <span [class.badge-green]="isActive(u.status)" 
                      [class.badge-red]="!isActive(u.status)" 
                      class="badge">
                  {{ isActive(u.status) ? 'Hoạt động' : 'Đã khóa' }}
                </span>
              </td>
              <td>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                  <button (click)="toggleStatus(u)" class="btn-premium" 
                          [style.background]="isActive(u.status) ? '#fee2e2' : '#dcfce7'"
                          [style.color]="isActive(u.status) ? '#ef4444' : '#16a34a'"
                          style="padding: 0.4rem 0.8rem; font-size: 0.75rem; border: none; min-width: 80px;">
                    {{ isActive(u.status) ? 'Khóa' : 'Mở khóa' }}
                  </button>
                  <button (click)="edit(u)" class="btn-premium" 
                          style="background: #e0f2fe; color: #0284c7; padding: 0.4rem 0.8rem; font-size: 0.75rem; border: none; min-width: 70px;">
                    <i class="fas fa-edit"></i> Sửa
                  </button>
                  <button (click)="delete(u.id)" class="btn-premium" 
                          style="background: #fee2e2; color: #ef4444; padding: 0.4rem 0.8rem; font-size: 0.75rem; border: none; min-width: 70px;">
                    <i class="fas fa-trash"></i> Xóa
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private baseUrl = environment.apiUrl;
  
  users: any[] = [];
  showForm = false;
  editingId: number | null = null;
  newData: any = { username: '', fullName: '', email: '', role: '' };
  loading = false;

  ngOnInit() { this.load(); }

  load() {
    this.http.get<any[]>(`${this.baseUrl}/admin/users`).subscribe({
      next: (data) => {
        this.users = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load users:', err)
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) this.resetForm();
  }

  resetForm() {
    this.showForm = false;
    this.editingId = null;
    this.newData = { username: '', fullName: '', email: '', role: 'ROLE_USER', password: '' };
    this.cdr.detectChanges();
  }

  isActive(status: string): boolean {
    return status?.toUpperCase() === 'ACTIVE';
  }

  toggleStatus(user: any) {
    const newStatus = this.isActive(user.status) ? 'DEACTIVATED' : 'ACTIVE';
    const action = newStatus === 'ACTIVE' ? 'mở khóa' : 'khóa';
    this.http.put(`${this.baseUrl}/admin/users/${user.id}/status`, { status: newStatus }).subscribe({
      next: () => {
        alert(`Đã ${action} tài khoản "${user.username}" thành công!`);
        this.load();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Toggle status failed:', err);
        alert('Lỗi khi thay đổi trạng thái: ' + (err.error?.message || err.statusText || 'Lỗi hệ thống'));
      }
    });
  }

  save() {
    if (!this.newData.username || !this.newData.email || (!this.editingId && !this.newData.password) || !this.newData.role) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();
    const payload = {
      username: this.newData.username,
      fullName: this.newData.fullName,
      email: this.newData.email,
      role: this.newData.role,
      roles: [this.newData.role],
      status: this.newData.status || 'ACTIVE',
      password: this.newData.password
    };

    if (this.editingId) {
      this.http.put(`${this.baseUrl}/admin/users/${this.editingId}`, payload)
        .subscribe({
          next: () => {
            alert('Cập nhật người dùng thành công!');
            this.load();
            this.showForm = false;
            this.resetForm();
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            alert('Lỗi cập nhật: ' + (err.error?.message || err.statusText || 'Lỗi hệ thống'));
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
    } else {
      this.http.post(`${this.baseUrl}/admin/users`, payload)
        .subscribe({
          next: () => {
            alert('Tạo người dùng thành công!');
            this.load();
            this.showForm = false;
            this.resetForm();
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            alert('Lỗi tạo người dùng: ' + (err.error?.message || err.statusText || 'Lỗi hệ thống'));
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
    }
  }

  edit(u: any) {
    this.editingId = u.id;
    this.newData = {
      ...u,
      role: u.roles?.[0] || u.role || 'ROLE_USER'
    };
    this.showForm = true;
  }

  delete(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này không? Hành động này không thể hoàn tác.')) {
      this.http.delete(`${this.baseUrl}/admin/users/${id}`).subscribe({
        next: () => {
          alert('Xóa người dùng thành công!');
          this.load();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Delete user failed:', err);
          alert('Lỗi khi xóa: ' + (err.error?.message || err.statusText || 'Lỗi hệ thống'));
        }
      });
    }
  }
}
