import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MintingBoxComponent } from './minting-box.component';

describe('MintingBoxComponent', () => {
  let component: MintingBoxComponent;
  let fixture: ComponentFixture<MintingBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MintingBoxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MintingBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
