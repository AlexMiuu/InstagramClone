import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedFormHeaderComponent } from './feed-form-header.component';

describe('FeedFormHeaderComponent', () => {
  let component: FeedFormHeaderComponent;
  let fixture: ComponentFixture<FeedFormHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedFormHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedFormHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
