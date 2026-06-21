import { Routes } from '@angular/router';
import { QuizListComponent } from './quiz-list.component';
import { TakeQuizComponent } from './take-quiz.component';
import { QuizResultComponent } from './quiz-result.component';
import { QuizHistoryComponent } from './quiz-history.component';

export const QUIZ_ROUTES: Routes = [
  { path: '', component: QuizListComponent, pathMatch: 'full' },
  { path: 'history', component: QuizHistoryComponent },
  { path: 'take/:id', component: TakeQuizComponent },
  { path: 'result/:id', component: QuizResultComponent },
];
