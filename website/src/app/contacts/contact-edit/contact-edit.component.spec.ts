
// to inspect element during testing
import { DebugElement } from '@angular/core';

import {
  // used to create fixtures
  ComponentFixture,
  // ensure all async tasks are completed before doing tests
  fakeAsync,
  // main class provided by angular to make unit tests
  TestBed,
  // used with fakeAsync, simulate passage of time
  tick
} from '@angular/core/testing';

// required to access DOM elements
import { By } from '@angular/platform-browser'

// required to mock animations and do test immediately
import { NoopAnimationsModule } from '@angular/platform-browser/animations'

// required to setup the browser used during tests
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';

// used to test routes
import { RouterTestingModule } from '@angular/router/testing'

// this is not a testing module, but is required by ContactEditComponent
import { FormsModule } from '@angular/forms';

// those are dependencies required by this project
import { Contact, ContactService, FavoriteIconDirective,
  InvalidEmailModalComponent, InvalidPhoneNumberModalComponent
} from '../shared';

import { AppMaterialModule } from '../../app.material.module';
import { ContactEditComponent } from './contact-edit.component';
import '../../../material-app-theme.scss';

describe('ContactEditComponent tests', () => {
  // this instance let me debug and test ContactEditComponent
  let fixture: ComponentFixture<ContactEditComponent>;

  // this is an instance of the component I want to test
  let component: ContactEditComponent;

  // let me access to my component children
  let rootElement: DebugElement;

  // I need to fake a service since I'm interested in testing a component
  const contactServiceStub = {
    // The default contact object
    contact: {
      id: 1,
      name: 'janet'
    },

    // Sets the passed-in object to the
    // component’s contact property
    save: async function (contact: Contact) {
      component.contact = contact;
    },

    // Method that sets the current contact to
    // the component’s contact property and
    // returns that contact
    getContact: async function () {
      component.contact = this.contact;
      return this.contact;
    },

    // Method that updates the contact object
    updateContact: async function (contact: Contact) {
      component.contact = contact;
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      // This is where you list any components that the component you’re
      // testing may need.
      declarations: [
        ContactEditComponent,
        FavoriteIconDirective,
        InvalidEmailModalComponent,
        InvalidPhoneNumberModalComponent
      ],
      // You set imports to an array of modules that the component
      //you’re testing requires.
      imports: [
        AppMaterialModule,
        FormsModule,
        NoopAnimationsModule,
        RouterTestingModule
      ],
      // Lets you override the providers Angular uses for dependency
      // injection. In this case, you inject a fake ContactService.
      providers: [{provide: ContactService, useValue: contactServiceStub}]
    });

    // in this case, I need two modal dialogs to be loaded after a certain action
    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [
          InvalidEmailModalComponent,
          InvalidPhoneNumberModalComponent
        ]
      }
    });
  });

  beforeEach(() => {
    // The fixture variable stores the component-like object from the
    // TestBed.createComponent method that you can use for debugging and testing
    fixture = TestBed.createComponent(ContactEditComponent);
    // The component variable holds a component that you get from your fixture
    component = fixture.componentInstance;
    // The detectChanges method triggers a change-detection cycle for the component;
    // you need to call it after initializing a component or changing a data-bound
    // property value. After calling detectChanges, the updates to your component
    // will be rendered in the DOM. you need to call detectChanges frequently
    // in your tests after making changes to a component.
    fixture.detectChanges();

    // Stores the DebugElement for your component, which is how you’ll
    // access its children
    rootElement = fixture.debugElement;
  });

  // testing saveContact(), which changes the component state and change DOM.
  // we will use fakeAsync to keep the test until the component has finished
  // updating. I need to set component.isLoading to false in order to avoid
  // progress bar display. Next I will create a contact and I will use the stub
  // service in replacement of the real service. Next, I need to call detectChanges
  // in order to update the DOM. Last if will use By.css to inspect changes in
  // DOM, tick(0) to simulate passage of time and assert the final value of
  // nameInput
  describe('saveContact() test', () => {
    it('should display contact name after contact set', fakeAsync(() => {
      const contact = {
        id: 1,
        name: 'lorace'
      };

      // Sets isLoading to false to hide the progress bar
      component.isLoading = false;
      component.saveContact(contact);
      // Uses the detectChanges method to trigger change detection
      fixture.detectChanges();
      // Gets the nameInput form field
      const nameInput = rootElement.query(By.css('.contact-name'));
      // Simulates the passage of time. Default if 0 ms
      tick();
      // Checks to see if the name property has been set correctly
      expect(nameInput.nativeElement.value).toBe('lorace');
    }));
  });

  describe('loadContact() test', () => {
    it('should load contact', fakeAsync(() => {
      component.isLoading = false;
      component.loadContact();
      fixture.detectChanges();
      const nameInput = rootElement.query(By.css('.contact-name'));
      tick();
      // janet is the example contact saved in contactServiceStub
      expect(nameInput.nativeElement.value).toBe('janet');
    }));
  });

  describe('updateContact() test', () => {
    it('should update the contact', fakeAsync(() => {
      const newContact = {
        id: 1,
        name: 'delia',
        email: 'delia@example.com',
        number: '1234567890'
      };

      component.contact = {
        id: 2,
        name: 'rhonda',
        email: 'rhonda@example.com',
        number: '1234567890'
      };

      component.isLoading = false;
      fixture.detectChanges();
      const nameInput = rootElement.query(By.css('.contact-name'));
      tick();
      // test initial state
      expect(nameInput.nativeElement.value).toBe('rhonda');

      component.updateContact(newContact);
      fixture.detectChanges();
      // simulate passage of time (100 ms)
      tick(100);
      // test name after update
      expect(nameInput.nativeElement.value).toBe('delia');
    }));

    it('should not update the contact if email is invalid', fakeAsync(() => {
      const newContact = {
        id: 1,
        name: 'london',
        // set an invalid email
        email: 'london@example',
        number: '1234567890'
      };

      component.contact = {
        id: 2,
        name: 'chauncey',
        email: 'chauncey@example.com',
        number: '1234567890'
      };

      component.isLoading = false;
      fixture.detectChanges();
      const nameInput = rootElement.query(By.css('.contact-name'));
      tick();
      // test initial state
      expect(nameInput.nativeElement.value).toBe('chauncey');

      component.updateContact(newContact);
      fixture.detectChanges();
      // simulate passage of time (100 ms)
      tick(100);
      // test name after update: no changes occurred
      expect(nameInput.nativeElement.value).toBe('chauncey');
    }));

    it('should not update the contact if phone number is invalid', fakeAsync(() => {
      const newContact = {
        id: 1,
        name: 'london',
        email: 'london@example.com',
        // set an invalid phone number
        number: '12345678901'
      };

      component.contact = {
        id: 2,
        name: 'chauncey',
        email: 'chauncey@example.com',
        number: '1234567890'
      };

      component.isLoading = false;
      fixture.detectChanges();
      const nameInput = rootElement.query(By.css('.contact-name'));
      tick();
      // test initial state
      expect(nameInput.nativeElement.value).toBe('chauncey');

      component.updateContact(newContact);
      fixture.detectChanges();
      // simulate passage of time (100 ms)
      tick(100);
      // test name after update: no changes occurred
      expect(nameInput.nativeElement.value).toBe('chauncey');
    }));

  });

});
