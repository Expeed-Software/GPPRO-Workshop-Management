import { callProcedure } from '../db/callProcedure';

export async function listRemarks(filters: { transactionId?: number; userId?: number; fromDate?: string; toDate?: string; page?: number }) {
  return callProcedure('spListAdditionalRemarks', filters);
}

export async function getRemarkById(id: number) {
  return callProcedure('spListAdditionalRemarks', { id });
}

export async function insertRemark(data: { transactionId: number; remark: string; userId: number }) {
  return callProcedure('spInsertAdditionalRemark', data);
}

export async function updateRemark(id: number, remark: string, userId: number) {
  return callProcedure('spUpdateAdditionalRemark', { id, remark, userId });
}

export async function deleteRemark(id: number) {
  return callProcedure('spDeleteAdditionalRemark', { id });
}

export async function getRemarkHistory(transactionId: number) {
  return callProcedure('spAdditionalRemarkHistory', { transactionId });
}

export async function getRemarksReport(filters: Record<string, any>) {
  return callProcedure('spAdditionalRemarksReport', filters);
}
