import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentModeration } from './comment-moderation';

describe('CommentModeration', () => {
  let component: CommentModeration;
  let fixture: ComponentFixture<CommentModeration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentModeration]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentModeration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
