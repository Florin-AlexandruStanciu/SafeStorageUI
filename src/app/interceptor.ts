import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';
import { BackendService } from './services/backend.service';
import { catchError, switchMap, take, filter ,tap } from 'rxjs/operators';

@Injectable({ providedIn:'root' })
export class Interceptor implements HttpInterceptor {

  isRefreshing = false;
  refreshLoginSubject: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor(private localstorage:LocalStorageService,
     private backend:BackendService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = this.localstorage.retrieve('authToken');
    if(request.url.indexOf("auth/") > 0 ){
      return next.handle(request);
    }
    if (authToken) {
      return next.handle(this.useToken(authToken, request)).pipe(catchError(
        error => {
          if (error instanceof HttpErrorResponse
              && error.status === 403) {
              return this.handleAuthErrors(request, next);
          } else {
              return throwError(error);
          }
        }));
    }
  return next.handle(request);
  }


  handleAuthErrors(reqest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshLoginSubject.next(null);
      return this.refreshLogin({username:this.localstorage.retrieve('username'),password:this.localstorage.retrieve('password')}).pipe(
          switchMap((response) => {
            this.isRefreshing = false;
            this.refreshLoginSubject.next(response.authToken);
            return next.handle(this.useToken(response.authToken,reqest));
          }));
    }
  }

  refreshLogin(credentials){
    return this.backend.login(credentials).pipe(tap(
      (response)=>{
        this.localstorage.store('authToken', response.authToken);
        console.log(response);
      })
    );
  }

  useToken(token:any,request:HttpRequest<any>){
    return request.clone({
      headers:request.headers.set('Authorization','Bearer ' + token)
    });
  }
}
