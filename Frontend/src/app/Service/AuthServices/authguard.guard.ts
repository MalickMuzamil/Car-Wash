import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthguardGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

    const role = localStorage.getItem('role');
    const allowedRole = route.data['role'] || '';

    if (role === allowedRole) {
      return true;
    }

    else {
      this.router.navigate(['/']);
      return false;
    }
  }
}
