import { Component } from '@angular/core';
import { AuthService } from '../../../Service/AuthServices/auth.service';
import { GeneralServiceService } from '../../../Service/GeneralService/general-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forget',
  imports: [CommonModule, FormsModule],
  templateUrl: './forget.component.html',
  styleUrl: './forget.component.css'
})
export class ForgetComponent {
  userInput: string = '';
  isLoading = false;

  constructor(private authService: AuthService, private generalService: GeneralServiceService, private router: Router) {}

  onSubmit() {
    if (!this.userInput) {
      this.generalService.showMessage('error', 'Please enter a valid email!');
      return;
    }

    this.isLoading = true;
    this.authService.post('forgotpassword', { email: this.userInput }).subscribe({
      next: () => {
        this.generalService.showMessage('success', 'Reset link sent to your email!');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.generalService.showMessage('error', 'Reset Password Failed!');
        this.isLoading = false;
      }
    });
  }
}
