import { BackendService } from '../services/backend.service';
import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  modalOpen=false;
  modalMode='signup';
  modalForm: FormGroup;

  constructor(private backend:BackendService,
    private localstorage:LocalStorageService) {  }

  ngOnInit(): void {
    this.modalForm= new FormGroup({
      username: new FormControl('',Validators.required),
      password: new FormControl('',Validators.required)
    })
  }

  closeModal(){
    this.modalOpen=false;
  }

  openModal(mode:string){
    this.modalOpen=true;
    this.modalMode=mode;
  }

  modalConfirm(){
    let credentials = this.modalForm.value;

    console.log(credentials);
    if(this.modalMode='signup'){
      this.createUser(credentials);
    } else {
      this.login(credentials);
    }
  }

  login(credentials){
    this.backend.login(credentials).subscribe(
      (response)=>{
        this.localstorage.store('authenticationToken', response.authenticationToken);
        this.localstorage.store('username', response.username);
      }
    );
  }

  createUser(credentials){
    this.backend.createAccount(credentials).subscribe(
      data => console.log('success', data),
    error => console.log('oops', error.error));
  }

}
