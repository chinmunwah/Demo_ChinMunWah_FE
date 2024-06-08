
export class CustomerGenericRequestModel { 
    customerGuid: string;
}

export class CustomerListReponseModel extends CustomerGenericRequestModel {
    id: number;
    name: string;
    email: string;
    createdDate: string;
    updatedDate: null | string;
    isDeleted: boolean;
}

export class UpsertRequestModel {
    customerGuid: string;
    name: string;
    email: string;
}