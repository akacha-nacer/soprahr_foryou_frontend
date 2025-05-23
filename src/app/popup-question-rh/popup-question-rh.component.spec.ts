import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupQuestionRhComponent } from './popup-question-rh.component';

describe('PopupQuestionRhComponent', () => {
  let component: PopupQuestionRhComponent;
  let fixture: ComponentFixture<PopupQuestionRhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupQuestionRhComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupQuestionRhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
