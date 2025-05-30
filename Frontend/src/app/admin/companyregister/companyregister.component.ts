import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../Service/AuthServices/auth.service';
import { GeneralServiceService } from '../../Service/GeneralService/general-service.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-companyregister',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './companyregister.component.html',
  styleUrls: ['./companyregister.component.css']
})
export class CompanyregisterComponent {
  AddCompany!: FormGroup;
  loading = false;
  submitted = false;
  file: any;
  companies: any[] = [];
  errorMessage: string = '';
  companyId: any;
  selectedCompany: any = {};

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private generalService: GeneralServiceService) { }

  ngOnInit(): void {
    this.AddCompany = this.fb.group({
      id: [''],
      companyName: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)]],
      phone: ['', [Validators.required, Validators.minLength(10), Validators.pattern('^[0-9]+$')]],
      city: ['', Validators.required],
      street: ['', Validators.required],
      zip: ['', Validators.required],
      description: ['', Validators.required],
      file: ['', Validators.required],
    });

    this.fetchCompanies();
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

  get error(): { [key: string]: AbstractControl } {
    return this.AddCompany.controls;
  }

  fetchCompanies(): void {
    this.loading = true;
    this.authService.get('company').subscribe({
      next: (response: any) => {
        this.loading = false;
        this.companies = response.data;
        console.log('Fetched companies: ', this.companies);
      },
      error: (error: any) => {
        this.loading = false;
        this.errorMessage = 'Error fetching companies';
        console.error('Error: ', error);
      },

    });

  }

  deleteCompany(companyId: string): void {
    this.generalService.confirmDialog('Are you sure?', 'You won\'t be able to revert this!')
      .then((isConfirmed) => {
        if (isConfirmed) {
          this.authService.delete(`company/${companyId}`).subscribe({
            next: (response: any) => {
              console.log('Company deleted successfully:', response);
              this.generalService.showMessage('success', 'Company deleted successfully!');
              this.fetchCompanies();
            },
            error: (error) => {
              console.error('Error deleting company:', error);
              this.generalService.showMessage('error', 'Failed to delete company!');
            }
          });
        }
      });
  }

  updateCompany(): void {
    const formData = new FormData();

    const companyId = localStorage.getItem('CompanyId');
    if (companyId) {
      formData.append('companyId', companyId);
    }

    else {
      console.log('No company ID found in local storage');
      return;
    }

    formData.append('companyName', this.AddCompany.get('companyName')?.value);
    formData.append('email', this.AddCompany.get('email')?.value);
    formData.append('phone', this.AddCompany.get('phone')?.value);
    formData.append('city', this.AddCompany.get('city')?.value);
    formData.append('street', this.AddCompany.get('street')?.value);
    formData.append('zip', this.AddCompany.get('zip')?.value);
    formData.append('description', this.AddCompany.get('description')?.value);

    if (this.file) {
      console.log('ye this.file ha', this.file)
      formData.append('file', this.file);
    }

    else {
      console.log('No file selected');
      this.loading = false;
      return;
    }

    this.authService.patch(`company`, formData).subscribe({
      next: (response: any) => {
        console.log('Company updated successfully:', response);
        this.generalService.showMessage('success', response.message);
        this.fetchCompanies();
      },
      error: (error: any) => {
        console.error('Error updating company:', error);
        this.generalService.showMessage('error', error.error);
      }
    });
  }

  fetchCompanyData(index: number): void {
    let company = this.companies[index];
    this.companyId = company?._id;
    this.file = company?.logo;

    this.selectedCompany = {
      companyName: company?.company_name,
      email: company?.email,
      phone: company?.phone,
      city: company?.city,
      street: company?.street,
      zip: company?.zip,
      description: company?.description,
      logo: company?.logo ? `${environment.apiUrl}${company.logo}` : ''
    };

    this.AddCompany.patchValue(this.selectedCompany);
  }

  onSubmit(): void {
    this.submitted = true;
    this.loading = true;

    if (this.AddCompany.invalid) {
      console.log('Form is invalid!');
      this.loading = false;
      return;
    }

    else {

      const formData = new FormData();

      formData.append('companyName', this.AddCompany.get('companyName')?.value);
      formData.append('email', this.AddCompany.get('email')?.value);
      formData.append('phone', this.AddCompany.get('phone')?.value);
      formData.append('city', this.AddCompany.get('city')?.value);
      formData.append('street', this.AddCompany.get('street')?.value);
      formData.append('zip', this.AddCompany.get('zip')?.value);
      formData.append('description', this.AddCompany.get('description')?.value);

      if (this.file) {
        console.log('ye this.file ha', this.file)
        formData.append('file', this.file);
      }

      else {
        console.log('No file selected');
        this.loading = false;
        return;
      }

      this.authService.post('company-profile', formData).subscribe({
        next: (res: any) => {
          if (res.status === 201) {
            console.log('Company form submitted successfully!');
            if (res.data && res.data.companyId && res.data.companyName) {
              localStorage.setItem('companyId', res.data.companyId);
              localStorage.setItem('companyName', res.data.companyName);

              this.generalService.showMessage('success', res.message);
            }
          }
          this.loading = false;
        },
        error: (err) => {
          this.generalService.showMessage('error', err);
          console.log('Error submitting form:', err);
          this.loading = false;
        }
      });
    }
  }

}
