import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionnairePageComponent } from './gestionnaire-page.component';

describe('GestionnairePageComponent', () => {
  let component: GestionnairePageComponent;
  let fixture: ComponentFixture<GestionnairePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionnairePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionnairePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
