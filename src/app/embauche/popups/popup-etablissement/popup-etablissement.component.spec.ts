import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEtablissementComponent } from './popup-etablissement.component';

describe('PopupEtablissementComponent', () => {
  let component: PopupEtablissementComponent;
  let fixture: ComponentFixture<PopupEtablissementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupEtablissementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupEtablissementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
