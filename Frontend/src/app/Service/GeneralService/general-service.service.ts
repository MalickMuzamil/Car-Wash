import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import Swal from 'sweetalert2';


const apiUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class GeneralServiceService {

  constructor(private http: HttpClient) { }
  showMessage(type: 'success' | 'error' | 'info', message: string) {
    console.log('Show Message Called:', type, message);
    Swal.fire({
      position: 'top',
      toast: true,
      icon: type,
      title: type.toUpperCase(),
      text: message,
      timer: 4000,
      showConfirmButton: false,
    });
  }

  logout(type: 'success', message: string) {
    Swal.fire({
      position: 'top',
      toast: true,
      icon: type,
      title: type.toUpperCase(),
      text: message,
      timer: 4000,
      showConfirmButton: false,
    });
  }

  confirmDialog(title: string, text: string, icon: any = 'warning'): Promise<boolean> {
    return Swal.fire({
      title: title,
      text: text,
      icon: icon,
      position: 'top',
      toast: true,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      return result.isConfirmed;
    });
  }



}
