import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupQualifComponent } from './popup-qualif.component';

describe('PopupQualifComponent', () => {
  let component: PopupQualifComponent;
  let fixture: ComponentFixture<PopupQualifComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupQualifComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupQualifComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
