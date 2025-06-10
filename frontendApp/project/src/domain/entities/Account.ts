import { Entity } from './Entity';
import { Money } from '../value-objects/Money';
import { AccountType } from '../value-objects/AccountType';
import { AccountNumber } from '../value-objects/AccountNumber';
import { IBAN } from '../value-objects/IBAN';

export class Account extends Entity {
  private _userId: string;
  private _type: AccountType;
  private _balance: Money;
  private _accountNumber: AccountNumber;
  private _iban: IBAN;
  private _createdAt: Date;

  constructor(
    id: string,
    userId: string,
    type: AccountType,
    balance: Money,
    accountNumber: AccountNumber,
    iban: IBAN,
    createdAt: Date
  ) {
    super(id);
    this._userId = userId;
    this._type = type;
    this._balance = balance;
    this._accountNumber = accountNumber;
    this._iban = iban;
    this._createdAt = createdAt;
  }

  get userId(): string {
    return this._userId;
  }

  get type(): AccountType {
    return this._type;
  }

  get balance(): Money {
    return this._balance;
  }

  get accountNumber(): AccountNumber {
    return this._accountNumber;
  }

  get iban(): IBAN {
    return this._iban;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  deposit(amount: Money): void {
    if (amount.value <= 0) {
      throw new Error('Deposit amount must be positive');
    }
    this._balance = this._balance.add(amount);
  }

  withdraw(amount: Money): void {
    if (amount.value <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }
    if (amount.value > this._balance.value) {
      throw new Error('Insufficient funds');
    }
    this._balance = this._balance.subtract(amount);
  }

  transfer(amount: Money, targetAccount: Account): void {
    this.withdraw(amount);
    targetAccount.deposit(amount);
  }
}