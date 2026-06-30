import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChordFinderComponent } from './chord-finder';

describe('ChordFinderComponent', () => {
  let component: ChordFinderComponent;
  let fixture: ComponentFixture<ChordFinderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChordFinderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChordFinderComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
