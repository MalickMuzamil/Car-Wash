import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingScheduleComponent } from './booking-schedule.component';

describe('BookingScheduleComponent', () => {
  let component: BookingScheduleComponent;
  let fixture: ComponentFixture<BookingScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingScheduleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
