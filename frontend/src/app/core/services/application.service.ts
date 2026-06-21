import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface Application {
  id: number;
  status: string;
  [key: string]: unknown;
}

interface Interview {
  id: number;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/applications`;

  apply(jobId: number, coverLetter: string): Observable<Application> {
    return this.http.post<Application>(`${this.apiUrl}/apply`, { jobId, coverLetter });
  }

  getMyApplications(): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.apiUrl}/my`);
  }

  getRecruiterApplications(): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.apiUrl}/recruiter`);
  }

  updateStatus(id: number, status: string): Observable<Application> {
    return this.http.put<Application>(`${this.apiUrl}/${id}/status`, { status });
  }

  // Interview logic often linked here or in a separate InterviewService
  scheduleInterview(interviewData: any): Observable<Interview> {
    return this.http.post<Interview>(`${environment.apiUrl}/interviews`, interviewData);
  }

  getInterviews(): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${environment.apiUrl}/interviews/my`);
  }
}
