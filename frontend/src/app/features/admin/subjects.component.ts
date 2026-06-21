import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuizService } from '../../core/services/quiz.service';
import { Subject } from '../../models/quiz.model';

@Component({
  selector: 'app-admin-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-slide-up">
      <div class="flex-between" style="margin-bottom: 2.5rem;">
        <div>
          <h1 class="section-title">Quản lý môn học</h1>
          <p class="section-desc">Cấu hình các lĩnh vực thi đấu và bài tập luyện tập.</p>
        </div>
        <button class="btn-premium btn-primary" (click)="resetForm(); showForm = true">
          <i class="fas fa-plus"></i> {{ showForm ? 'Hủy' : 'Thêm môn học' }}
        </button>
      </div>

      <!-- Premium Subject Modal -->
      <div class="modal-overlay" *ngIf="showForm" (click)="$event.target === $event.currentTarget && resetForm()">
        <div class="modal-content" style="max-width: 550px;">
          <div class="modal-header">
            <h3>{{ editingId ? 'Chỉnh sửa môn học' : 'Thêm môn học mới' }}</h3>
            <button class="btn-close" (click)="resetForm()">✕</button>
          </div>

          <form (submit)="$event.preventDefault()">
            <div class="modal-body">
              <div class="input-group" style="margin-bottom: 2rem;">
                <label>Tên định danh môn học</label>
                <input type="text" [(ngModel)]="newData.subjectName" name="name" required 
                       placeholder="Ví dụ: Java Core, Spring Boot...">
              </div>
              <div class="input-group">
                <label>Mô tả chi tiết lĩnh vực</label>
                <textarea [(ngModel)]="newData.description" name="description" rows="4" 
                          placeholder="Mô tả ngắn gọn về nội dung kiến thức của môn học này..."></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" (click)="resetForm()" class="btn-premium btn-ghost">Bỏ qua</button>
              <button type="button" (click)="save()" class="btn-premium btn-primary" [disabled]="loading">
                {{ loading ? 'Đang xử lý...' : (editingId ? 'Cập nhật môn học' : 'Lưu môn học') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="grid-layout">
        <div class="premium-card subject-card" *ngFor="let s of subjects">
          <div class="flex-between" style="margin-bottom: 1.5rem;">
            <div class="icon-box">
              {{ s.subjectName.charAt(0) }}
            </div>
            <div class="action-btns">
              <button (click)="edit(s)" class="btn-premium" style="background: #e0f2fe; color: #0284c7; padding: 0.4rem 0.8rem; font-size: 0.75rem; border: none;">
                <i class="fas fa-edit"></i> Sửa
              </button>
              <button (click)="delete(s.id!)" class="btn-premium" style="background: #fee2e2; color: #ef4444; padding: 0.4rem 0.8rem; font-size: 0.75rem; border: none;">
                <i class="fas fa-trash"></i> Xóa
              </button>
            </div>
          </div>
          <h3 class="card-title">{{ s.subjectName }}</h3>
          <p class="card-desc">{{ s.description || 'Chưa có mô tả cho môn học này.' }}</p>
          <div class="card-footer">
            <span class="badge badge-blue">Sẵn sàng</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .grid-layout {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
    }
    .subject-card {
      padding: 2.5rem !important;
      border-left: none !important;
      background: white;
      border: 1px solid #f1f5f9;
    }
    .icon-box {
      width: 60px; height: 60px; border-radius: 18px;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      color: white; display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; font-weight: 900; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2);
    }
    .card-title { font-size: 1.5rem; font-weight: 800; color: #1e293b; margin-bottom: 0.75rem; }
    .card-desc { color: #64748b; font-size: 0.95rem; line-height: 1.6; margin-bottom: 2rem; flex: 1; }
    .card-footer { padding-top: 1.5rem; border-top: 1px solid #f1f5f9; }
    .action-btns { display: flex; gap: 0.5rem; }
  `]
})
export class AdminSubjectsComponent implements OnInit {
  private quizService = inject(QuizService);
  private cdr = inject(ChangeDetectorRef);
  subjects: Subject[] = [];
  showForm = false;
  editingId: number | null = null;
  newData: Subject = { subjectName: '', description: '' };
  loading = false;

  ngOnInit() { this.load(); }
  
  load() { 
    this.quizService.getSubjects().subscribe(data => {
      this.subjects = data;
      this.cdr.detectChanges();
    }); 
  }

  save() {
    if (!this.newData.subjectName?.trim()) {
      alert('Vui lòng nhập tên môn học');
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();
    
    if (this.editingId) {
      this.quizService.updateSubject(this.editingId, this.newData).subscribe({
        next: () => {
          alert('Cập nhật môn học thành công!');
          this.resetForm();
          this.load();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Update failed:', err);
          alert('Lỗi cập nhật: ' + (err.error?.message || err.statusText || 'Lỗi không xác định'));
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.quizService.createSubject(this.newData).subscribe({
        next: () => {
          alert('Tạo môn học thành công!');
          this.resetForm();
          this.load();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Creation failed:', err);
          alert('Lỗi tạo mới: ' + (err.error?.message || err.statusText || 'Lỗi không xác định'));
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  edit(subject: Subject) {
    this.editingId = subject.id!;
    this.newData = { ...subject };
    this.showForm = true;
    this.cdr.markForCheck();
  }

  delete(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa môn học này không? Hệ thống sẽ xóa toàn bộ câu hỏi liên quan.')) {
      this.quizService.deleteSubject(id).subscribe({
        next: () => {
          alert('Xóa môn học thành công!');
          this.load();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Delete subject failed:', err);
          alert('Lỗi khi xóa: ' + (err.error?.message || err.statusText || 'Lỗi liên kết dữ liệu'));
        }
      });
    }
  }

  resetForm() {
    this.showForm = false;
    this.editingId = null;
    this.newData = { subjectName: '', description: '' };
    this.cdr.detectChanges();
  }
}
