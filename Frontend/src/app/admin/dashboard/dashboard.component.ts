import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../Service/AuthServices/auth.service';
import { CommonModule } from '@angular/common';
import { GeneralServiceService } from '../../Service/GeneralService/general-service.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  companies: any = [];
  loading = false;
  submitted = false;
  file: any;
  errorMessage: string = '';
  selectedCompany: any;

  constructor(private AuthService: AuthService, private generalService: GeneralServiceService) { }

  ngOnInit(): void {
    this.fetchCompanies();
    const savedCompany = localStorage.getItem('selectedCompany');
    if (savedCompany) {
      this.selectedCompany = savedCompany;
    }
  }

  toggleSidebar(): void {
    this.AuthService.toggleSidebar()
  }

  fetchCompanies(): void {
    this.loading = true;
    this.AuthService.get('company').subscribe({
      next: (response: any) => {
        this.loading = false;
        this.companies = response.data;
        console.log('Fetched companies: ', this.companies);
      },
      error: (error: any) => {
        this.generalService.showMessage('error', error.message);
        this.loading = false;
        this.errorMessage = 'Error fetching companies';
        console.error('Error: ', error);
      },

    });

  }

  selectCompany(company: any): void {
    this.selectedCompany = company;
    console.log("Selected Company ID:", company._id);
    localStorage.setItem('CompanyId', company._id.toString());
  } 
}
