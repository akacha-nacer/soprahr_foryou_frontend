import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupConfMaladieComponent } from './popup-conf-maladie.component';

describe('PopupConfMaladieComponent', () => {
  let component: PopupConfMaladieComponent;
  let fixture: ComponentFixture<PopupConfMaladieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupConfMaladieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupConfMaladieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
