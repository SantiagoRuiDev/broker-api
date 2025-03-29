export interface IPolicy {
    id: string;
    policyNumber: string;
    clientId: string;
    insuranceCompanyId: string;
    subagentId: string;
    issueDate: Date;
    status: "vigente" | "pendiente" | "expirada";
    totalAmount: number;
    amountPaid: number;
    signedByClient: boolean;
    signedPolicy: boolean;
    firstPaymentDone: boolean;
    released: boolean;
  };