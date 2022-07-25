import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { ContractService } from '../services/contract.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(public contractService: ContractService) {}

  async canActivate(): Promise<boolean> {
    var walletData: any = localStorage.getItem('walletData');

    if (walletData != null) {
      var jsonObj: any = JSON.parse(walletData);

      let getTokensRes = this.contractService.decryptObj(
        jsonObj.WCtoken,
        jsonObj.address
      );

      if (getTokensRes.tokens.length) {
        return true;
      }
    }
    return false;
  }
}
