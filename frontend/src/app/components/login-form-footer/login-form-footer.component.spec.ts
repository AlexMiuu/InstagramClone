import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginFormFooterComponent } from './login-form-footer.component';

describe('LoginFormFooterComponent', () => {
  let component: LoginFormFooterComponent;
  let fixture: ComponentFixture<LoginFormFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginFormFooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginFormFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
