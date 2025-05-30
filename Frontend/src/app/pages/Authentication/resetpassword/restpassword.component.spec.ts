import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestpasswordComponent } from './restpassword.component';

describe('RestpasswordComponent', () => {
  let component: RestpasswordComponent;
  let fixture: ComponentFixture<RestpasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestpasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestpasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
