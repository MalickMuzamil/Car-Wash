import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../Service/AuthServices/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-restpassword',
  imports: [FormsModule],
  templateUrl: './restpassword.component.html',
  styleUrl: './restpassword.component.css'
})
export class RestpasswordComponent {
  newPassword: String = '';
  confirmPassword: String = '';
  token?: string;
  errorMessage: String = '';
  isLoading = false;


  constructor(private route: ActivatedRoute, private router: Router, private authServices: AuthService) { }

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'];

    console.log("Token from URL:", this.token);
    if (!this.token) {
      // this.router.navigate(['/login']);
      console.log('TOken nahi mila ')
    }
  }

  onSubmit(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
  }

  onUpdatePassword() {
  this.isLoading = true;
  
  if (!this.token) {
    this.errorMessage = "Invalid or expired token.";
    this.isLoading = false;
    return;
  }

  this.authServices.post('update-password', { token: this.token, newPassword: this.newPassword }).subscribe({
    next: (res: any) => {
      console.log("Password Updated Successfully:", res);
      this.router.navigate(['/login']); 
    },
    error: (err) => {
      console.log("Error:", err);
      this.errorMessage = "Failed to update password. Please try again.";
      this.isLoading = false;
    }
  });
}

}
