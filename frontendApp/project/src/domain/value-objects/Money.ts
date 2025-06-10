import Decimal from 'decimal.js';

export class Money {
  private readonly _value: Decimal;
  private readonly _currency: string;

  constructor(value: number | string | Decimal, currency: string = 'USD') {
    this._value = new Decimal(value);
    this._currency = currency;
  }

  get value(): number {
    return this._value.toNumber();
  }

  get currency(): string {
    return this._currency;
  }

  add(money: Money): Money {
    this.assertSameCurrency(money);
    return new Money(this._value.plus(money._value), this._currency);
  }

  subtract(money: Money): Money {
    this.assertSameCurrency(money);
    return new Money(this._value.minus(money._value), this._currency);
  }

  multiply(multiplier: number): Money {
    return new Money(this._value.times(multiplier), this._currency);
  }

  divide(divisor: number): Money {
    if (divisor === 0) {
      throw new Error('Cannot divide by zero');
    }
    return new Money(this._value.dividedBy(divisor), this._currency);
  }

  equals(money: Money): boolean {
    return this._currency === money._currency && this._value.equals(money._value);
  }

  greaterThan(money: Money): boolean {
    this.assertSameCurrency(money);
    return this._value.greaterThan(money._value);
  }

  lessThan(money: Money): boolean {
    this.assertSameCurrency(money);
    return this._value.lessThan(money._value);
  }

  format(): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this._currency
    }).format(this.value);
  }

  private assertSameCurrency(money: Money): void {
    if (this._currency !== money._currency) {
      throw new Error('Cannot operate on money with different currencies');
    }
  }
}