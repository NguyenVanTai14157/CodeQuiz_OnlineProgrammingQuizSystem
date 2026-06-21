import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout.component';
import { AdminDashboardComponent } from './dashboard.component';
import { AdminUsersComponent } from './users.component';
import { AdminSubjectsComponent } from './subjects.component';
import { AdminQuestionsComponent } from './questions.component';
import { AdminExamsComponent } from './exams.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', component: AdminDashboardComponent, pathMatch: 'full' },
      { path: 'users', component: AdminUsersComponent },
      { path: 'subjects', component: AdminSubjectsComponent },
      { path: 'questions', component: AdminQuestionsComponent },
      { path: 'exams', component: AdminExamsComponent }
    ]
  }
];
