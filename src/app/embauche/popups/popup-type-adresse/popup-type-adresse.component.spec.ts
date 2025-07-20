import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupTypeAdresseComponent } from './popup-type-adresse.component';

describe('PopupTypeAdresseComponent', () => {
  let component: PopupTypeAdresseComponent;
  let fixture: ComponentFixture<PopupTypeAdresseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupTypeAdresseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupTypeAdresseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
