import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssigntaskComponent } from './assigntask.component';

describe('AssigntaskComponent', () => {
  let component: AssigntaskComponent;
  let fixture: ComponentFixture<AssigntaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssigntaskComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssigntaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
