import { Routes } from '@angular/router';
import { SiteComponent } from './layout/site/site.component';
import { AuthguardGuard } from './Service/AuthServices/authguard.guard';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { ForgetComponent } from './pages/Authentication/forget/forget.component';
import { SignupComponent } from './pages/Authentication/signup/signup.component';
import { SigninComponent } from './pages/Authentication/signin/signin.component';
import { AddserviceComponent } from './admin/addservice/addservice.component';
import { CompanyregisterComponent } from './admin/companyregister/companyregister.component';
import { CategoryComponent } from './admin/category/category.component';
import { BookingComponent } from './admin/booking/booking.component';
import { LandingpageComponent } from './pages/User/landingpage/landingpage.component';
import { AppComponent } from './layout/app/app.component';
import { AuthComponent } from './layout/auth/auth.component';
import { ProfileSettingComponent } from './admin/profile-setting/profile-setting.component';
import { RestpasswordComponent } from './pages/Authentication/resetpassword/restpassword.component';
import { AboutComponent } from './pages/User/about/about.component';
import { ScheduleComponent } from './admin/schedule/schedule.component';
import { BookingScheduleComponent } from './pages/User/booking-schedule/booking-schedule.component';
import { CompanyDetailComponent } from './pages/User/company-detail/company-detail.component';
import { CompaniesComponent } from './pages/User/companies/companies.component';
import { ContactUSComponent } from './pages/User/contact-us/contact-us.component';

export const routes: Routes = [

        {
                path: '',
                component: AuthComponent,
                children: [
                        { path: '', redirectTo: 'login', pathMatch: 'full' },
                        { path: 'login', component: SigninComponent },
                        { path: 'register', component: SignupComponent },
                        { path: 'forgetpassword', component: ForgetComponent },

                ]
        },

        {
                path: '',
                component: SiteComponent,
                canActivate: [AuthguardGuard],
                data: { role: 'manager' },
                children: [
                        { path: 'home', component: LandingpageComponent },
                        { path: 'about-us', component: AboutComponent },
                        { path: 'companyDetails/:id', component: CompanyDetailComponent },
                        { path: 'booking-schedule/:id', component: BookingScheduleComponent },
                        { path: 'all-companies', component: CompaniesComponent },
                        { path: 'contact-us', component: ContactUSComponent },
                ]
        },

        {
                path: '',
                component: AppComponent,
                canActivate: [AuthguardGuard],
                data: { role: 'admin' },
                children: [
                        { path: 'dashboard', component: DashboardComponent },
                        { path: 'add-service', component: AddserviceComponent },
                        { path: 'add-company', component: CompanyregisterComponent },
                        { path: 'add-category', component: CategoryComponent },
                        { path: 'booking', component: BookingComponent },
                        { path: 'profile', component: ProfileSettingComponent },
                        { path: 'schedule', component: ScheduleComponent },
                ],
        },

        // { path: 'reset-password', component: RestpasswordComponent },

        {
                path: '**',
                redirectTo: '',
        },

];

