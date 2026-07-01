import * as repo from '../repositories/pettycash.repository';

type Roles = string[];
const SUP_ADMIN = ['Supervisor', 'Administrator'];
const FINANCE = ['Accountant', 'Finance Supervisor', 'Administrator', 'Supervisor'];

function checkRole(roles: Roles, allowed: string[]) {
  if (!roles.some((r) => allowed.includes(r))) throw Object.assign(new Error('Forbidden'), { status: 403 });
}

function validatePettyCash(body: any) {
  const required = ['txnDate', 'type', 'amount', 'purpose'];
  for (const f of required) if (!body[f]) throw Object.assign(new Error(`${f} is required (BR-113)`), { status: 422 });
  if (Number(body.amount) <= 0) throw Object.assign(new Error('Amount must be > 0'), { status: 422 });
}

export const getPettyCash = (p: any, roles: Roles) => {
  checkRole(roles, FINANCE);
  return repo.getPettyCash(p);
};

export const createPettyCash = async (body: any, roles: Roles, userId: number) => {
  checkRole(roles, FINANCE);
  validatePettyCash(body);
  // BR-104: SP enforces balance check
  const result = await repo.insertPettyCash(body);
  await repo.writePettyCashAuditLog({ userId, action: 'CREATE_PETTY_CASH', entityId: result?.[0]?.id ?? 0 });
  return result;
};

export const updatePettyCash = async (body: any, roles: Roles, userId: number) => {
  checkRole(roles, SUP_ADMIN);
  const result = await repo.updatePettyCash(body);
  await repo.writePettyCashAuditLog({ userId, action: 'UPDATE_PETTY_CASH', entityId: body.id });
  return result;
};

export const deletePettyCash = async (body: any, roles: Roles, userId: number) => {
  checkRole(roles, SUP_ADMIN); // BR-102
  const result = await repo.deletePettyCash(body);
  await repo.writePettyCashAuditLog({ userId, action: 'DELETE_PETTY_CASH', entityId: body.id });
  return result;
};

export const approvePettyCashBatch = async (body: any, roles: Roles, userId: number) => {
  checkRole(roles, SUP_ADMIN); // BR-112
  const result = await repo.approvePettyCashBatch(body);
  await repo.writePettyCashAuditLog({ userId, action: 'APPROVE_PETTY_CASH_BATCH', entityId: 0 });
  return result;
};
