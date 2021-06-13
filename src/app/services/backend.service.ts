import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private httpclient: HttpClient){}

    createAccount(credentials:any): Observable<any>{
      return this.httpclient.post("https://localhost:8080/safe-storage/auth/create-account",credentials,{responseType:'text'});
    }

    login(credentials:any): Observable<any>{
      return this.httpclient.post("https://localhost:8080/safe-storage/auth/authenticate",credentials);
    }

    getStash(password:string){
      return this.httpclient.post("https://localhost:8080/safe-storage/stash",password);
    }

    saveCredentials(credentials:any,password:string){
      return this.httpclient.post("https://localhost:8080/safe-storage/stash/create",{masterPassword:password,credentials:credentials},{responseType:'text'});
    }

    deleteCredentials(id:number){
      return this.httpclient.post("https://localhost:8080/safe-storage/stash/delete",id,{responseType:'text'});
    }

    changePassword(oldPassword:string,newPassword:string){
      return this.httpclient.post("https://localhost:8080/safe-storage/changePassword",{oldPassword:oldPassword,newPassword:newPassword},{responseType:'text'});
    }
}
