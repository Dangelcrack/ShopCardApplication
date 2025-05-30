import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubirCartaComponent } from './subir-carta.component';

describe('SubirCartaComponent', () => {
  let component: SubirCartaComponent;
  let fixture: ComponentFixture<SubirCartaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubirCartaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubirCartaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
