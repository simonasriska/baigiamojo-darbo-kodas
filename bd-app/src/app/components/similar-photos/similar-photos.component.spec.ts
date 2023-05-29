import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimilarPhotosComponent } from './similar-photos.component';

describe('SimilarPhotosComponent', () => {
  let component: SimilarPhotosComponent;
  let fixture: ComponentFixture<SimilarPhotosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimilarPhotosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimilarPhotosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
