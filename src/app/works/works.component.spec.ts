import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { WorksComponent } from './works.component';

describe('WorksComponent', () => {
  let component: WorksComponent;
  let fixture: ComponentFixture<WorksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      declarations: [WorksComponent],
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
