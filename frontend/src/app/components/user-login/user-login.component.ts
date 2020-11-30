import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from "@angular/router";
import { UserService } from "../../services/user.service";
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from "@angular/material/dialog";
import { DialogBodyComponent } from "../dialog-body/dialog-body.component";


@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent implements OnInit {

  userLogin = '';
  password = '';
  userWallet = '';
  isUserLoggedIn: boolean;
  email: string;

  name: string;

  constructor(private _snackBar: MatSnackBar, private httpClient: HttpClient, private router: Router, private userService: UserService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.userService.isUserLoggedIn.subscribe(value => {
      this.isUserLoggedIn = value;
    });
  }

  openDialog(): void {
    let dialogRef = this.dialog.open(DialogBodyComponent, {
      width: '250px'});
    dialogRef.afterClosed().subscribe(result => {
      this.email = result;
      console.log(this.email);
      this.passwordForgotten(this.email);
    });
  }

  login(): void {
    this.userService.login(this.userLogin, this.password).subscribe((res: any) => {
      // Set user data in local storage
      localStorage.setItem('userToken', res.token);
      localStorage.setItem('userName', res.user.userName);
      localStorage.setItem('admin', res.user.admin);
      localStorage.setItem('userId', res.user.userId);
      localStorage.setItem('userWallet', res.user.wallet);

      //updates isUserLoggedIn value
      this.userService.isUserLoggedIn.next(true);
      //get User Name
      this.userService.isUserName.next(res.user.userName);
      //update isUserAdmin value
      this.userService.isUserAdmin.next(res.user.admin);
      //navigates to dashboard
      this.router.navigate(['/home']);
      }, (error: any) => {
        let message = "An error occurred!";
        let action = "Retry";
        this.openSnackBar(message, action);
      });
  }

  logout(): void {
    this.userService.logout();
    //updates isUserLoggedIn value
    this.userService.isUserLoggedIn.next(false);
    //update isUserAdmin value
    this.userService.isUserAdmin.next(false);
    //navigates to dashboard
    this.router.navigate(['/home']);
  }

  /*
  openDialog(templateRef) : void {
    const dialogRef = this.dialog.open(templateRef, {
      width: '200px',
      data: {email: this.email},
    });

    dialogRef.afterClosed().subscribe(result => {
      this.email = result;
    });
  }
  */

passwordForgotten(email: string): void {
    this.userService.passwordForgotten(email).subscribe((res: any) => {
      let action = "X";
      this.openSnackBar(res.message, action);
    }, (error: any) => {
      let action = "X";
      this.openSnackBar(error.message, action);
    });
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 3000
    });
  }
}
