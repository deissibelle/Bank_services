import { create } from 'zustand';
import { Account } from '../../domain/entities/Account';
import { MockAccountRepository } from '../../infrastructure/repositories/MockAccountRepository';
import { CreateAccountUseCase } from '../../application/usecases/account/CreateAccountUseCase';

interface AccountState {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
  fetchAccounts: (userId: string) => Promise<void>;
  createAccount: (userId: string, type: 'savings' | 'checking', initialBalance: number) => Promise<void>;
}

const accountRepository = new MockAccountRepository();
const createAccountUseCase = new CreateAccountUseCase(accountRepository);

export const useAccountStore = create<AccountState>((set) => ({
  accounts: [],
  isLoading: false,
  error: null,

  fetchAccounts: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const accounts = await accountRepository.findByUserId(userId);
      set({ accounts, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch accounts', isLoading: false });
    }
  },

  createAccount: async (userId: string, type: 'savings' | 'checking', initialBalance: number) => {
    set({ isLoading: true, error: null });
    try {
      const account = await createAccountUseCase.execute({ userId, type, initialBalance });
      set((state) => ({
        accounts: [...state.accounts, account],
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to create account', isLoading: false });
    }
  }
}));