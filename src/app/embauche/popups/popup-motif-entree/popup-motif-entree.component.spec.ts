import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupMotifEntreeComponent } from './popup-motif-entree.component';

describe('PopupMotifEntreeComponent', () => {
  let component: PopupMotifEntreeComponent;
  let fixture: ComponentFixture<PopupMotifEntreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupMotifEntreeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupMotifEntreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
