import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/contact.service';
import { sendSuccess } from '../utils/response';

export const listContacts = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await svc.listContacts(req.query, req.user!)); } catch (e) { next(e); }
};

export const getContact = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await svc.getContactById(Number(req.params.id), req.user!)); } catch (e) { next(e); }
};

export const createContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.createContact(req.body, req.user!);
    res.status(201); sendSuccess(res, data);
  } catch (e) { next(e); }
};

export const updateContact = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await svc.updateContact(Number(req.params.id), req.body, req.user!)); } catch (e) { next(e); }
};

export const deleteContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await svc.deleteContact(Number(req.params.id), req.user!);
    sendSuccess(res, { message: 'Contact deleted.' });
  } catch (e) { next(e); }
};

export const checkDuplicate = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await svc.checkDuplicateContact(req.body, req.user!)); } catch (e) { next(e); }
};

export const mergeContacts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { masterId, duplicateIds, fieldMap } = req.body;
    await svc.mergeContacts(masterId, duplicateIds, fieldMap, req.user!);
    sendSuccess(res, { message: 'Contacts merged.' });
  } catch (e) { next(e); }
};

export const importContacts = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await svc.importContacts(req.body.rows || [], req.user!)); } catch (e) { next(e); }
};

export const exportContacts = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await svc.exportContacts(req.query, req.user!)); } catch (e) { next(e); }
};
