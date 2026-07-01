import * as repo from '../repositories/document.repository';
import * as auditRepo from '../repositories/attachment.repository';
import { ForbiddenError, NotFoundError } from '../utils/errors';

function assertRole(userRoles: string[], allowed: string[], msg = 'Forbidden') {
  if (!userRoles.some((r) => allowed.includes(r))) throw new ForbiddenError(msg);
}

export async function listDocuments(filters: any, user: any) {
  const result = await repo.listDocuments(filters);
  return result.recordset || [];
}

export async function getDocumentById(docId: number, user: any) {
  const result = await repo.getDocumentById(docId);
  const doc = result.recordset?.[0];
  if (!doc) throw new NotFoundError('Document not found.');
  return doc;
}

export async function createDocument(data: any, user: any) {
  assertRole(user.roles, ['Administrator', 'Supervisor', 'Standard User'], 'BR-31: Permission required.');
  const result = await repo.insertDocument({ ...data, createdBy: user.id });
  const newId = result.recordset?.[0]?.id || result.output?.id;
  await auditRepo.writeDocAuditLog({ entityId: newId, entityType: 'document', action: 'create', userId: user.id, after: data });
  return { id: newId, ...data };
}

export async function editDocument(docId: number, data: any, user: any) {
  assertRole(user.roles, ['Administrator', 'Supervisor', 'Standard User'], 'BR-31: Permission required.');
  const existing = await getDocumentById(docId, user);
  await repo.updateDocument(docId, { ...data, updatedBy: user.id });
  await auditRepo.writeDocAuditLog({ entityId: docId, entityType: 'document', action: 'edit', userId: user.id, before: existing, after: data });
  return { id: docId, ...data };
}

export async function deleteDocument(docId: number, user: any) {
  assertRole(user.roles, ['Administrator', 'Supervisor'], 'BR-31: Permission required to delete documents.');
  const existing = await getDocumentById(docId, user);
  await repo.deleteDocument(docId);
  await auditRepo.writeDocAuditLog({ entityId: docId, entityType: 'document', action: 'delete', userId: user.id, before: existing });
}

export async function updateDocumentStatus(docId: number, status: string, user: any) {
  assertRole(user.roles, ['Administrator', 'Supervisor', 'Standard User'], 'BR-31: Permission required.');
  await repo.updateDocumentStatus(docId, status);
  await auditRepo.writeDocAuditLog({ entityId: docId, entityType: 'document', action: `status-${status}`, userId: user.id, after: { status } });
}

export async function linkDocument(docId: number, entityId: number, entityType: string, user: any) {
  assertRole(user.roles, ['Administrator', 'Supervisor', 'Standard User'], 'BR-31: Permission required.');
  await repo.linkDocument(docId, entityId, entityType);
  await auditRepo.writeDocAuditLog({ entityId: docId, entityType: 'document', action: 'link', userId: user.id, after: { entityId, entityType } });
}

export async function listDocumentHeads(filters: any, user: any) {
  const result = await repo.getDocumentHeads(filters);
  return result.recordset || [];
}

export async function createDocumentHead(data: any, user: any) {
  assertRole(user.roles, ['Administrator'], 'BR-38: Only Administrator can manage document heads.');
  const result = await repo.insertDocumentHead({ ...data, createdBy: user.id });
  const newId = result.recordset?.[0]?.id || result.output?.id;
  await auditRepo.writeDocAuditLog({ entityId: newId, entityType: 'dochead', action: 'create', userId: user.id, after: data });
  return { id: newId, ...data };
}

export async function editDocumentHead(id: number, data: any, user: any) {
  assertRole(user.roles, ['Administrator', 'Supervisor'], 'BR-38: Permission required.');
  await repo.updateDocumentHead(id, { ...data, updatedBy: user.id });
  await auditRepo.writeDocAuditLog({ entityId: id, entityType: 'dochead', action: 'edit', userId: user.id, after: data });
  return { id, ...data };
}

export async function getDocumentMenuData(user: any) {
  const result = await repo.getDocumentMenuData();
  return result.recordset || [];
}

export async function createDocumentType(data: any, user: any) {
  assertRole(user.roles, ['Administrator'], 'BR-38: Only Administrator can create document types.');
  return repo.insertDocumentType({ ...data, createdBy: user.id });
}

export async function editDocumentType(id: number, data: any, user: any) {
  assertRole(user.roles, ['Administrator'], 'BR-38: Only Administrator can edit document types.');
  return repo.updateDocumentType(id, data);
}

export async function createDocumentCategory(data: any, user: any) {
  assertRole(user.roles, ['Administrator'], 'BR-38: Only Administrator can create document categories.');
  return repo.insertDocumentCategory({ ...data, createdBy: user.id });
}

export async function editDocumentCategory(id: number, data: any, user: any) {
  assertRole(user.roles, ['Administrator'], 'BR-38: Only Administrator can edit document categories.');
  return repo.updateDocumentCategory(id, data);
}

export async function listDocumentTypes(filters: any) {
  const result = await repo.listDocumentTypes(filters);
  return result.recordset || [];
}

export async function listDocumentCategories(filters: any) {
  const result = await repo.listDocumentCategories(filters);
  return result.recordset || [];
}

export async function getDocumentTemplates(filters: any) {
  const result = await repo.getDocumentTemplates(filters);
  return result.recordset || [];
}
