import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../Service/AuthServices/auth.service';
import { Router } from '@angular/router';
import { GeneralServiceService } from '../../Service/GeneralService/general-service.service';

@Component({
  selector: 'app-category',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent {
  AddCategory!: FormGroup
  loading = false;
  show: boolean = false;
  submitted = false;
  categories: any[] = [];
  errorMessage: string = '';
  icon: any;
  file: any;
  CompanyId: any;
  companies: any[] = [];
  selectedCategory: any = {};

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private generalService: GeneralServiceService) { }

  ngOnInit(): void {
    this.AddCategory = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      file: ['']
    });

    const savedCompany = localStorage.getItem('CompanyId');
    if (savedCompany) {
      this.CompanyId = savedCompany
    }

    this.fetchCategories();
  }

  get error(): { [key: string]: AbstractControl } {
    return this.AddCategory.controls
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

  deleteCompany(categoryId: string, CompanyId: string): void {
    console.log('categoryId ID:', categoryId);
    console.log('Company ID:', CompanyId);
    console.log(`Requesting DELETE: category/${categoryId}?companyId=${CompanyId}`);

    this.generalService.confirmDialog('Are you sure?', 'You won\'t be able to revert this!')
      .then((isConfirmed) => {
        if (isConfirmed) {
          this.authService.delete(`category/${categoryId}?companyId=${CompanyId}`).subscribe({
            next: (response: any) => {
              console.log('Service deleted successfully:', response);
              this.generalService.showMessage('success', response.message);
              this.fetchCategories();
            },
            error: (error) => {
              console.error('Error deleting service:', error);
              this.generalService.showMessage('error', error);
            }
          });
        }
      });
  }

  updateCategory(): void {
    const formData = new FormData();

    const companyId = localStorage.getItem('CompanyId');
    const categoryId = localStorage.getItem('categoryId');

    if (!companyId || !categoryId) {
      console.log('Company ID or Category ID not found in local storage');
      return;
    }

    formData.append('companyId', companyId);
    formData.append('categoryId', categoryId);
    formData.append('categoryName', this.AddCategory.get('name')?.value);
    formData.append('description', this.AddCategory.get('description')?.value);

    if (this.file) {
      console.log('ye this.file ha', this.file);
      formData.append('file', this.file);
    }

    this.authService.patch(`category`, formData).subscribe({
      next: (response: any) => {
        console.log('Category updated successfully:', response);
        this.generalService.showMessage('success', response.message);
        this.fetchCategories();
      },
      error: (error: any) => {
        console.error('Error updating category:', error);
        this.generalService.showMessage('error', 'Failed to update category!');
      }
    });
  }

  fetchCategories(): void {
    this.loading = true;
    const companyID = localStorage.getItem('CompanyId')
    console.log(companyID)

    this.authService.get(`category?companyId=${companyID}`).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.categories = response.data;
        console.log('Fetched categories: ', this.categories);
        this.generalService.showMessage('success', response.message);
      },
      error: (error: any) => {
        this.loading = false;
        this.errorMessage = 'Error fetching categories';
        console.error('Error: ', error);
      },

    });

  }

  fetchCompanyData(index: number): void {
    let category = this.categories[index];
    this.CompanyId = category?._id;

    if (category?._id) {
      localStorage.setItem('categoryId', category._id);
    }

    this.AddCategory.patchValue({
      name: category?.name || '',
      description: category?.description || ''
    });

    console.log("Updated Form Values:", this.AddCategory.value);
  }

  onSubmit() {
    this.submitted = true;
    this.loading = true;

    if (this.AddCategory.invalid) {
      console.error("Form is invalid:", this.AddCategory.value);
      this.loading = false;
      return;
    }

    const companyId = localStorage.getItem('CompanyId');

    if (!companyId) {
      console.error('Company ID not found in localStorage!');
      this.loading = false;
      return;
    }

    const formData = new FormData();
    formData.append('name', this.AddCategory.get('name')?.value);
    formData.append('description', this.AddCategory.get('description')?.value);
    formData.append('companyId', companyId);

    if (this.file) {
      console.log('ye this.file ha', this.file)
      formData.append('file', this.file);
    }

    else {
      console.log('No file selected');
      this.loading = false;
      return;
    }

    this.authService.post('category', formData).subscribe({
      next: (res: any) => {
        if (res.status === 200) {
          console.log('Category added successfully!');
          this.generalService.showMessage('success', res.message);
          this.fetchCategories();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error while submitting form:', err);
        this.generalService.showMessage('error', err.message);
        this.loading = false;
      }
    });
  }

  selectCompany(company: any): void {
    this.CompanyId = company;
    console.log("Selected Company ID:", company._id);
    localStorage.setItem('CompanyId', company._id.toString());
  }

}
