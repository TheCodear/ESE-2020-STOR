import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject } from "rxjs";
import { environment} from "../../environments/environment";
import { User } from "../models/user.model";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  userToken: string;
  userName: string;
  isAdmin: any;
  userId: any;
  users: User[] ;

  public isUserLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isUserAdmin: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isUserName: BehaviorSubject<string> = new BehaviorSubject<string>(this.getUserName());

  constructor(private httpClient: HttpClient) { }

  login(userLogin: string, password: string){
    return this.httpClient.post(environment.endpointURL + 'user/login', {
      userLogin, password
    });
  }

  logout(){
    localStorage.clear();
  }

  getIsLoggedIn(){
    this.userToken = localStorage.getItem('userToken');
    return !!(this.userToken);
  }

  getIsAdmin(){
    this.isAdmin = localStorage.getItem('admin');
    if (this.isAdmin === true){
      return true;
    }
    return false;
  }

  getUserName(){
    return this.userName = localStorage.getItem('userName');
  }

  getUserId(){
    return this.userId = localStorage.getItem('userId');
  }



   //get a specific User
  getUserById(userId: number){
    return this.httpClient.get(environment.endpointURL + 'user/' + userId);

  }

  getToken(){
    return this.userToken = localStorage.getItem('userToken');
  }

  getUserList(){
    this.httpClient.get(environment.endpointURL + 'user');
  }
}
