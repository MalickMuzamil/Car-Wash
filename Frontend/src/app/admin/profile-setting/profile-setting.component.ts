import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../Service/AuthServices/auth.service';
import { GeneralServiceService } from '../../Service/GeneralService/general-service.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-profile-setting',
  templateUrl: './profile-setting.component.html',
  styleUrl: './profile-setting.component.css',
  imports: [ReactiveFormsModule, CommonModule],
})
export class ProfileSettingComponent {
  profileForm!: FormGroup;
  loading = false;
  submitted = false;
  errorMessage: string = '';
  file: any;
  imageUrl: string | ArrayBuffer | null = '';


  constructor(private fb: FormBuilder, private authService: AuthService, private generalService: GeneralServiceService) { }

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      zip: ['', Validators.required],
      city: ['', Validators.required],
      street: ['', Validators.required],
      file: ['']
    });

    this.fetchProfile();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => this.imageUrl = e.target?.result as string | ArrayBuffer;
      reader.readAsDataURL(file);
    }
  }

  get error(): { [key: string]: AbstractControl } {
    return this.profileForm.controls;
  }

  fetchProfile(): void {
    this.loading = true;

    this.authService.get('meta-data').subscribe({
      next: (response: any) => {
        this.loading = false;

        if (response) {
          this.profileForm.patchValue({
            fullName: response?.data.name || '',
            phone: response?.data.phone || '',
            city: response?.data.city || '',
            street: response?.data.street || '',
            zip: response?.data.zip || '',
            email: response?.data.email || ''
          });

          this.file = response?.data.profile_image
            ? `${environment.apiUrl}${response.data.profile_image}` : null;
          console.log("Profile Image Path: ", this.file);
        }
      },
      error: (error: any) => {
        this.loading = false;
        this.errorMessage = 'Error fetching profile data';
        console.error('Error: ', error);
      }
    });
  }

  handleFileSelect(evt: any): void {
    const files = evt.target.files;
    if (files.length > 0) {
      const file = files[0];

      const reader = new FileReader();
      reader.onload = (event: any) => {
        const arrayBuffer = event.target.result as ArrayBuffer;
        const binaryData = new Uint8Array(arrayBuffer);

        console.log('Binary Data:', binaryData);
        this.file = new File([binaryData], file.name, { type: file.type });
      };

      reader.readAsArrayBuffer(file);
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.loading = true;

    if (this.profileForm.invalid) {
      console.log('Form is invalid!');
      this.loading = false;
      return;
    }

    const formData = new FormData();

    formData.append('fullName', this.profileForm.get('fullName')?.value);
    formData.append('email', this.profileForm.get('email')?.value);
    formData.append('phone', this.profileForm.get('phone')?.value);
    formData.append('city', this.profileForm.get('city')?.value);
    formData.append('street', this.profileForm.get('street')?.value);
    formData.append('zip', this.profileForm.get('zip')?.value);

    if (this.file) {
      console.log('ye this.file ha', this.file);
      formData.append('file', this.file);
    }

    else {
      console.log('No file selected, sending empty string');
    }

    this.authService.patch('meta-data', formData).subscribe({
      next: (res: any) => {
        if (res.status === 200) {
          console.log('User profile updated successfully!');
          this.generalService.showMessage('success', res.message);
        }
        this.loading = false;
      },
      error: (err) => {
        this.generalService.showMessage('error', err.message || 'Profile Update Failed!');
        console.log('Error submitting form:', err);
        this.loading = false;
      }
    });
  }

}
