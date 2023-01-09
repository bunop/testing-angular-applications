import { Component, Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import { RouterTestingModule } from "@angular/router/testing";
import { Router, CanActivate } from "@angular/router";

// this is a fake service, used to demonstrate separation of the responsibility
// of route guard from user authentication service
@Injectable()
class UserAuthentication {

  private isUserAuthenticated: boolean = false;

  authenticateUser() {
    this.isUserAuthenticated = true;
  }

  getAuthenticated() {
    return this.isUserAuthenticated;
  }

}

// this is the route guard which implements CanActivate interface, which is
// the focus of this test
@Injectable()
class AuthenticationGuard implements CanActivate {

  constructor(private userAuth: UserAuthentication) {}

  canActivate(): Promise<boolean> | boolean {
    return new Promise((resolve) => resolve(this.userAuth.getAuthenticated()));
  }

}

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
})
class AppComponent { }

@Component({
  selector: `target`,
  template: `target`
})
class TargetComponent { }

describe('Testing routing guards', () => {
  let router;
  let location;
  let fixture;
  let userAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([
        { path: '', component: AppComponent },
        {
          path: 'protected',
          component: TargetComponent,
          // specify the route guard
          canActivate: [AuthenticationGuard],
        },
      ])],
      providers: [AuthenticationGuard, UserAuthentication],
      declarations: [TargetComponent, AppComponent],
    });

    router = TestBed.get(Router);
    location = TestBed.get(Location);
    // Allows the authentication check to pass
    userAuthService = TestBed.get(UserAuthentication);
  });

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(AppComponent);
    router.initialNavigation();
  }));

  it('tries to route to a page without authentication', fakeAsync(() => {
    router.navigate(['protected']);
    flush();
    expect(location.path()).toEqual('/');
  }));

  it('tries to route to a page after authentication', fakeAsync(() => {
    userAuthService.authenticateUser();
    router.navigate(['protected']);
    flush();
    expect(location.path()).toEqual('/protected');
  }));

});
