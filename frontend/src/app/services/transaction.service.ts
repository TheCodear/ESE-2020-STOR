import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {NewTransaction, Transaction} from "../models/transaction.model";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(private httpClient: HttpClient) { }

  /** post requests **/
  //should be used in product-detail/shipping
  buyProduct(transaction: NewTransaction): Observable<any>{
    return this.httpClient.post(environment.endpointURL + 'transaction/', transaction);
  }

  /** put requests **/
  sellProduct(transaction: Transaction): Observable<Transaction> {
    return this.httpClient.put<Transaction>(environment.endpointURL + 'transaction/confirm/' + transaction.transactionId, transaction);
  }

  declineProduct(transaction: Transaction): Observable<Transaction> {
    return this.httpClient.put<Transaction>(environment.endpointURL + 'transaction/decline/' + transaction.transactionId, transaction);
  }
}
