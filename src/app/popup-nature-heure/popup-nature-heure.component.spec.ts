import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupNatureHeureComponent } from './popup-nature-heure.component';

describe('PopupNatureHeureComponent', () => {
  let component: PopupNatureHeureComponent;
  let fixture: ComponentFixture<PopupNatureHeureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupNatureHeureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupNatureHeureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
