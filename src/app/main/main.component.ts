import { BackendService } from '../services/backend.service';
import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { saveAs } from 'file-saver';

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
  newFile: File;
  fileStash: any;

  fileModalOpen = false;
  selectedFile:any;


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


  public onFileChanged(event) {
    this.newFile = event.target.files[0];
  }

  onUpload() {
    var reader = new FileReader();
    var fileByteArray: Uint8Array;
    this.blockUI.start("Se incarca fisierul...");
    reader.readAsArrayBuffer(this.newFile);
    reader.onloadend = (e) => {
      let bytes = [];
      fileByteArray = new Uint8Array(e.target.result as ArrayBuffer);
      for (var i=0; i<fileByteArray.length; i++) {
                bytes[i]=fileByteArray[i];
            }
      const fileDto = {
          name:this.newFile.name,
          type:this.newFile.type,
          bytes:bytes
        }
        console.log(fileDto);
        this.backend.saveFile({password:this.localstorage.retrieve("password"),fileDto:fileDto}).subscribe(
          data=>{
            this.blockUI.stop();
            this.toastr.success(data);
            this.refreshFileStash();
          },
          error=>{
            this.toastr.error(error.error);
            this.blockUI.stop();
          }
        );
   };
  }


  openFileModal(name:string, id:number){
    this.selectedFile = {name:name,id:id};
    this.fileModalOpen = true;
    this.closeAuthModal();
    this.closeChangeModal();
    this.closeCredModal();
  }

  getWholeFile(id:number){
    this.backend.getWholeFile(this.localstorage.retrieve('password'),id)
      .subscribe((response) => {
        this.saveFile(response);
        this.closeFileModal();
      });
  }

  saveFile(response){
    const retrievedFile = 'data:'+response.body.type+';base64,' + response.body.bytes;
    saveAs(retrievedFile,response.body.name);
  }

  saveCredentials(credentials) {
    this.backend.saveCredentials(
      credentials,
      this.localstorage.retrieve('password')
    ).subscribe(data => {
      this.closeCredModal();
      this.refreshCredentialStash();
      this.toastr.info(data);
    },
      error => {
        this.toastr.error(error.error);
      }
    );
  }

  deleteFile() {
    this.backend.deleteFile(this.selectedFile.id).subscribe(data => {
      this.toastr.info(data);
      this.refreshFileStash();
      this.closeFileModal();
    },
      error => {
        this.toastr.error(error.error);
        this.closeFileModal();
      }
    );
  }

  deleteCredentials(id) {
    console.log(id);
    console.log(this.credForm.value);
    this.backend.deleteCredentials(id).subscribe(data => {
      this.toastr.info(data);
      this.refreshCredentialStash();
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

  closeFileModal() {
    if(this.fileModalOpen){
      this.fileModalOpen = false;
      this.selectedFile = {name:'',id:0};
    }
  }

  closeCredModal() {
    if(this.credModalOpen){
      this.credModalOpen = false;
      this.revealUser = false;
      this.revealPass = false;
      this.credForm.reset();
    }
  }
  closeAuthModal() {
    if(this.authModalOpen){
      this.authModalOpen = false;
      this.authForm.reset();
    }
  }

  closeChangeModal() {
    if(this.changePasswordModalOpen){
      this.changePasswordModalOpen = false;
      this.changePasswordForm.reset();
    }
  }

  openSaveCredModal() {
    this.closeAuthModal();
    this.closeChangeModal();
    this.closeFileModal();
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
    this.closeAuthModal();
    this.closeChangeModal();
    this.closeFileModal();
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

  cutString(name:string){
    if(name.length > 12){
      return name.substring(0,12)+"...";
    }
    return name;
  }

  refreshStash(){
    this.refreshCredentialStash();
    this.refreshFileStash();
  }

  refreshCredentialStash() {
    this.blockUI.start('Se incarca credentialele...');
    this.backend.getStash(this.localstorage.retrieve('password')).subscribe(
      (data) => {
        this.stash = data;
        this.blockUI.stop();
    });
  }

  refreshFileStash() {
    this.blockUI.start('Se incarca fisierele...');
    this.backend.getFiles(this.localstorage.retrieve('password')).subscribe(
      (data) => {
        this.fileStash = data;
        this.blockUI.stop();
    });
  }

  logout() {
    this.localstorage.clear();
    this.toastr.success("Deconectat cu succes");
    location.reload();
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
    this.closeAuthModal();
    this.closeCredModal();
    this.closeFileModal();
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
