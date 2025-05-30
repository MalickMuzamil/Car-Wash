import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../Service/AuthServices/auth.service';
import { Router } from '@angular/router';
import { GeneralServiceService } from '../../Service/GeneralService/general-service.service';

@Component({
  selector: 'app-schedule',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css'
})
export class ScheduleComponent implements OnInit {
  AddSchedule!: FormGroup;
  loading = false;
  submitted = false;
  isCustom: boolean = false;
  selectedSpecificDates: string[] = [];
  schedules: any[] = [];
  selectedScheduleId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private generalService: GeneralServiceService
  ) { }

  ngOnInit(): void {
    this.AddSchedule = this.fb.group({
      durationType: ['', Validators.required],
      day: [{ value: '', disabled: true }, Validators.required],
      specificDates: [{ value: '', disabled: true }, Validators.required],
      startTimes: [[], Validators.required],
      endTimes: [[], Validators.required],
    });

    this.fetchSchedules();
  }

  get error() {
    return this.AddSchedule.controls;
  }

  onDurationChange(event: any) {
    const selectedValue = event.target.value;
    this.isCustom = selectedValue === "custom";

    if (this.isCustom) {
      this.AddSchedule.get('day')?.disable();
      this.AddSchedule.get('specificDates')?.enable();
      this.AddSchedule.get('day')?.setValue('');
      this.AddSchedule.get('specificDates')?.setValidators([Validators.required]);  // ✅ Make 'specificDates' required
    } else {
      this.AddSchedule.get('day')?.enable();
      this.AddSchedule.get('specificDates')?.disable();
      this.AddSchedule.get('specificDates')?.setValue('');
      this.AddSchedule.get('specificDates')?.clearValidators();  // ✅ Remove required validator
    }

    // ✅ Update validators for form to recheck errors
    this.AddSchedule.get('day')?.updateValueAndValidity();
    this.AddSchedule.get('specificDates')?.updateValueAndValidity();

    console.log("✅ Duration Selected:", selectedValue);
  }

  onSpecificDateChange(event: any) {
    const selectedDate = event.target.value;
    if (selectedDate && !this.selectedSpecificDates.includes(selectedDate)) {
      this.selectedSpecificDates.push(selectedDate);
      this.AddSchedule.get('specificDates')?.setValue(this.selectedSpecificDates);
      this.AddSchedule.get('specificDates')?.updateValueAndValidity();
      console.log("📅 Specific Dates Updated:", this.selectedSpecificDates);
    }
  }

  onStartTimeChange(event: any) {
    this.updateTimeArray('startTimes', event.target.value);
  }

  onEndTimeChange(event: any) {
    this.updateTimeArray('endTimes', event.target.value);
  }

  private updateTimeArray(controlName: string, value: string) {
    if (value) {
      const times = this.AddSchedule.get(controlName)?.value || [];
      if (!times.includes(value)) {
        times.push(value);
        this.AddSchedule.get(controlName)?.setValue(times);
      }
    }
  }

  fetchSchedules() {
    const companyId = localStorage.getItem('CompanyId');

    if (!companyId) {
      this.generalService.showMessage('error', 'Company ID is missing. Please log in again.');
      return;
    }

    this.authService.get(`schedule/${companyId}`).subscribe({
      next: (res: any) => {
        if (res.status === 200) {
          this.schedules = Array.isArray(res.schedule) ? res.schedule : [res.schedule];
        }
        else {
          this.schedules = [];
        }
      },
      error: (err) => {
        console.error('Error fetching schedules:', err);
        this.generalService.showMessage('error', 'Failed to fetch schedules.');
        this.schedules = [];
      }
    });
  }

  deleteService(scheduleId: string): void {
    const companyId = localStorage.getItem('CompanyId');

    if (!companyId) {
      this.generalService.showMessage('error', 'Company ID is missing. Please log in again.');
      return;
    }

    this.generalService.confirmDialog('Are you sure?', 'You won\'t be able to revert this!')
      .then((isConfirmed) => {
        if (isConfirmed) {
          this.authService.delete(`schedule/${companyId}/?scheduleId=${scheduleId}`).subscribe({
            next: (response: any) => {
              this.generalService.showMessage('success', 'Schedule deleted successfully!');
              this.fetchSchedules();
            },
            error: (error) => {
              console.error('Error deleting schedule:', error);
              this.generalService.showMessage('error', 'Failed to delete schedule!');
            }
          });
        }
      });
  }

  UpdateService(scheduleId: string) {
    this.selectedScheduleId = scheduleId;
  
    const selectedSchedule = this.schedules.find(s => s._id === scheduleId);
    if (!selectedSchedule) {
      this.generalService.showMessage('error', 'Schedule not found!');
      return;
    }
  
    this.AddSchedule.patchValue({
      durationType: selectedSchedule.duration,
      day: selectedSchedule.day,
      startTimes: selectedSchedule.start || [],
      endTimes: selectedSchedule.end || []
    });
  
    this.selectedSpecificDates = selectedSchedule.dates || [];
    console.log("Selected Specific Dates:", this.selectedSpecificDates);
  }
  
  onUpdate() {
    this.submitted = true;
  
    if (!this.selectedScheduleId || this.AddSchedule.invalid) {
      this.generalService.showMessage('error', 'Invalid form data or no schedule selected.');
      return;
    }
  
    const companyId = localStorage.getItem('CompanyId');
    if (!companyId) {
      this.generalService.showMessage('error', 'Please Select a Company');
      return;
    }
  
    const updatedData = {
      durationType: this.AddSchedule.value.durationType,
      day: this.AddSchedule.value.durationType === 'weekly' ? this.AddSchedule.value.day || '' : '',
      specificDates: this.AddSchedule.value.durationType === 'custom' ? this.selectedSpecificDates || [] : [],
      startTimes: this.AddSchedule.value.startTimes || [],
      endTimes: this.AddSchedule.value.endTimes || [],
      companyId: companyId
    };
  
    this.loading = true;
  
    this.authService.patch(`schedule/${companyId}/?scheduleId=${this.selectedScheduleId}`, updatedData).subscribe({
      next: (res: any) => {
        if (res.status === 200) {
          this.generalService.showMessage('success', 'Schedule updated successfully!');
          this.fetchSchedules();
        } else {
          this.generalService.showMessage('error', 'Failed to update schedule.');
        }
        this.loading = false;
      },
      error: (err) => {
        this.generalService.showMessage('error', 'Error updating schedule.');
        this.loading = false;
      }
    });
  }
  
  onSubmit(): void {
    this.submitted = true;
    this.loading = true;

    console.log(this.AddSchedule.value)

    if (this.AddSchedule.invalid) {
      console.log('Form is invalid!');
      this.loading = false;
      return;
    }

    const companyId = localStorage.getItem('CompanyId');

    if (!companyId) {
      console.error('Company ID not found in local storage!');
      this.generalService.showMessage('error', 'Company ID is missing. Please log in again.');
      this.loading = false;
      return;
    }

    const formData = {
      ...this.AddSchedule.value,
      companyId: companyId
    };

    this.authService.post('schedule', formData).subscribe({
      next: (res: any) => {
        if (res.status === 201) {
          console.log('Schedule successfully Created!');
          this.generalService.showMessage('success', res.message);
          this.fetchSchedules();
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
