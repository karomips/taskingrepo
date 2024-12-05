import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskingComponent } from './tasking.component';

describe('TaskingComponent', () => {
  let component: TaskingComponent;
  let fixture: ComponentFixture<TaskingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
