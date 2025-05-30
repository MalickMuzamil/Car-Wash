import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../Service/AuthServices/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {

  isShrink: boolean = false;
  constructor(private AuthService: AuthService) { }

  ngOnInit(): void {
    this.AuthService.isShrink$.subscribe((isShrink) => {
      this.isShrink = isShrink;
    });
  }

  toggleSidebar(): void {
    this.AuthService.toggleSidebar();
  }

  logout() {
    this.AuthService.logout()
  }
}
