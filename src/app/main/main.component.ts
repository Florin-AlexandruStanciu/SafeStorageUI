import { LoginService } from './../services/login.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  constructor(private loginService:LoginService) {  }

  ngOnInit(): void {
  }


  createUser(username:String,password:String){
    this.loginService.createAccount(username,password).subscribe(
      data => console.log('success', data),
    error => console.log('oops', error.error));
  }

}
