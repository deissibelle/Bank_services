import { Account } from '../../../domain/entities/Account';
import { IAccountRepository } from '../../../domain/repositories/IAccountRepository';
import { AccountType } from '../../../domain/value-objects/AccountType';
import { Money } from '../../../domain/value-objects/Money';
import { AccountNumber } from '../../../domain/value-objects/AccountNumber';
import { IBAN } from '../../../domain/value-objects/IBAN';
import { v4 as uuidv4 } from 'uuid';

interface CreateAccountDTO {
  userId: string;
  type: 'savings' | 'checking';
  initialBalance: number;
}

export class CreateAccountUseCase {
  constructor(private accountRepository: IAccountRepository) {}

  async execute(dto: CreateAccountDTO): Promise<Account> {
    const account = new Account(
      uuidv4(),
      dto.userId,
      new AccountType(dto.type),
      new Money(dto.initialBalance),
      new AccountNumber(),
      new IBAN(),
      new Date()
    );

    await this.accountRepository.save(account);
    return account;
  }
}