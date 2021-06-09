import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private httpclient: HttpClient){}

    createAccount(username:String, password:String): Observable<any>{
      return this.httpclient.post("https://localhost:8080/safe-storage/auth/create-account",
      {"username":username,"password":password},
      {responseType: 'text'});
    }

    login(username:String, password:String): Observable<any>{
      return this.httpclient.post("https://localhost:8080/api/auth/login",{"username":username,"password":password});
    }
}
