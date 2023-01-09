import { Component, OnInit, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TestBed, async } from '@angular/core/testing';
import { ActivatedRoute } from "@angular/router";
import { Observable } from 'rxjs'

@Component({
  selector: `contact-edit`,
  template: `<div class="contact-id">{{ contactId }}</div>`,
})
class ContactEditComponent implements OnInit {
  private contactId: any;
  constructor(private activatedRoute: ActivatedRoute) { }
  ngOnInit () {
    this.activatedRoute.params.subscribe(({ id }) => {
      this.contactId = id;
    });
  }
}

describe('Testing activated routes', () => {
  let fixture;

  // Creates an observable that will be used for testing ActivatedRoute params
  const paramsMock = Observable.create((observer) => {
    observer.next({
      id: 'aMockId'
    });
    observer.complete();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      // create a provider and use the observable as the params method for the injected mock service
      providers: [{ provide: ActivatedRoute, useValue: { params: paramsMock }}],
      declarations: [ContactEditComponent],
    });
  });

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ContactEditComponent);
    fixture.detectChanges();
  }));

  // The test is wrapped in the async helper because the
  // test is waiting for the component to initialize.
  it('Tries to route to a page', async(() => {
    // A reference to the DOM node where the Contact ID should be rendered
    const testEl = fixture.debugElement.query(By.css('div'));

    // console.log('testEl', testEl);

    // Verifies the template is rendered with the Contact ID from ActivatedRoute
    expect(testEl.nativeElement.textContent).toEqual('aMockId');
  }));

});
