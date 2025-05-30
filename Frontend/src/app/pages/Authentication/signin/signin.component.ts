import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../Service/AuthServices/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GeneralServiceService } from '../../../Service/GeneralService/general-service.service';

@Component({
  selector: 'app-signin',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent {

  LoginInForm!: FormGroup
  loading = false;
  show: boolean = false;
  submitted = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private generalService: GeneralServiceService) { }

  ngOnInit(): void {
    this.LoginInForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)]],
        password: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(8)]]
      }
    );
  }

  get error(): { [key: string]: AbstractControl } {
    return this.LoginInForm.controls
  }

  onSubmit() {
    this.submitted = true;
    if (this.LoginInForm.invalid) {
      this.loading = false;
    }

    else {
      this.authService.post('login', this.LoginInForm.value).subscribe({
        next: (res: any) => {

          if (res.status === 200) {
            if (res.token && res.user)
              localStorage.setItem('authToken', res.token);
            localStorage.setItem('role', res.user?.role);
            this.authService.setLoginStatus(true)
            this.generalService.showMessage('success', 'Login successfully!');
            this.authService.navigateByRole();

          }
        },
        error: (err) => {
          this.generalService.showMessage('error', 'Login Failed !!');
          console.log(err);
        }
      })
    }
  }

  checkpassword() {
    this.show = !this.show;
  }
}
