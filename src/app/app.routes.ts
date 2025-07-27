import {CanActivateFn, Router, Routes} from '@angular/router';
import { LoginComponent } from './login/login.component';
import {AppComponent} from './app.component';
import {NavbarComponent} from './navbar/navbar.component';
import {EmbaucheComponent} from './embauche/embauche.component';
import {MaladieComponent} from './maladie/maladie.component';
import {JourneeComponent} from './journee/journee.component';
import {EspaceManagerComponent} from './espace-manager/espace-manager.component';
import {inject} from '@angular/core';
import {GestionnairePageComponent} from './gestionnaire-page/gestionnaire-page.component';

const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const storedUser = sessionStorage.getItem('user');
  if (storedUser) {
    console.log('AuthGuard: User is logged in');
    return true;
  } else {
    console.warn('AuthGuard: No user in sessionStorage, redirecting to /4you/auth');
    router.navigate(['/4you/auth']);
    return false;
  }
};

const roleGuard: CanActivateFn = () => {
  const router = inject(Router);
  const storedUser = sessionStorage.getItem('user');
  let userRole: string | null = null;

  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      userRole = user.role !== undefined && user.role !== null ? user.role : null;
      console.log('RoleGuard: userRole =', userRole);
    } catch (e) {
      console.error('RoleGuard: Error parsing user from sessionStorage:', e);
    }
  } else {
    console.warn('RoleGuard: No user in sessionStorage');
  }

  if (userRole === 'GESTIONNAIRE') {
    console.log('RoleGuard: Access granted to /4you/embauche');
    return true;
  } else {
    console.warn('RoleGuard: Access denied to /4you/embauche, redirecting to /4you/mon-espace');
    router.navigate(['/4you/mon-espace']);
    return false;
  }
};
export const routes: Routes = [
  { path: '4you/auth', component: LoginComponent },
  { path: '4you/embauche', component: EmbaucheComponent, canActivate: [authGuard, roleGuard] },
  { path: '4you/maladie', component: MaladieComponent, canActivate: [authGuard] },
  { path: '4you/journee', component: JourneeComponent, canActivate: [authGuard] },
  { path: '4you/mon-espace', component: EspaceManagerComponent, canActivate: [authGuard] },
  { path: '4you/espace-gestionnaire', component: GestionnairePageComponent, canActivate: [authGuard,roleGuard] },
  { path: '', redirectTo: '4you/auth', pathMatch: 'full' },
  { path: '**', redirectTo: '4you/auth' }
];
