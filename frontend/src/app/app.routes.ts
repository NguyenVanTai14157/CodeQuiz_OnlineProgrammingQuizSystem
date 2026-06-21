import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { SignupComponent } from './features/auth/signup.component';
import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { 
    path: 'admin', 
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES) 
  },
  { 
    path: 'quiz', 
    loadChildren: () => import('./features/quiz/quiz.routes').then(m => m.QUIZ_ROUTES) 
  },
];

