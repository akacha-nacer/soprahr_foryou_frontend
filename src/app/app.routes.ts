import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import {AppComponent} from './app.component';
import {NavbarComponent} from './navbar/navbar.component';
import {EmbaucheComponent} from './embauche/embauche.component';
import {MaladieComponent} from './maladie/maladie.component';

export const routes: Routes = [
  { path: 'auth', component: LoginComponent },
    { path: 'embauche',component:EmbaucheComponent},
  { path: 'maladie',component:MaladieComponent},
  { path: '', redirectTo: 'auth', pathMatch: 'full' }
];
