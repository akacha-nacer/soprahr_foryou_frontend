import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupNatureContratComponent } from './popup-nature-contrat.component';

describe('PopupNatureContratComponent', () => {
  let component: PopupNatureContratComponent;
  let fixture: ComponentFixture<PopupNatureContratComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupNatureContratComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupNatureContratComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
