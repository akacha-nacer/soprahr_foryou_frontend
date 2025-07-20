import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupTypeTelephoneComponent } from './popup-type-telephone.component';

describe('PopupTypeTelephoneComponent', () => {
  let component: PopupTypeTelephoneComponent;
  let fixture: ComponentFixture<PopupTypeTelephoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupTypeTelephoneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupTypeTelephoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
