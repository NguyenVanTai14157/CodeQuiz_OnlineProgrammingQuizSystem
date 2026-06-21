import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Subject, Question, Exam, ExamSubmission, ExamResult } from '../../models/quiz.model';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  
  // For guest review
  public lastResult: any = null;
  public lastExam: any = null;
  public lastUserAnswers: any[] = [];

  // Subjects
  getSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.baseUrl}/subjects`);
  }
  createSubject(subject: Subject): Observable<Subject> {
    return this.http.post<Subject>(`${this.baseUrl}/subjects`, subject);
  }
  updateSubject(id: number, subject: Subject): Observable<Subject> {
    return this.http.put<Subject>(`${this.baseUrl}/subjects/${id}`, subject);
  }
  deleteSubject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/subjects/${id}`);
  }

  // Questions
  getQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.baseUrl}/questions`);
  }
  getQuestionsBySubject(subjectId: number): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.baseUrl}/questions/subject/${subjectId}`);
  }
  getQuestionById(id: number): Observable<Question> {
    return this.http.get<Question>(`${this.baseUrl}/questions/${id}`);
  }
  createQuestion(question: Question): Observable<Question> {
    return this.http.post<Question>(`${this.baseUrl}/questions`, question);
  }
  updateQuestion(id: number, question: Question): Observable<Question> {
    return this.http.put<Question>(`${this.baseUrl}/questions/${id}`, question);
  }
  deleteQuestion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/questions/${id}`);
  }

  // Exams
  getExams(): Observable<Exam[]> {
    return this.http.get<Exam[]>(`${this.baseUrl}/exams`);
  }
  getPublishedExams(): Observable<Exam[]> {
    return this.http.get<Exam[]>(`${this.baseUrl}/exams/published`);
  }
  getExamById(id: number): Observable<Exam> {
    return this.http.get<Exam>(`${this.baseUrl}/exams/${id}`);
  }
  getExamWithQuestions(id: number): Observable<Exam> {
    return this.getExamById(id);
  }
  createExam(exam: Exam): Observable<Exam> {
    return this.http.post<Exam>(`${this.baseUrl}/exams`, exam);
  }
  updateExam(id: number, exam: Exam): Observable<Exam> {
    return this.http.put<Exam>(`${this.baseUrl}/exams/${id}`, exam);
  }
  deleteExam(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/exams/${id}`);
  }
  submitExam(submission: ExamSubmission): Observable<ExamResult> {
    return this.http.post<ExamResult>(`${this.baseUrl}/exams/submit`, submission);
  }
  getHistory(): Observable<ExamResult[]> {
    return this.http.get<ExamResult[]>(`${this.baseUrl}/exams/history`);
  }
}
