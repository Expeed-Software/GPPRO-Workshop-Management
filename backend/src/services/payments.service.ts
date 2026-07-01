import * as repo from '../repositories/payments.repository';

type Roles = string[];

const SUP_ADMIN = ['Supervisor', 'Administrator'];
const FINANCE = ['Accountant', 'Finance Supervisor', 'Administrator', 'Supervisor'];

function checkRole(roles: Roles, allowed: string[]) {
  if (!roles.some((r) => allowed.includes(r))) throw Object.assign(new Error('Forbidden'), { status: 403 });
}

function validatePayment(body: any) {
  const required = ['paymentDate', 'payeeType', 'payee', 'paymentType', 'amount'];
  for (const f of required) if (!body[f]) throw Object.assign(new Error(`${f} is required (BR-113)`), { status: 422 });
  if (Number(body.amount) <= 0) throw Object.assign(new Error('Amount must be > 0 (BR-113)'), { status: 422 });
  if (body.paymentType === 'Cheque' && !body.refNo) throw Object.assign(new Error('refNo required for cheque payments'), { status: 422 });
}

export const getPayments = async (params: any, roles: Roles) => {
  checkRole(roles, FINANCE);
  return repo.getPayments(params);
};

export const createPayment = async (body: any, roles: Roles, userId: number) => {
  checkRole(roles, FINANCE);
  validatePayment(body);
  const result = await repo.insertPayment(body);
  await repo.writePaymentAuditLog({ userId, action: 'CREATE_PAYMENT', entityId: result?.[0]?.id ?? 0 });
  return result;
};

export const updatePaymentStatus = async (body: any, roles: Roles, userId: number) => {
  checkRole(roles, SUP_ADMIN); // BR-100
  const result = await repo.updatePayment(body);
  await repo.writePaymentAuditLog({ userId, action: 'UPDATE_PAYMENT', entityId: body.id });
  return result;
};

export const deletePayment = async (body: any, roles: Roles, userId: number) => {
  checkRole(roles, SUP_ADMIN);
  const result = await repo.deletePayment(body);
  await repo.writePaymentAuditLog({ userId, action: 'DELETE_PAYMENT', entityId: body.id });
  return result;
};

export const finalizePayments = async (body: any, roles: Roles, userId: number) => {
  checkRole(roles, SUP_ADMIN); // BR-100
  const result = await repo.finalizePayments(body);
  await repo.writePaymentAuditLog({ userId, action: 'FINALIZE_PAYMENT', entityId: 0 });
  return result;
};

export const approvePaymentBatch = async (body: any, roles: Roles, userId: number) => {
  checkRole(roles, SUP_ADMIN); // BR-112
  const result = await repo.approvePaymentBatch(body);
  await repo.writePaymentAuditLog({ userId, action: `${body.action?.toUpperCase() ?? 'APPROVE'}_PAYMENT_BATCH`, entityId: 0 });
  return result;
};

export const getPaymentReport = (params: any, roles: Roles) => {
  checkRole(roles, FINANCE); // BR-117
  return repo.getPaymentReport(params);
};
