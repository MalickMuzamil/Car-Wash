import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../Service/AuthServices/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-company-detail',
  imports: [RouterLink, CommonModule],
  templateUrl: './company-detail.component.html',
  styleUrl: './company-detail.component.css'
})
export class CompanyDetailComponent {
  companyId: string | null = null;
  company: any
  services: any[] = [];
  selectedService: any;
  loading = false;
  errorMessage: string = '';

  constructor(private router: Router, private route: ActivatedRoute, private authService: AuthService) { }


  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.companyId = params.get('id');
      console.log('Company ID from URL:', this.companyId);
    });

    if (this.companyId) {
      this.getCompanyDetails();
    }
  }

  onBookingClick(service: any): void {
    localStorage.setItem('selectedServiceId', service._id);

    if (this.companyId) {
      this.router.navigate(['/booking-schedule', this.companyId]);
    }
  }

  onViewService(service: any) {
    localStorage.setItem('selectedServiceId', service._id);
    this.selectedService = service;
  }

  getCompanyDetails(): void {
    this.authService.get(`service/?companyId=${this.companyId}`).subscribe({
      next: (response) => {
        console.log('Company Data:', response);
        this.company = response;
        this.services = response.data;
      },
      error: (error) => {
        console.error('Error fetching company details:', error);
      }
    });
  }

}
