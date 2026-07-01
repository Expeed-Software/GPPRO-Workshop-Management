import { callProcedure } from '../db/callProcedure';
import { getDbPool } from '../db/connection';
import sql from 'mssql';

export async function listAttachments(filters: { transactionId?: number; docType?: string; page?: number; limit?: number }) {
  return callProcedure('spListAttachments', filters);
}

export async function getAttachmentById(id: number) {
  return callProcedure('spAttachmentMetadata', { attachmentId: id });
}

export async function insertAttachment(data: Record<string, any>) {
  return callProcedure('spUploadAttachment', data);
}

export async function updateAttachment(id: number, data: Record<string, any>) {
  return callProcedure('spUpdateAttachment', { id, ...data });
}

export async function deleteAttachment(id: number) {
  return callProcedure('spDeleteAttachment', { id });
}

export async function bulkInsertAttachments(files: Record<string, any>[]) {
  return callProcedure('spBulkUploadAttachments', { files: JSON.stringify(files) });
}

export async function bulkDeleteAttachments(ids: number[]) {
  return callProcedure('spBulkDeleteAttachments', { ids: JSON.stringify(ids) });
}

export async function writeDocAuditLog(entry: {
  entityId: number; entityType: string; action: string; userId: number; before?: any; after?: any
}) {
  return callProcedure('spInsertDocAuditLog', {
    entityId: entry.entityId, entityType: entry.entityType,
    action: entry.action, userId: entry.userId,
    before: JSON.stringify(entry.before || null),
    after: JSON.stringify(entry.after || null),
  });
}

export async function listDocAuditLogs(params: { docId?: number; userId?: number; fromDate?: string; toDate?: string }) {
  return callProcedure('spListDocAuditLogs', params);
}
