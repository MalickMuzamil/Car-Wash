import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './Service/AuthServices/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'vehiclesService';
  constructor(private http: HttpClient, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    const token = localStorage.getItem('authToken');

    this.authService.validateToken().then((isValid) => {
      if (!isValid) {
        console.log('Token validation failed or no token found in app.component.ts.');
      }

      else {
        this.router.events.subscribe((value) => {
          if (value instanceof NavigationEnd) {
            if (this.authService.isLogin()) {
              this.authService.validateToken().then(value => {
                if (!value) {
                  this.router.navigate(['/']);
                }
              })
            }
          }
        });
      }
    })
  };


}