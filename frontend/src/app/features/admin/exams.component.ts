import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuizService } from '../../core/services/quiz.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Exam, Question } from '../../models/quiz.model';

@Component({
  selector: 'app-admin-exams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-slide-up">
      <div class="flex-between" style="margin-bottom: 2.5rem;">
        <div>
          <h1 class="section-title">Quản lý đề thi</h1>
          <p class="section-desc">Kết hợp các câu hỏi để tạo ra bộ đề thi hoàn chỉnh.</p>
        </div>
        <button class="btn-premium btn-primary" (click)="resetForm(); showForm = true">
          <i class="fas fa-plus"></i> {{ showForm ? 'Hủy' : 'Tạo đề thi' }}
        </button>
      </div>

      <!-- Premium Exam Modal -->
      <div class="modal-overlay" *ngIf="showForm" (click)="$event.target === $event.currentTarget && toggleForm()">
        <div class="modal-content" style="max-width: 800px;">
          <div class="modal-header">
            <h3>{{ editingId ? 'Chỉnh sửa bộ đề thi' : 'Thiết lập đề thi mới' }}</h3>
            <button class="btn-close" (click)="toggleForm()">✕</button>
          </div>

          <form (submit)="$event.preventDefault()">
            <div class="modal-body">
              <div class="form-row">
                <div class="input-group">
                  <label>Tiêu đề bài thi</label>
                  <input type="text" [(ngModel)]="newData.title" name="title" required placeholder="Nhập tiêu đề đề thi...">
                </div>
                <div class="input-group">
                  <label>Thời lượng (phút)</label>
                  <input type="number" [(ngModel)]="newData.duration" name="duration" required>
                </div>
              </div>
              
              <div class="input-group" style="margin-bottom: 2rem;">
                <label>Lời giới thiệu & Hướng dẫn</label>
                <textarea [(ngModel)]="newData.description" name="description" rows="2" 
                          placeholder="Mô tả ngắn gọn về bài thi này..."></textarea>
              </div>

              <div class="input-group">
                <label style="margin-bottom: 1rem; display: block;">Lựa chọn bộ câu hỏi ({{newData.totalQuestions}} đã chọn)</label>
                <div class="questions-list" style="max-height: 300px; overflow-y: auto; border: 1.5px solid #e2e8f0; border-radius: 16px; background: #f8fafc;">
                  <div *ngFor="let q of questions"
                       (click)="toggleQuestion(q.id!)"
                       [style.background]="isQuestionSelected(q.id!) ? '#eff6ff' : 'white'"
                       [style.border-left]="isQuestionSelected(q.id!) ? '4px solid var(--primary)' : '4px solid transparent'"
                       style="display: flex; gap: 12px; align-items: center; padding: 12px 16px; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: all 0.15s;">
                    <div [style.background]="isQuestionSelected(q.id!) ? 'var(--primary)' : '#e2e8f0'"
                         [style.border]="isQuestionSelected(q.id!) ? '2px solid var(--primary)' : '2px solid #cbd5e1'"
                         style="width: 20px; height: 20px; border-radius: 5px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.15s;">
                      <span *ngIf="isQuestionSelected(q.id!)" style="color: white; font-size: 13px; font-weight: 900;">&#10003;</span>
                    </div>
                    <span style="font-size: 0.9rem; font-weight: 500; color: #374151; line-height: 1.4;">{{ q.content }}</span>
                  </div>
                  <div *ngIf="questions.length === 0" style="padding: 2rem; text-align: center; color: #94a3b8;">Chưa có câu hỏi nào trong hệ thống</div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" (click)="toggleForm()" class="btn-premium btn-ghost">Hủy thao tác</button>
              <button type="button" (click)="save()" class="btn-premium btn-primary" [disabled]="loading">
                {{ loading ? 'Đang xử lý...' : (editingId ? 'Cập nhật cấu hình' : 'Xuất bản đề thi') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="exam-grid">
        <div class="premium-card exam-card" *ngFor="let e of exams" (click)="edit(e)" style="cursor: pointer;">
          <div class="flex-between" style="margin-bottom: 1.5rem;">
            <span class="badge badge-green">{{ e.status }}</span>
            <div class="action-btns">
              <button (click)="preview(e, $event)" class="btn-premium" title="Xem trước" style="background: #f0fdf4; color: #16a34a; padding: 0.4rem 0.8rem; font-size: 0.75rem; border: none;">
                <i class="fas fa-eye"></i> Xem trước
              </button>
              <button (click)="edit(e, $event)" class="btn-premium" style="background: #e0f2fe; color: #0284c7; padding: 0.4rem 0.8rem; font-size: 0.75rem; border: none;">
                <i class="fas fa-edit"></i> Sửa
              </button>
              <button (click)="delete(e.id!, $event)" class="btn-premium" style="background: #fee2e2; color: #ef4444; padding: 0.4rem 0.8rem; font-size: 0.75rem; border: none;">
                <i class="fas fa-trash"></i> Xóa
              </button>
            </div>
          </div>
          <h3 class="exam-title">{{ e.title }}</h3>
          <p class="exam-desc">{{ e.description || 'Bài thi trắc nghiệm kiến thức tổng hợp.' }}</p>
          <div class="exam-meta">
            <div class="meta-item">
              <span class="meta-label">Thời gian</span>
              <span class="meta-value"><i class="far fa-clock"></i> {{ e.duration }} phút</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Số câu hỏi</span>
              <span class="meta-value"><i class="far fa-question-circle"></i> {{ e.totalQuestions }} câu</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .exam-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem; }
    .exam-card { border-top: 8px solid var(--primary) !important; padding: 2.5rem !important; background: white; border: 1px solid #f1f5f9; }
    .exam-title { font-size: 1.5rem; font-weight: 800; color: #1e293b; margin-bottom: 0.75rem; }
    .exam-desc { color: #64748b; font-size: 0.95rem; margin-bottom: 2rem; flex: 1; min-height: 3rem; }
    .exam-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding-top: 1.5rem; border-top: 1px solid #f1f5f9; }
    .meta-item { display: flex; flex-direction: column; gap: 4px; }
    .meta-label { font-size: 0.7rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
    .meta-value { font-weight: 700; color: #1e293b; }
    .meta-value i { color: var(--primary); margin-right: 6px; }
    .action-btns { display: flex; gap: 0.5rem; }
    .questions-list { max-height: 250px; overflow-y: auto; padding: 1rem; border: 1px solid #e2e8f0; border-radius: 14px; display: flex; flex-direction: column; gap: 0.5rem; background: #f8fafc; }
    .question-checkbox-item { display: flex; gap: 1rem; align-items: center; padding: 0.75rem; border-radius: 10px; background: white; border: 1px solid #f1f5f9; font-size: 0.95rem; font-weight: 500; }
  `]
})
export class AdminExamsComponent implements OnInit {
  private quizService = inject(QuizService);
  private router = inject(Router);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private baseUrl = environment.apiUrl;

  exams: Exam[] = [];
  questions: Question[] = [];
  showForm = false;
  editingId: number | null = null;
  newData: Exam = this.getEmptyExam();
  loading = false;

  ngOnInit() {
    this.load();
    this.loadQuestions();
  }

  load() {
    this.quizService.getExams().subscribe({
      next: (data) => {
        this.exams = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load exams:', err)
    });
  }

  loadQuestions() {
    this.quizService.getQuestions().subscribe({
      next: (data) => {
        this.questions = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load questions:', err)
    });
  }

  getEmptyExam(): Exam {
    return { title: '', description: '', duration: 60, totalQuestions: 0, status: 'DRAFT', questionIds: [] };
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) this.resetForm();
  }

  resetForm() {
    this.editingId = null;
    this.newData = this.getEmptyExam();
  }

  isQuestionSelected(questionId: number): boolean {
    const id = Number(questionId);
    return this.newData.questionIds?.some(qid => Number(qid) === id) || false;
  }

  toggleQuestion(questionId: number) {
    const id = Number(questionId);
    const ids = (this.newData.questionIds || []).map(n => Number(n));
    this.newData.questionIds = ids.includes(id)
      ? ids.filter(existingId => existingId !== id)
      : [...ids, id];
    this.newData.totalQuestions = this.newData.questionIds.length;
    this.cdr.detectChanges();
  }

  save() {
    if (!this.newData.title?.trim()) {
      alert('Vui lòng nhập tiêu đề đề thi');
      return;
    }
    this.newData.totalQuestions = this.newData.questionIds?.length || 0;
    
    this.loading = true;
    this.cdr.detectChanges();

    if (this.editingId) {
        this.quizService.updateExam(this.editingId, this.newData).subscribe({
          next: () => {
            alert('Cập nhật đề thi thành công!');
            this.load();
            this.toggleForm();
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Update exam failed:', err);
            alert('Lỗi cập nhật: ' + (err.error?.message || err.statusText || 'Lỗi không xác định'));
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
    } else {
        this.quizService.createExam(this.newData).subscribe({
          next: () => {
            alert('Xuất bản đề thi thành công!');
            this.load();
            this.toggleForm();
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Create exam failed:', err);
            alert('Lỗi tạo đề thi: ' + (err.error?.message || err.statusText || 'Lỗi không xác định'));
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
    }
  }

  preview(e: Exam, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/quiz/take', e.id]);
  }

  edit(e: Exam, event?: Event) {
    if (event) event.stopPropagation();
    this.editingId = e.id!;
    this.newData = { ...e, questionIds: [...(e.questionIds || [])] };
    this.showForm = true;
  }

  delete(id: number, event: Event) {
    event.stopPropagation();
    if (confirm('Bạn có chắc muốn xóa đề thi này không?')) {
        this.quizService.deleteExam(id).subscribe({
          next: () => {
            alert('Xóa đề thi thành công!');
            this.load();
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Delete exam failed:', err);
            alert('Lỗi khi xóa: ' + (err.error?.message || err.statusText || 'Lỗi không xác định'));
          }
        });
    }
  }
}
