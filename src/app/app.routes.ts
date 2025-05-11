import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import {AppComponent} from './app.component';

export const routes: Routes = [
  { path: 'auth', component: LoginComponent },
  { path: 'welcome',component:AppComponent},
  { path: '', redirectTo: 'auth', pathMatch: 'full' }
];
