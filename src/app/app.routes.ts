import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import {AppComponent} from './app.component';
import {NavbarComponent} from './navbar/navbar.component';
import {EmbaucheComponent} from './embauche/embauche.component';

export const routes: Routes = [
  { path: 'auth', component: LoginComponent },
    { path: 'welcome',component:EmbaucheComponent},
  { path: '', redirectTo: 'auth', pathMatch: 'full' }
];
