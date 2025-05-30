import { Component, OnInit } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../Service/AuthServices/auth.service';
import { GeneralServiceService } from '../../Service/GeneralService/general-service.service';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [FullCalendarModule, FormsModule, CommonModule],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css'
})

export class BookingComponent implements OnInit {
  schedules: any[] = [];
  showBookingForm = false;
  selectedDate: string = '';
  newBookingTitle: string = '';

  constructor(private AuthServices: AuthService, private generalService: GeneralServiceService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.fetchSchedules();
  }

  toggleSidebar(): void {
    this.AuthServices.toggleSidebar()
  }

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    height: 600,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: [
      { title: 'Existing Booking', start: '2025-01-16' },
      { title: 'Another Booking', start: '2025-01-18' },
    ],
    dateClick: this.handleDateClick.bind(this),
  };

  handleDateClick(arg: any) {
    const clickedDate = new Date(arg.date);
    const today = new Date();

    if (clickedDate < today) {
      this.generalService.showMessage('error', 'You cannot book a past date!');
      return;
    }

    const isBookingExists = (this.calendarOptions.events as any[])?.some((event: any) => {
      return event.start === arg.dateStr;
    });

    if (isBookingExists) {
      this.generalService.showMessage('error', `There is already a booking on ${arg.dateStr}`);
    }

    else {
      this.selectedDate = arg.dateStr;
      this.newBookingTitle = '';
      this.showBookingForm = true;
    }
  }

  addBooking() {
    if (!this.newBookingTitle.trim()) {
      alert('Please enter a valid event title.');
      return;
    }

    const newEvent = { title: this.newBookingTitle, start: this.selectedDate };
    (this.calendarOptions.events as any[]).push(newEvent);

    this.showBookingForm = false;
    this.selectedDate = '';
    this.newBookingTitle = '';

    alert('Booking successfully added!');
  }

  cancelBooking() {
    this.showBookingForm = false;
    this.selectedDate = '';
    this.newBookingTitle = '';
  }


  fetchSchedules() {
    const companyId = localStorage.getItem('CompanyId');

    if (!companyId) {
      this.generalService.showMessage('error', 'Company ID is missing. Please log in again.');
      return;
    }

    this.AuthServices.get(`schedule/${companyId}`).subscribe({
      next: (res: any) => {
        if (res.status === 200) {
          this.schedules = Array.isArray(res.schedule) ? res.schedule : [res.schedule];

          // ✅ Convert Schedules to Calendar Events
          this.populateCalendarEvents();
        } else {
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

  getNextDayOfWeek(date: Date, dayOfWeek: string): string {
    const daysMap: any = {
      sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
      thursday: 4, friday: 5, saturday: 6
    };

    const targetDay = daysMap[dayOfWeek];
    if (targetDay === undefined) return '';

    const resultDate = new Date(date);
    resultDate.setDate(date.getDate() + ((targetDay + 7 - date.getDay()) % 7));

    return resultDate.toISOString().split('T')[0];
  }


  getAllDaysOfWeekInMonth(currentDate: Date, dayOfWeek: string): string[] {
    const daysMap: any = {
      sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
      thursday: 4, friday: 5, saturday: 6
    };

    const targetDay = daysMap[dayOfWeek];
    if (targetDay === undefined) return [];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const resultDates: string[] = [];

    let date = new Date(year, month, 1);

    while (date.getMonth() === month) {
      if (date.getDay() === targetDay && date >= currentDate) {
        resultDates.push(date.toISOString().split('T')[0]); // Format: YYYY-MM-DD
      }
      date.setDate(date.getDate() + 1);
    }

    return resultDates;
  }

  getFutureDaysOfWeekInMonth(today: Date, targetDay: string): string[] {
    const daysOfWeek: { [key: string]: number } = {
      sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
      thursday: 4, friday: 5, saturday: 6
    };

    if (!(targetDay.toLowerCase() in daysOfWeek)) {
      console.error("Invalid day:", targetDay);
      return [];
    }

    const targetDayIndex = daysOfWeek[targetDay.toLowerCase()];
    const year = today.getFullYear();
    const month = today.getMonth();
    const days: string[] = [];

    for (let day = today.getDate(); day <= new Date(year, month + 1, 0).getDate(); day++) {
      const date = new Date(year, month, day);
      if (date.getDay() === targetDayIndex) {
        days.push(date.toISOString().split("T")[0]); // YYYY-MM-DD format
      }
    }

    return days;
  }

  populateCalendarEvents() {
    const events: any[] = [];
    const today = new Date();

    this.schedules.forEach(schedule => {
      if (schedule.duration === 'weekly' && schedule.day) {
        const futureDates = this.getFutureDaysOfWeekInMonth(today, schedule.day);

        futureDates.forEach(date => {
          const startTimeFormatted = this.convertTo12HourFormat(schedule.start[0]);
          const endTimeFormatted = this.convertTo12HourFormat(schedule.end[0]);

          events.push({
            title: `Weekly Booking (${startTimeFormatted} - ${endTimeFormatted})`,
            start: `${date}T${schedule.start[0]}`,
            end: `${date}T${schedule.end[0]}`
          });
        });
      }

      else if (schedule.duration === 'custom' && schedule.dates.length > 0) {
        schedule.dates.forEach((date: string) => {
          const startTimeFormatted = this.convertTo12HourFormat(schedule.start[0]);
          const endTimeFormatted = this.convertTo12HourFormat(schedule.end[0]);

          events.push({
            title: `Custom Booking (${startTimeFormatted} - ${endTimeFormatted})`,
            start: `${date.split("T")[0]}T${schedule.start[0]}`,
            end: `${date.split("T")[0]}T${schedule.end[0]}`
          });
        });
      }
    });

    console.log("✅ Fixed Events:", events);

    this.calendarOptions = {
      ...this.calendarOptions,
      events: [...events]
    };

    this.cdr.detectChanges(); // ✅ Force UI Refresh
  }

  convertTo12HourFormat(time24: string): string {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

}





