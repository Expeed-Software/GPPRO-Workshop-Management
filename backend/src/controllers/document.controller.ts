import { Request, Response, NextFunction } from 'express';
import * as attachSvc from '../services/attachment.service';
import * as docSvc from '../services/document.service';
import * as remarkSvc from '../services/remark.service';
import { sendSuccess } from '../utils/response';

// Attachments
export const listAttachments = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await attachSvc.listAttachments(req.query, req.user!)); } catch (e) { next(e); }
};
export const uploadAttachment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await attachSvc.uploadAttachment({ ...req.body, userId: req.user!.id }, req.user!);
    res.status(201); sendSuccess(res, data);
  } catch (e) { next(e); }
};
export const editAttachment = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await attachSvc.editAttachmentMetadata(Number(req.params.id), req.body, req.user!)); } catch (e) { next(e); }
};
export const deleteAttachment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await attachSvc.deleteAttachment(Number(req.params.id), req.body.confirmed === true, req.user!);
    sendSuccess(res, { message: 'Attachment deleted.' });
  } catch (e) { next(e); }
};
export const bulkUpload = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await attachSvc.bulkUploadAttachments(req.body.files || [], req.user!)); } catch (e) { next(e); }
};
export const bulkDelete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await attachSvc.bulkDeleteAttachments(req.body.ids || [], req.body.confirmed === true, req.user!);
    sendSuccess(res, { message: 'Attachments deleted.' });
  } catch (e) { next(e); }
};
export const getDocAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await attachSvc.getAuditLogs(req.query, req.user!)); } catch (e) { next(e); }
};

// Documents
export const listDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await docSvc.listDocuments(req.query, req.user!)); } catch (e) { next(e); }
};
export const createDocument = async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201); sendSuccess(res, await docSvc.createDocument(req.body, req.user!)); } catch (e) { next(e); }
};
export const editDocument = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await docSvc.editDocument(Number(req.params.id), req.body, req.user!)); } catch (e) { next(e); }
};
export const deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
  try { await docSvc.deleteDocument(Number(req.params.id), req.user!); sendSuccess(res, { message: 'Document deleted.' }); } catch (e) { next(e); }
};
export const updateDocumentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try { await docSvc.updateDocumentStatus(Number(req.params.id), req.body.status, req.user!); sendSuccess(res, { message: 'Status updated.' }); } catch (e) { next(e); }
};
export const linkDocument = async (req: Request, res: Response, next: NextFunction) => {
  try { await docSvc.linkDocument(Number(req.params.id), req.body.entityId, req.body.entityType, req.user!); sendSuccess(res, { message: 'Document linked.' }); } catch (e) { next(e); }
};
export const getDocumentMenuData = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await docSvc.getDocumentMenuData(req.user!)); } catch (e) { next(e); }
};
export const listDocumentHeads = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await docSvc.listDocumentHeads(req.query, req.user!)); } catch (e) { next(e); }
};
export const createDocumentHead = async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201); sendSuccess(res, await docSvc.createDocumentHead(req.body, req.user!)); } catch (e) { next(e); }
};
export const editDocumentHead = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await docSvc.editDocumentHead(Number(req.params.id), req.body, req.user!)); } catch (e) { next(e); }
};
export const createDocumentType = async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201); sendSuccess(res, await docSvc.createDocumentType(req.body, req.user!)); } catch (e) { next(e); }
};
export const editDocumentType = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await docSvc.editDocumentType(Number(req.params.id), req.body, req.user!)); } catch (e) { next(e); }
};
export const createDocumentCategory = async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201); sendSuccess(res, await docSvc.createDocumentCategory(req.body, req.user!)); } catch (e) { next(e); }
};
export const editDocumentCategory = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await docSvc.editDocumentCategory(Number(req.params.id), req.body, req.user!)); } catch (e) { next(e); }
};

// Remarks
export const listRemarks = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await remarkSvc.listRemarks(req.query, req.user!)); } catch (e) { next(e); }
};
export const addRemark = async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201); sendSuccess(res, await remarkSvc.addRemark(req.body, req.user!)); } catch (e) { next(e); }
};
export const editRemark = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await remarkSvc.editRemark(Number(req.params.id), req.body.remark, req.user!)); } catch (e) { next(e); }
};
export const deleteRemark = async (req: Request, res: Response, next: NextFunction) => {
  try { await remarkSvc.deleteRemark(Number(req.params.id), req.user!); sendSuccess(res, { message: 'Remark deleted.' }); } catch (e) { next(e); }
};
export const getRemarkHistory = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await remarkSvc.getRemarkHistory(Number(req.query.transactionId), req.user!)); } catch (e) { next(e); }
};
export const getRemarksReport = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await remarkSvc.getRemarksReport(req.query, req.user!)); } catch (e) { next(e); }
};
