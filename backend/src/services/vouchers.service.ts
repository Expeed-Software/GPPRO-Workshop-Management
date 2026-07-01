import * as repo from '../repositories/vouchers.repository';

type Roles = string[];
const SUP_ADMIN = ['Supervisor', 'Administrator'];
const FINANCE = ['Accountant', 'Finance Supervisor', 'Administrator', 'Supervisor'];

function checkRole(roles: Roles, allowed: string[]) {
  if (!roles.some((r) => allowed.includes(r))) throw Object.assign(new Error('Forbidden'), { status: 403 });
}

function validateVoucher(body: any) {
  const required = ['entryDate', 'narration'];
  for (const f of required) if (!body[f]) throw Object.assign(new Error(`${f} is required (BR-113)`), { status: 422 });
  const lines = body.lines ?? [];
  const totalDr = lines.reduce((s: number, l: any) => s + Number(l.debit ?? 0), 0);
  const totalCr = lines.reduce((s: number, l: any) => s + Number(l.credit ?? 0), 0);
  if (Math.abs(totalDr - totalCr) > 0.01) throw Object.assign(new Error('Debits must equal Credits (BR-110)'), { status: 422 });
  if (lines.length < 2) throw Object.assign(new Error('Voucher must have at least 2 lines'), { status: 422 });
}

export const getVouchers = (p: any, roles: Roles) => { checkRole(roles, FINANCE); return repo.getVouchers(p); };
export const getVouchersNew = (p: any, roles: Roles) => { checkRole(roles, FINANCE); return repo.getVouchersNew(p); };
export const getVouchersPdc = (p: any, roles: Roles) => { checkRole(roles, FINANCE); return repo.getVouchersPdc(p); };
export const getVoucherSummary = (p: any, roles: Roles) => { checkRole(roles, FINANCE); return repo.getVoucherSummary(p); };
export const getVoucherSummaryPdc = (p: any, roles: Roles) => { checkRole(roles, FINANCE); return repo.getVoucherSummaryPdc(p); };
export const getVoucherDetails = (p: any, roles: Roles) => { checkRole(roles, FINANCE); return repo.getVoucherDetails(p); };
export const getAccountVouchers = (p: any, roles: Roles) => { checkRole(roles, FINANCE); return repo.getAccountVouchers(p); };

export const createVoucher = async (body: any, roles: Roles, userId: number) => {
  checkRole(roles, SUP_ADMIN); // BR-112
  validateVoucher(body); // BR-110, BR-113
  const result = await repo.insertVoucher(body);
  await repo.writeVoucherAuditLog({ userId, action: 'CREATE_VOUCHER', entityId: result?.[0]?.id ?? 0, entityType: 'voucher' });
  return result;
};

export const createVoucherBulk = async (body: any, roles: Roles, userId: number) => {
  checkRole(roles, SUP_ADMIN); // BR-112
  const result = await repo.insertVoucherBulk(body);
  await repo.writeVoucherAuditLog({ userId, action: 'BULK_VOUCHER', entityId: 0, entityType: 'voucher' });
  return result;
};

export const approveVoucherBatch = async (body: any, roles: Roles, userId: number) => {
  checkRole(roles, SUP_ADMIN);
  const result = await repo.approveVoucherBatch(body);
  await repo.writeVoucherAuditLog({ userId, action: `${body.action?.toUpperCase() ?? 'APPROVE'}_VOUCHER_BATCH`, entityId: 0, entityType: 'voucher' });
  return result;
};

export const deleteVoucher = async (body: any, roles: Roles, userId: number) => {
  checkRole(roles, SUP_ADMIN); // BR-102
  const result = await repo.deleteVoucher(body);
  await repo.writeVoucherAuditLog({ userId, action: 'DELETE_VOUCHER', entityId: body.id, entityType: 'voucher' });
  return result;
};

export const createPdcIssue = async (body: any, roles: Roles, userId: number) => {
  checkRole(roles, SUP_ADMIN);
  const result = await repo.insertPdcIssue(body);
  await repo.writeVoucherAuditLog({ userId, action: 'CREATE_PDC_ISSUE', entityId: result?.[0]?.id ?? 0, entityType: 'pdc' });
  return result;
};

export const createPdcReceipt = async (body: any, roles: Roles, userId: number) => {
  checkRole(roles, SUP_ADMIN);
  const result = await repo.insertPdcReceipt(body);
  await repo.writeVoucherAuditLog({ userId, action: 'CREATE_PDC_RECEIPT', entityId: result?.[0]?.id ?? 0, entityType: 'pdc' });
  return result;
};
