import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent implements OnInit {

  userLogin = '';
  password = '';

  userToken: string;

  loggedIn = false;
  isAdmin:  boolean;

  userAuth = '';
  secureEndpointResponse = '';

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.checkUserStatus();
  }

  checkUserStatus(): void {
    // Get user data from local storage
    this.userToken = localStorage.getItem('userToken');
    this.userLogin = localStorage.getItem('userLogin');

    // Set boolean whether a user is logged in or not
    this.loggedIn = !!(this.userToken);
  }

  //refresh browser window
  refresh(): void {
    window.location.reload();
  }

  login(): void {
    this.httpClient.post(environment.endpointURL + 'user/login', {
      userLogin: this.userLogin,
      password: this.password
    }).subscribe((res: any) => {
      // Set user data in local storage
      localStorage.setItem('userToken', res.token);
      localStorage.setItem('userName', res.user.userLogin);
      localStorage.setItem('isAdmin', res.user.isAdmin);
      this.checkUserStatus()}, (error: any) => {
        this.userAuth = 'You are not a user, register first!!!';
      });
  }

  logout(): void {
    // Remove user data from local storage
    localStorage.removeItem('userToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('isAdmin');

    this.checkUserStatus();
  }

  /**
   * Function to access a secure endpoint that can only be accessed by logged in users by providing their token.
   */
  accessSecuredEndpoint(): void {
    this.httpClient.get(environment.endpointURL + 'secured').subscribe((res: any) => {
      this.secureEndpointResponse = 'Successfully accessed secure endpoint. Message from server: ' + res.message;
    }, (error: any) => {
      this.secureEndpointResponse = 'Unauthorized';
    });
  }
}
