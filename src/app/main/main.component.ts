import { BackendService } from '../services/backend.service';
import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  modalOpen=false;
  modalMode='signup';
  signupLoginForm: FormGroup;
  isLoggedIn = false;
  token = '';
  stash : any;

  constructor(private backend:BackendService,
    private localstorage:LocalStorageService,
    private toastr:ToastrService) {  }

  ngOnInit(): void {
    if(this.localstorage.retrieve('password') && this.localstorage.retrieve('username')){
      this.isLoggedIn = true;
      this.refreshStash();
    }
    this.signupLoginForm= new FormGroup({
      username: new FormControl(''),
      password: new FormControl('')
    })
  }

  saveCredentials(){
    this.backend.saveCredentials(
      {
        site:"",
        username:"User34",
        password:"passwX"
      },
      this.localstorage.retrieve('password')
    ).subscribe(data => {
      this.toastr.info(data);
      this.refreshStash();
    },
    error=> {
      this.toastr.error(error.error);
    }
    );
  }

  getStash(){
    this.backend.getStash(this.localstorage.retrieve('password')).subscribe(
      response=>{
        console.log(response);
      }
    );
  }


  revealCredentioals(credentials:any){
    console.log(credentials);
  }

  closeModal(){
    this.modalOpen=false;
  }

  openModal(mode:string){
    this.modalOpen=true;
    this.modalMode=mode;
  }

  modalConfirm(){
    let credentials = this.signupLoginForm.value;
    if(this.modalMode ==='signup'){
      this.createUser(credentials);
    } else {
      this.login(credentials);
    }
  }


  login(credentials){
    this.backend.login(credentials).subscribe(
      response => {
        this.localstorage.store('authToken', response.authToken);
        this.localstorage.store('username', credentials.username);
        this.localstorage.store('password', credentials.password);
        this.toastr.success('Autentificat cu succes');
        this.isLoggedIn = true;
        this.closeModal();
        this.refreshStash();
      },
      () => {
        this.toastr.error("Date de autentificare incorecete");
      }
    );
  }

  refreshStash(){
    this.backend.getStash(this.localstorage.retrieve('password')).subscribe( (data) => {this.stash = data;});
  }

  logout(){
    this.localstorage.clear();
    this.isLoggedIn = false;
    this.toastr.success("Deconectat cu succes");
  }

  createUser(credentials){
    this.backend.createAccount(credentials).subscribe(
      data => {
          this.toastr.info(data);
          this.closeModal();
        },
      error => {
        this.signupLoginForm.markAsDirty();
        this.toastr.error(error.error);
      }
    )
  }

}
