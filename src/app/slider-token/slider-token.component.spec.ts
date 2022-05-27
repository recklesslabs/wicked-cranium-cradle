import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderTokenComponent } from './slider-token.component';

describe('SliderTokenComponent', () => {
  let component: SliderTokenComponent;
  let fixture: ComponentFixture<SliderTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SliderTokenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SliderTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
