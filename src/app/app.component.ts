import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CustomerListReponseModel, UpsertRequestModel } from '../model/customer.model';
import { HttpClient, HttpClientModule, HttpResponse } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import swal from 'sweetalert2';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule, CommonModule, NgbModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [DatePipe]
})
export class AppComponent implements OnInit {
  submitted: boolean = false;
  customerList: CustomerListReponseModel[] = [];
  customerForm: FormGroup;
  customerGuid: string = null;
  modalTitle: string = null;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private datePipe: DatePipe,
    private modalService: NgbModal
  ) {

  }

  ngOnInit(): void {
    this.customerForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
    });
    this.getCustomerList();
  }

  get f() {
    return this.customerForm.controls;
  }

  onSubmit() {
    this.customerForm.markAllAsTouched();
    this.submitted = true;
    if (this.customerForm.invalid) {
      return; 
    }

    const data: UpsertRequestModel = {
      customerGuid: this.customerGuid,
      name: this.f.name.value,
      email: this.f.email.value
    };

    this.addCustomer(data);
  }

  getCustomerList ()  {
    this.http.get('https://localhost:7102/api/Customer').subscribe((res: CustomerListReponseModel[]) => {
      this.customerList = res;
    });
  }

  addCustomer(data: any) {
    this.http.post('https://localhost:7102/api/Customer', data, { observe: 'response' })
      .subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.status === 200) {
            swal.fire({
              title: this.customerGuid ? 'Update customer information successfully.' : 'Create new customer successfully.',
              icon: 'success'
            }).then(() => {
              this.getCustomerList();
              this.closeModalFunction();
            });
          }
        },
        error: (error) => {
          swal.fire({
            title: error.error,
            icon: 'error'
          });
        }
      });
  }

  deleteCustomerConfirmation(customerGuid: string) {
    swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to delete?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteCustomer(customerGuid).subscribe((res) => {
          swal.fire('Deleted!', 'Customer has been deleted.', 'success').then(() => {
            this.getCustomerList();
          });
        });
      }
    });
  }

  deleteCustomer(customerGuid: string) {
    return this.http.post<any>(`https://localhost:7102/api/Customer/${customerGuid}`, null);
  }

  adjustDate(dateString: string): string {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 8);
    return this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss');
  }

  getCustomerDetails(customerGuid: string) { 
    return this.http.get<any>(`https://localhost:7102/api/Customer/${customerGuid}`);
  }

  openModalFunction(content:any, isCreate, customerGuid: string = null){
    this.submitted = false;
    this.customerGuid = customerGuid;
    this.modalTitle = !customerGuid ? 'Create Customer Modal' : 'Update Customer Modal';
    if (isCreate) {
      this.customerForm.reset();
      this.modalService.open(content);
    } else {
      this.getCustomerDetails(customerGuid).subscribe(res => {
        this.customerForm.patchValue({
          name: res.name,
          email: res.email
        });
        this.modalService.open(content);  
      });
    }
  }

  closeModalFunction(){
    this.modalService.dismissAll();
  }
}
