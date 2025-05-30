import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GeneralServiceService } from '../../Service/GeneralService/general-service.service';
import { AuthService } from '../../Service/AuthServices/auth.service';

@Component({
  selector: 'app-addservice',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './addservice.component.html',
  styleUrl: './addservice.component.css'
})
export class AddserviceComponent implements OnInit {
  AddService!: FormGroup
  loading = false;
  show: boolean = false;
  submitted = false;
  CompanyId: any;
  errorMessage: string = '';
  company_arr: any = [];
  category_arr: any = [];
  Services: any[] = [];
  UpdateServices: any[] = [];

  constructor(private fb: FormBuilder, private generalService: GeneralServiceService, private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.AddService = this.fb.group(
      {
        serviceName: ['', Validators.required],
        serviceDescription: ['', Validators.required],
        servicePrice: ['', [Validators.required, Validators.minLength(1)]],
        serviceTime: ['', Validators.required],
        companyId: [''],
      }
    );

    const savedCompany = localStorage.getItem('CompanyId');
    if (savedCompany) {
      this.CompanyId = savedCompany
      this.fetchService(this.CompanyId);
    }
    this.fetchCompanies();

  }

  get error(): { [key: string]: AbstractControl } {
    return this.AddService.controls
  }

  onSubmit(): void {
    console.log(this.AddService.value);

    if (this.AddService.invalid) {
      console.log("Form is invalid!");
      return;
    }

    const categoryId = localStorage.getItem('category');

    const formData = {
      ...this.AddService.value,
      category: categoryId
    };

    this.authService.post("service", formData).subscribe({
      next: (res: any) => {
        console.log("Service added successfully!", res);
        this.generalService.showMessage("success", res.message);
        this.fetchService(this.CompanyId)
      },
      error: (err) => {
        console.log("Error adding service:", err);
        this.generalService.showMessage("error", "Failed to add service.");
      },
    });
  }

  selectCompany(event: any): void {
    if (event.target.value != '') {
      this.fetchCategories(event.target.value);
    }
  }

  selectCategory(event: any): void {
    const selectedCategoryId = event.target.value;
    console.log("Selected Category ID:", selectedCategoryId);

    localStorage.setItem('category', selectedCategoryId);
  }

  fetchCategories(id: any): void {
    this.authService.get(`category?companyId=${id}`).subscribe({
      next: (response: any) => {
        console.log("Category API Response:", response);
        this.loading = false;
        this.category_arr = response.data;
      },
      error: (error: any) => {
        this.loading = false;
        this.generalService.showMessage('error', error.error);
        console.error("Category Fetch Error:", error);
      },
    });
  }

  fetchCompanies(): void {
    this.loading = true;
    this.authService.get('company').subscribe({
      next: (response: any) => {
        this.loading = false;
        this.company_arr = response.data;
        this.Services = response.data;
      },
      error: (error: any) => {
        this.loading = false;
        this.generalService.showMessage('success', error.message);
        this.errorMessage = 'Error fetching companies';
        console.error('Error: ', error);
      },

    });

  }

  fetchService(id: any): void {
    this.loading = true;
    this.authService.get(`service?companyId=${id}`).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.UpdateServices = response.data;
      },
      error: (error: any) => {
        this.loading = false;
        this.generalService.showMessage('error', 'No service Found');
        this.errorMessage = 'Error fetching services';
      },
    });
  }

  fetchServiceData(index: number): void {
    let service = this.UpdateServices[index];
    console.log('Selected Service:', service);

    if (!service) {
      this.generalService.showMessage('error', 'Service not found');
      return;
    }

    localStorage.setItem('categoryId', service?.categoryId);
    localStorage.setItem('serviceId', service?._id);

    this.AddService.patchValue({
      serviceName: service?.name || '',
      serviceDescription: service?.description || '',
      servicePrice: service?.price?.$numberDecimal || '',
      serviceTime: service?.time || '',
    });

    console.log("Updated Service Form Values:", this.AddService.value);
  }

  updateCompany(): void {
    if (this.AddService.invalid) {
      console.log("Form is invalid!");
      return;
    }

    const companyId = localStorage.getItem('CompanyId');
    const categoryId = localStorage.getItem('categoryId');
    const serviceId = localStorage.getItem('serviceId');

    if (!companyId || !categoryId) {
      console.error("Company ID or Category ID is missing!");
      this.generalService.showMessage('error', 'Company ID or Category ID is missing');
      return;
    }

    const updatedServiceData = {
      ...this.AddService.value,
      serviceId: serviceId,
      companyId: companyId,
      categoryId: categoryId
    };

    this.authService.patch(`service`, updatedServiceData).subscribe({
      next: (response: any) => {
        console.log('Company updated successfully:', response);
        this.generalService.showMessage('success', response.message);
        this.fetchService(this.CompanyId);
      },
      error: (error: any) => {
        console.error('Error updating company:', error);
        this.generalService.showMessage('error', error.error);
      }
    });
  }

  deleteCompany(serviceId: string, companyId: string): void {
    console.log('Service ID:', serviceId);
    console.log('Company ID:', companyId);
    console.log(`Requesting DELETE: service/${serviceId}?companyId=${companyId}`);

    this.generalService.confirmDialog('Are you sure?', 'You won\'t be able to revert this!')
      .then((isConfirmed) => {
        if (isConfirmed) {
          this.authService.delete(`service/${serviceId}?companyId=${companyId}`).subscribe({
            next: (response: any) => {
              console.log('Service deleted successfully:', response);
              this.generalService.showMessage('success', response.message);
              this.fetchService(companyId);
            },
            error: (error) => {
              console.error('Error deleting service:', error);
              this.generalService.showMessage('error', error);
            }
          });
        }
      });
  }


}
