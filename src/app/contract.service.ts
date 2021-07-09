import { Injectable } from '@angular/core';
import bigInt from 'big-integer';
import {
  cost,
  mainnetAbi,
  mainnetContract,
  rinkebyAbi,
  rinkebyContract,
} from 'src/constants';

declare var Web3: any;
declare var window: any;

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  constructor() {}

  public signTransaction = async (totalToMint: number) => {
    var web3 = new Web3(Web3.givenProvider);
    window.contract = await new web3.eth.Contract(mainnetAbi, mainnetContract);
    const transactionParameters = {
      to: mainnetContract,
      from: (await this.getAccounts())[0],
      value: bigInt(cost).multiply(bigInt(totalToMint.toString())).toString(16),
      data: window.contract.methods.mintCraniums(totalToMint).encodeABI(),
    };
    try {
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });
      return `Check out your transaction on Etherscan: https://etherscan.io/tx/${txHash}`;
    } catch (error) {
      return `Something went wrong: ` + error.message;
    }
  };

  public getAccounts = async () => {
    try {
      let acc = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      return acc;
    } catch (e) {
      return [];
    }
  };

  public connectMetamask = async (): Promise<false | string[]> => {
    if (window.ethereum) {
      try {
        const result = await this.getAccounts();
        if (Array.isArray(result) && result.length > 0) {
          let acc = result[0];
          return acc;
        } else {
          console.log('The wallet has 0 addrs');
          return false;
        }
      } catch (err) {
        console.log('connection req failed');
        return false;
      }
    } else {
      console.log('window.ethereum evals to falsy');
      return false;
    }
  };
}
