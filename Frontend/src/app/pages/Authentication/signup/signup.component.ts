import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../Service/AuthServices/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GeneralServiceService } from '../../../Service/GeneralService/general-service.service';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {

  RegisterForm !: FormGroup
  submitted = false;
  loading = false;
  show: Boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private generalService: GeneralServiceService) { }


  ngOnInit(): void {

    this.RegisterForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(5)]],
        email: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)]],
        password: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(8)]]
      }
    );
  }

  get error(): { [key: string]: AbstractControl } {
    return this.RegisterForm.controls
  }

  onSubmit() {
    this.submitted = true;
    if (this.RegisterForm.invalid) {
      this.loading = false;
    }
    else {
      this.authService.post('register', this.RegisterForm.value).subscribe({
        next: (res: any) => {
          const role = localStorage.getItem('role');

          if (res.status === 201) {
            if (res.auth_token) {
              localStorage.setItem('authToken', res.auth_token);
              localStorage.setItem('role', res.data?.role);

              if (role === res.data?.role) {
                this.authService.setLoginStatus(true);
                this.generalService.showMessage('success', 'User successfully Created!');
                this.router.navigate(['/dashboard']);
              }
            }
          }
        },
        error: (err) => {
          this.generalService.showMessage('error', 'SignUp Failed !!');
          console.log(err);
        }
      });
    }
  }

  checkpassword() {
    this.show = !this.show;
  }
}
