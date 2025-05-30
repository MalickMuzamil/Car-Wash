import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, lastValueFrom, Subject } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Router } from '@angular/router';
import { GeneralServiceService } from '../GeneralService/general-service.service';

const apiUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _isAuth = new BehaviorSubject<boolean>(false);
  loginStatus = false;
  private isShrink = new Subject<any>;
  isShrink$ = this.isShrink.asObservable();

  get isAuth() {
    return this._isAuth.asObservable();
  }

  constructor(private http: HttpClient, private router: Router, private generalService: GeneralServiceService) { }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  validateToken(): Promise<boolean> {
    return new Promise((resolve) => {
      const token = localStorage.getItem('authToken');

      if (token) {
        lastValueFrom(
          this.http.get(`${environment.apiUrl}validate`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
          .then((res: any) => {
            if (res.status == 200 && res.message === "Token is valid") {
              resolve(true);
            }

            else {
              localStorage.clear();
              this.router.navigate(['/login']);
              resolve(false);
            }
          })
          .catch((err: any) => {
            localStorage.clear();
            this.router.navigate(['/login']);
            resolve(false);
          });
      }
      else {
        localStorage.clear();
        this.router.navigate(['/login']);
        resolve(false);
      }
    });
  }

  navigateByRole() {
    const role = localStorage.getItem('role');

    const roleRouteMap: { [key: string]: string } = {
      admin: '/dashboard',
      manager: '/home',
    };

    if (role && roleRouteMap[role]) {
      this.router.navigate([roleRouteMap[role]]);
    }

    else {
      this.router.navigate(['/']);
    }
  }

  post(endpoint: string, body: any): Observable<any> {
    const token = this.getToken();

    if (token) {
      const headers = { Authorization: `Bearer ${token}` };
      return this.http.post(apiUrl + endpoint, body, { headers });
    }

    else {
      return this.http.post(apiUrl + endpoint, body);
    }
  }

  get(endpoint: string): Observable<any> {
    const token = this.getToken();

    if (token) {
      const headers = { Authorization: `Bearer ${token}` };
      return this.http.get(apiUrl + endpoint, { headers });
    }
    else {
      return this.http.get(apiUrl + endpoint);
    }
  }

  delete(endpoint: string): Observable<any> {
    const token = this.getToken();

    if (token) {
      const headers = { Authorization: `Bearer ${token}` };
      return this.http.delete(apiUrl + endpoint, { headers });
    }
    else {
      return this.http.delete(apiUrl + endpoint);
    }
  }

  patch(endpoint: string, data: any): Observable<any> {
    const token = this.getToken();
    const headers: any = { Authorization: `Bearer ${token}` };

    if (data instanceof FormData) {
      return this.http.patch(apiUrl + endpoint, data, { headers });
    }

    else {
      headers['Content-Type'] = 'application/json';
      return this.http.patch(apiUrl + endpoint, JSON.stringify(data), { headers });
    }
  }

  logout() {
    this.generalService.logout('success', 'You have successfully logged out.');
    localStorage.clear()
    this._isAuth.next(false);
    this.router.navigate(['/'])
  }

  setLoginStatus(v: boolean) {
    this.loginStatus = v;
  }

  isLogin() {
    return this.loginStatus;
  }

  toggleSidebar(): void {
    this.isShrink.next(true);
  }
}
