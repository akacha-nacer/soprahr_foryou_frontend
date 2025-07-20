import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupConventionComponent } from './popup-convention.component';

describe('PopupConventionComponent', () => {
  let component: PopupConventionComponent;
  let fixture: ComponentFixture<PopupConventionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupConventionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupConventionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
