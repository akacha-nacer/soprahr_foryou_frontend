import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EspaceManagerComponent } from './espace-manager.component';

describe('EspaceManagerComponent', () => {
  let component: EspaceManagerComponent;
  let fixture: ComponentFixture<EspaceManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EspaceManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EspaceManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
