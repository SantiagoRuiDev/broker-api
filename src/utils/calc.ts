import { ISettlement } from "../interfaces/settlement.interface";

export class Calc {
  private ADMINISTRATIVE_FEE = 0;
  private CONTRIBUTION_FEE = 0.005;
  private IVA_FEE = 0;
  private AGENT_FEE = 0;
  private RENT_FEE = 0;
  private IVA_RETENTION_PERCENTAGE = 0;
  private LOAN = 0;
  private PAYOUTS: ISettlement[] = [];

  constructor(
    IVA_FEE: number,
    AGENT_FEE: number,
    RENT_FEE: number,
    IVA_RET: number,
    ADM_FEE: number,
    LOAN: number,
    PAYOUTS: ISettlement[]
  ) {
    this.IVA_FEE = IVA_FEE;
    this.AGENT_FEE = AGENT_FEE;
    this.RENT_FEE = RENT_FEE;
    this.IVA_RETENTION_PERCENTAGE = IVA_RET;
    this.ADMINISTRATIVE_FEE = ADM_FEE;
    this.LOAN = LOAN;
    this.PAYOUTS = PAYOUTS;
  }

  calcAdministrative = () => {
    return (this.calcSubtotal() * this.ADMINISTRATIVE_FEE) / 100;
  };

  calcContribution = () => {
    let total = 0;
    for (const payout of this.PAYOUTS) {
      if (payout.comision && payout.comision > 0) {
        total += (payout.comision || 0) * (this.AGENT_FEE / 100);
      }
    }
    return total * this.CONTRIBUTION_FEE * 1;
  };

  calcIva = () => {
    return (this.calcSubtotal() * this.IVA_FEE) / 100;
  };

  calcIvaRetention = () => {
    return (this.calcIva() * this.IVA_RETENTION_PERCENTAGE) / 100;
  };

  calcRent = () => {
    return (this.calcSubtotal() * this.RENT_FEE) / 100;
  };

  calcSubtotal = () => {
    let total = 0;
    for (const payout of this.PAYOUTS) {
      total += (payout.comision || 0) * (this.AGENT_FEE / 100);
    }
    return total - this.calcContribution();
  };

  calcTotal = () => {
    return (
      this.calcSubtotal() +
      this.calcIva() -
      this.calcIvaRetention() -
      this.calcRent() -
      this.calcAdministrative() -
      this.LOAN
    );
  };

  static round(nm: number, dc: number) {
    const factor = Math.pow(10, dc);
    return Math.round(nm * factor) / factor;
  }
}
