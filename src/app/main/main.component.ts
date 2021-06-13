import { BackendService } from '../services/backend.service';
import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  authModalOpen = false;
  authModalMode = 'signup';
  authForm: FormGroup;
  isLoggedIn = false;

  revealPass = false;
  revealUser = false;
  credModalOpen = false;
  credModalMode = 'create';
  credForm: FormGroup;

  stash: any;

  revealMPass = false;
  changePasswordModalOpen = false;
  changePasswordForm: FormGroup;


  @BlockUI() blockUI: NgBlockUI;

  constructor(private backend: BackendService,
    private localstorage: LocalStorageService,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    if (this.localstorage.retrieve('password') && this.localstorage.retrieve('username')) {
      this.isLoggedIn = true;
      this.refreshStash();
    }
  }

  saveCredentials(credentials) {
    this.backend.saveCredentials(
      credentials,
      this.localstorage.retrieve('password')
    ).subscribe(data => {
      this.closeCredModal();
      this.refreshStash();
      this.toastr.info(data);
    },
      error => {
        this.toastr.error(error.error);
      }
    );
  }

  deleteCredentials(id) {
    console.log(id);
    console.log(this.credForm.value);
    this.backend.deleteCredentials(id).subscribe(data => {
      this.toastr.info(data);
      this.refreshStash();
      this.closeCredModal();
    },
      error => {
        this.toastr.error(error.error);
        this.closeCredModal();
      }
    );
  }

  revealUserSwitch() {
    this.revealUser = !this.revealUser;
  }

  revealPassSwitch() {
    this.revealPass = !this.revealPass;
  }
  revealMPassSwitch() {
    this.revealMPass = !this.revealMPass;
  }

  closeCredModal() {
    this.credModalOpen = false;
    this.revealUser = false;
    this.revealPass = false;
    this.credForm.reset();
  }
  closeAuthModal() {

    this.authModalOpen = false;
    this.authForm.reset();
  }

  closeChangeModal() {
    this.changePasswordModalOpen = false;
    this.changePasswordForm.reset();
  }

  openSaveCredModal() {
    this.credModalMode = 'create';
    this.credForm = new FormGroup({
      id: new FormControl(-1),
      site: new FormControl(''),
      username: new FormControl(''),
      password: new FormControl('')
    });
    this.credModalOpen = true;
  }

  openViewCredModal(credentials: any) {
    this.credModalMode = 'view';
    this.credForm = new FormGroup({
      id: new FormControl(credentials.id),
      site: new FormControl(credentials.site),
      username: new FormControl(credentials.username),
      password: new FormControl(credentials.password)
    });
    this.credModalOpen = true;
  }

  credModalConfirm() {
    let credentials = this.credForm.value;
    if (this.credModalMode === 'create') {
      this.saveCredentials(credentials);
    } else {
      this.credModalMode = 'create';
    }
    console.log(credentials);
  }


  openAuthModal(mode: string) {
    this.authModalOpen = true;
    this.authModalMode = mode;
    this.authForm = new FormGroup({
      username: new FormControl(''),
      password: new FormControl('')
    });
  }

  authModalConfirm() {
    let credentials = this.authForm.value;
    if (this.authModalMode === 'signup') {
      this.createUser(credentials);
    } else {
      this.login(credentials);
    }
  }

  login(credentials) {
    this.backend.login(credentials).subscribe(
      response => {
        this.localstorage.store('authToken', response.authToken);
        this.localstorage.store('username', credentials.username);
        this.localstorage.store('password', credentials.password);
        this.toastr.success('Autentificat cu succes');
        this.isLoggedIn = true;
        this.closeAuthModal();
        this.refreshStash();
      },
      () => {
        this.toastr.error("Date de autentificare incorecete");
      }
    );
  }

  refreshStash() {
    this.blockUI.start('Se incarca credentialele...');
    this.backend.getStash(this.localstorage.retrieve('password')).subscribe(
      (data) => {
        this.stash = data;
        this.blockUI.stop();
    });
  }

  logout() {
    this.localstorage.clear();
    this.isLoggedIn = false;
    this.toastr.success("Deconectat cu succes");
  }

  createUser(credentials) {
    this.backend.createAccount(credentials).subscribe(
      data => {
        this.toastr.info(data);
        this.closeAuthModal();
      },
      error => {
        this.authForm.markAsDirty();
        this.toastr.error(error.error);
      }
    )
  }


  openChangePasswordModal(){
    this.changePasswordModalOpen = true;
    this.changePasswordForm = new FormGroup({
      password: new FormControl('')
    });
  }


  changePassword() {
    this.blockUI.start("Parola principala in process de schimbare...");
    const newPass = this.changePasswordForm.value.password;
    this.backend.changePassword(this.localstorage.retrieve('password'), newPass).subscribe(
      data => {
        this.blockUI.stop();
        this.toastr.info(data);
        this.closeChangeModal();
        this.login({username:this.localstorage.retrieve('username'),password:newPass})
      },
      error => {
        this.toastr.error(error.error);
      }
    );
  }


}
