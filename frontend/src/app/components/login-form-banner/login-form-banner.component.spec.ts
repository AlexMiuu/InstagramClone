import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginFormBannerComponent } from './login-form-banner.component';

describe('LoginFormBannerComponent', () => {
  let component: LoginFormBannerComponent;
  let fixture: ComponentFixture<LoginFormBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginFormBannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginFormBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
