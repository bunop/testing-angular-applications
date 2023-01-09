import { Component, Injectable, OnInit } from "@angular/core";
import { Location } from '@angular/common';
import { fakeAsync, flush, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { By } from "@angular/platform-browser";

@Injectable()
class NavConfigService {
  menu = [{ label: 'Home', path: '/target/12' }];
}

// used to test how this component reacts with router, not the router itself
// The component under test generates navigation links
@Component({
    selector: 'navigation-menu',
    template: '<div><a *ngFor="let item of menu" [id]="item.label" [routerLink]="item.path">{{ item.label }}</a></div>'
  })
class NavigationMenu implements OnInit {
  menu: any;

  constructor(private navConfig: NavConfigService) { }

  ngOnInit() {
    this.menu = this.navConfig.menu;
  }
}

// two mock components to facilitate the test, one for the app
// fixture and one for the target.
@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
})
class AppComponent { }

@Component({
  selector: 'simple-component',
  template: 'simple'
})
class SimpleComponent { }

describe('Testing routes', () => {
  let fixture;
  let router: Router;
  let location: Location;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // configure fake testing routes
      imports: [RouterTestingModule.withRoutes([
        { path: '', component: NavigationMenu },
        { path: 'target/:id', component: SimpleComponent }
      ])],
      providers: [{
        provide: NavConfigService,
        useValue: { menu: [{ label: 'Home', path: '/target/fakeId' }] }
      }],
      declarations: [NavigationMenu, SimpleComponent, AppComponent],
    });
  });

  beforeEach(fakeAsync(() => {
    router = TestBed.get(Router);
    location = TestBed.get(Location);
    fixture = TestBed.createComponent(AppComponent);
    // start each test by navigating to the default routes
    router.navigateByUrl('/');
    advance();
  }));

  // an helper method for fakeAsync that resolves and detects asynchronous side effects
  function advance(): void {
    flush(); //
    fixture.detectChanges();
  }

  it('Tries to route to a page', fakeAsync(() => {
    // Gets reference to a generated link element
    const menu = fixture.debugElement.query(By.css('a'));

    // Sends the link a click event
    menu.triggerEventHandler('click', { button: 0 });

    // Processes the navigation attempt and updates the fixture
    advance();

    // Tests that the router location updated to the expected target
    expect(location.path()).toEqual('/target/fakeId');
  }));

});
