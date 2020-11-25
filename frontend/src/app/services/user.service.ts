import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";
import { environment} from "../../environments/environment";
import { User } from "../models/user.model";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  userToken: string;
  userName: string;
  userId: any;
  userWallet: any;
  users: User[] ;


  public isUserLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isUserAdmin: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isUserName: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public actualWallet: BehaviorSubject<number> = new BehaviorSubject<number>(this.userWallet);

  constructor(private httpClient: HttpClient) { }

  login(userLogin: string, password: string){
    return this.httpClient.post(environment.endpointURL + 'user/login', {
      userLogin, password
    });
  }

  logout(){
    localStorage.clear();
  }

  /** Functions to get specific user attributes from local storage e**/

  getToken(){
    return this.userToken = localStorage.getItem('userToken');
  }

  getUserName(){
    return this.userName = localStorage.getItem('userName');
  }

  getUserId(){
    return this.userId = localStorage.getItem('userId');
  }

  getUserWallet(){
    return this.userWallet = localStorage.getItem('userWallet')
  }

  /** get requests **/
  getUser(id: number){
    return this.httpClient.get(environment.endpointURL + 'user/' + id);
  }

  getUserList(){
    return this.httpClient.get(environment.endpointURL + 'user');
  }

  /** post requests **/
  registration(user: User) {
    this.httpClient.post(environment.endpointURL + 'user/register', user).pipe(map((res: any)=>{
      // Set user data in local storage
      localStorage.setItem('userToken', res.token);
      localStorage.setItem('userId', res.userId);
      localStorage.setItem('userName', res.userName);
      localStorage.setItem('admin', res.admin);
      localStorage.setItem('userWallet', res.wallet);
    }));
  }

  saveUser(user: User) {
    this.httpClient.post(environment.endpointURL + 'user/edit/', user).pipe(map((res: any) => {
      localStorage.setItem('userToken', res.token);
      localStorage.setItem('userId', res.userId);
      localStorage.setItem('userName', res.userName);
      localStorage.setItem('admin', res.admin);
    }));
  }
}
