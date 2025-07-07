import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupDepartementNaissComponent } from './popup-departement-naiss.component';

describe('PopupDepartementNaissComponent', () => {
  let component: PopupDepartementNaissComponent;
  let fixture: ComponentFixture<PopupDepartementNaissComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupDepartementNaissComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupDepartementNaissComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
