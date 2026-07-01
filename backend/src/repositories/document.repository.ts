import { callProcedure } from '../db/callProcedure';

export async function listDocuments(filters: Record<string, any>) {
  return callProcedure('spListDocuments', filters);
}

export async function getDocumentById(docId: number) {
  return callProcedure('spDocumentPreview', { docId });
}

export async function insertDocument(data: Record<string, any>) {
  return callProcedure('spInsertDocument01', data);
}

export async function updateDocument(docId: number, data: Record<string, any>) {
  return callProcedure('spUpdateDocument01', { docId, ...data });
}

export async function deleteDocument(docId: number) {
  return callProcedure('spDeleteDocument01', { docId });
}

export async function updateDocumentStatus(docId: number, status: string) {
  return callProcedure('spDocumentStatusWorkflow', { docId, status });
}

export async function linkDocument(docId: number, entityId: number, entityType: string) {
  return callProcedure('spLinkDocument', { docId, entityId, entityType });
}

export async function getDocumentTemplates(filters: Record<string, any>) {
  return callProcedure('spGetDocumentTemplates', filters);
}

export async function createDocumentTemplate(data: Record<string, any>) {
  return callProcedure('spInsertDocumentType', data);
}

// Document Heads
export async function getDocumentHeads(filters: Record<string, any>) {
  return callProcedure('spGetDocumentHeads', filters);
}

export async function insertDocumentHead(data: Record<string, any>) {
  return callProcedure('spInsertDocHead', data);
}

export async function updateDocumentHead(id: number, data: Record<string, any>) {
  return callProcedure('spUpdateDocHead', { id, ...data });
}

export async function getDocumentMenuData() {
  return {
    recordset: [
      { id: 1, label: 'Create Document', path: '/documents/create', icon: 'file' },
      { id: 2, label: 'Manage Documents', path: '/documents/list', icon: 'folder' },
      { id: 3, label: 'Upload Attachments', path: '/documents/attachments', icon: 'upload' },
      { id: 4, label: 'Additional Remarks', path: '/documents/remarks', icon: 'chat' },
      { id: 5, label: 'Head Management', path: '/documents/heads', icon: 'settings' },
      { id: 6, label: 'Templates', path: '/documents/templates', icon: 'template' },
    ],
  };
}

// Document Types & Categories
export async function listDocumentTypes(filters: Record<string, any>) {
  return callProcedure('spListDocumentTypes', filters);
}

export async function insertDocumentType(data: Record<string, any>) {
  return callProcedure('spInsertDocumentType', data);
}

export async function updateDocumentType(id: number, data: Record<string, any>) {
  return callProcedure('spUpdateDocumentType', { id, ...data });
}

export async function listDocumentCategories(filters: Record<string, any>) {
  return callProcedure('spListDocumentCategories', filters);
}

export async function insertDocumentCategory(data: Record<string, any>) {
  return callProcedure('spInsertDocumentCategory', data);
}

export async function updateDocumentCategory(id: number, data: Record<string, any>) {
  return callProcedure('spUpdateDocumentCategory', { id, ...data });
}
