import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuizService } from '../../core/services/quiz.service';
import { Question, Subject, Answer } from '../../models/quiz.model';

@Component({
  selector: 'app-admin-questions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-slide-up">
      <div class="flex-between" style="margin-bottom: 2rem;">
        <div>
          <h1 class="section-title">Ngân hàng câu hỏi</h1>
          <p class="section-desc">Xây dựng bộ câu hỏi chất lượng cho các kỳ thi trắc nghiệm.</p>
        </div>
        <button class="btn-premium btn-primary" (click)="resetForm(); showForm = true">
          <i class="fas fa-plus"></i> {{ showForm ? 'Hủy' : 'Tạo câu hỏi' }}
        </button>
      </div>

      <!-- Premium Question Modal -->
      <div class="modal-overlay" *ngIf="showForm" (click)="$event.target === $event.currentTarget && toggleForm()">
        <div class="modal-content" style="max-width: 800px;">
          <div class="modal-header">
            <h3>{{ editingId ? 'Chỉnh sửa câu hỏi' : 'Tạo câu hỏi mới' }}</h3>
            <button class="btn-close" (click)="toggleForm()">✕</button>
          </div>

          <form (submit)="$event.preventDefault()">
            <div class="modal-body">
              <div class="form-row">
                <div class="input-group">
                  <label>Môn học mục tiêu</label>
                  <select [(ngModel)]="newData.subjectId" name="subject" required>
                    <option *ngFor="let s of subjects" [value]="s.id">{{ s.subjectName }}</option>
                  </select>
                </div>
                <div class="input-group">
                  <label>Mức độ thử thách</label>
                  <select [(ngModel)]="newData.difficultyLevel" name="difficulty" required>
                    <option value="EASY">Dễ (Easy)</option>
                    <option value="MEDIUM">Trung bình (Medium)</option>
                    <option value="HARD">Khó (Hard)</option>
                  </select>
                </div>
              </div>

              <div class="input-group" style="margin-bottom: 2rem;">
                <label>Nội dung câu hỏi trắc nghiệm</label>
                <textarea [(ngModel)]="newData.content" name="content" rows="3" required 
                          placeholder="Bạn muốn hỏi người dùng điều gì?"></textarea>
              </div>

              <div class="input-group">
                <label style="margin-bottom: 1rem; display: block;">Các phương án trả lời & Đáp án đúng</label>
                <div class="flex-column gap-1">
                  <div *ngFor="let ans of newData.answers; let i = index" class="answer-item">
                    <input type="radio" [name]="'correct'" [checked]="ans.isCorrect" (change)="setCorrect(i)" 
                           style="width: 22px; height: 22px; cursor: pointer; accent-color: var(--primary);">
                    <input type="text" [(ngModel)]="ans.answerContent" [name]="'ans'+i" placeholder="Nhập lựa chọn {{i+1}}" required
                           style="flex: 1; border: none; background: transparent; padding: 0.5rem; font-weight: 500;">
                    <button type="button" (click)="removeAnswer(i)" 
                            style="background: #fef2f2; color: #ef4444; border: none; padding: 8px; border-radius: 8px; cursor: pointer;">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
                <button type="button" (click)="addAnswer()" 
                        style="align-self: flex-start; margin-top: 1rem; background: #eff6ff; color: #2563eb; border: none; padding: 8px 16px; border-radius: 10px; font-weight: 700; cursor: pointer;">
                  <i class="fas fa-plus-circle"></i> Thêm phương án
                </button>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" (click)="toggleForm()" class="btn-premium btn-ghost">Đóng lại</button>
              <button type="button" (click)="save()" class="btn-premium btn-primary" [disabled]="loading">
                {{ loading ? 'Đang xử lý...' : (editingId ? 'Cập nhật câu hỏi' : 'Lưu vào ngân hàng') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Filters -->
      <div class="premium-card" style="padding: 1rem; margin-bottom: 2rem; border-left: none;">
        <div style="display: flex; align-items: center; gap: 1rem; overflow-x: auto; white-space: nowrap; padding-bottom: 0.5rem;">
          <span style="font-size: 0.8rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Bộ lọc:</span>
          <button (click)="filterSubject(0)" 
                  [style.background]="activeSubject === 0 ? 'var(--primary)' : 'white'"
                  [style.color]="activeSubject === 0 ? 'white' : 'var(--text-main)'"
                  style="padding: 0.5rem 1.2rem; border-radius: 30px; border: 1px solid #e2e8f0; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: 0.2s;">
            Tất cả
          </button>
          <button *ngFor="let s of subjects" (click)="filterSubject(s.id!)" 
                  [style.background]="activeSubject === s.id ? 'var(--primary)' : 'white'"
                  [style.color]="activeSubject === s.id ? 'white' : 'var(--text-main)'"
                  style="padding: 0.5rem 1.2rem; border-radius: 30px; border: 1px solid #e2e8f0; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: 0.2s;">
            {{ s.subjectName }}
          </button>
        </div>
      </div>

      <!-- Questions List -->
      <div class="flex-column gap-2">
        <div *ngFor="let q of filteredQuestions" class="premium-card animate-slide-up" style="border-left: 6px solid var(--primary);">
          <div class="flex-between" style="margin-bottom: 1rem;">
            <div style="display: flex; gap: 0.5rem;">
              <span class="badge badge-blue">{{ getSubjectName(q.subjectId) }}</span>
              <span [class.badge-green]="q.difficultyLevel === 'EASY'" [class.badge-yellow]="q.difficultyLevel === 'MEDIUM'" [class.badge-red]="q.difficultyLevel === 'HARD'" class="badge">
                {{ q.difficultyLevel }}
              </span>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <button (click)="edit(q)" class="btn-premium" style="background: #e0f2fe; color: #0284c7; padding: 0.4rem 0.8rem; font-size: 0.75rem; border: none;">
                <i class="fas fa-edit"></i> Sửa
              </button>
              <button (click)="delete(q.id!)" class="btn-premium" style="background: #fee2e2; color: #ef4444; padding: 0.4rem 0.8rem; font-size: 0.75rem; border: none;">
                <i class="fas fa-trash"></i> Xóa
              </button>
            </div>
          </div>

          <h3 style="font-size: 1.25rem; margin-bottom: 1.5rem; line-height: 1.5;">{{ q.content }}</h3>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <div *ngFor="let a of q.answers" 
                 [style.background]="a.isCorrect ? '#f0fdf4' : '#f8fafc'"
                 [style.border-color]="a.isCorrect ? '#10b981' : '#e2e8f0'"
                 style="padding: 1rem; border-radius: 12px; border: 1px solid; display: flex; gap: 0.75rem; align-items: flex-start;">
                <i class="fas" [class.fa-check-circle]="a.isCorrect" [class.fa-circle]="!a.isCorrect" 
                   [style.color]="a.isCorrect ? '#10b981' : '#cbd5e1'" style="margin-top: 3px;"></i>
                <span [style.font-weight]="a.isCorrect ? '700' : '400'" [style.color]="a.isCorrect ? '#065f46' : '#475569'"
                      style="font-size: 0.95rem;">{{ a.answerContent }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminQuestionsComponent implements OnInit {
  private quizService = inject(QuizService);
  private cdr = inject(ChangeDetectorRef);
  questions: Question[] = [];
  filteredQuestions: Question[] = [];
  subjects: Subject[] = [];
  showForm = false;
  activeSubject = 0;
  editingId: number | null = null;
  newData: Question = this.getEmptyQuestion();
  loading = false;

  ngOnInit() { 
    this.loadSubjects();
    this.loadQuestions();
  }

  loadSubjects() {
    this.quizService.getSubjects().subscribe(data => {
      this.subjects = data;
      this.cdr.detectChanges();
    });
  }

  loadQuestions() {
    this.quizService.getQuestions().subscribe(data => {
        this.questions = data;
        this.applyFilter();
        this.cdr.detectChanges();
    });
  }

  getEmptyQuestion(): Question {
    return { content: '', subjectId: 0, difficultyLevel: 'MEDIUM', answers: [
        { answerContent: '', isCorrect: true },
        { answerContent: '', isCorrect: false },
        { answerContent: '', isCorrect: false },
        { answerContent: '', isCorrect: false }
    ]};
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) this.resetForm();
  }

  resetForm() {
    this.editingId = null;
    this.newData = this.getEmptyQuestion();
  }

  addAnswer() {
    this.newData.answers.push({ answerContent: '', isCorrect: false });
  }

  removeAnswer(index: number) {
    this.newData.answers.splice(index, 1);
  }

  setCorrect(index: number) {
    this.newData.answers.forEach((ans, i) => ans.isCorrect = (i === index));
  }

  save() {
    if (!this.newData.content?.trim() || !this.newData.subjectId) {
      alert('Vui lòng nhập nội dung câu hỏi và chọn môn học');
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    if (this.editingId) {
        this.quizService.updateQuestion(this.editingId, this.newData).subscribe({
          next: () => {
            alert('Cập nhật câu hỏi thành công!');
            this.loadQuestions();
            this.toggleForm();
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Update question failed:', err);
            alert('Lỗi cập nhật: ' + (err.error?.message || err.statusText || 'Lỗi không xác định'));
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
    } else {
        this.quizService.createQuestion(this.newData).subscribe({
          next: () => {
            alert('Tạo câu hỏi thành công!');
            this.loadQuestions();
            this.toggleForm();
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Create question failed:', err);
            alert('Lỗi tạo mới: ' + (err.error?.message || err.statusText || 'Lỗi không xác định'));
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
    }
  }

  edit(q: Question) {
    this.editingId = q.id!;
    this.newData = JSON.parse(JSON.stringify(q));
    this.showForm = true;
  }

  delete(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')) {
        this.quizService.deleteQuestion(id).subscribe({
          next: () => {
            alert('Xóa câu hỏi thành công!');
            this.loadQuestions();
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Delete question failed:', err);
            alert('Lỗi khi xóa: ' + (err.error?.message || err.statusText || 'Lỗi không xác định'));
          }
        });
    }
  }

  filterSubject(id: number) {
    this.activeSubject = id;
    this.applyFilter();
  }

  applyFilter() {
    if (this.activeSubject === 0) {
        this.filteredQuestions = this.questions;
    } else {
        this.filteredQuestions = this.questions.filter(q => q.subjectId == this.activeSubject);
    }
  }

  getSubjectName(id: number) {
    return this.subjects.find(s => s.id == id)?.subjectName || 'Unknown';
  }
}
