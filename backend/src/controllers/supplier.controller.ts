import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/supplier.service';
import { sendSuccess } from '../utils/response';

export const listSuppliers = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await svc.listSuppliers(req.query, req.user!)); } catch (e) { next(e); }
};

export const getSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await svc.getSupplierById(Number(req.params.id), req.user!)); } catch (e) { next(e); }
};

export const createSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.createSupplier(req.body, req.user!);
    res.status(201); sendSuccess(res, data);
  } catch (e) { next(e); }
};

export const updateSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await svc.updateSupplier(Number(req.params.id), req.body, req.user!)); } catch (e) { next(e); }
};

export const setSupplierStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await svc.setSupplierStatus(Number(req.params.id), req.body.status, req.body.reason, req.user!);
    sendSuccess(res, { message: 'Status updated.' });
  } catch (e) { next(e); }
};

export const deleteSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await svc.deleteSupplier(Number(req.params.id), req.user!);
    sendSuccess(res, { message: 'Supplier deleted.' });
  } catch (e) { next(e); }
};

export const mergeSuppliers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { masterId, duplicateIds, fieldMap } = req.body;
    await svc.mergeSuppliers(masterId, duplicateIds, fieldMap, req.user!);
    sendSuccess(res, { message: 'Suppliers merged.' });
  } catch (e) { next(e); }
};

export const importSuppliers = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await svc.importSuppliers(req.body.rows || [], req.user!)); } catch (e) { next(e); }
};

export const exportSuppliers = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await svc.exportSuppliers(req.query, req.user!)); } catch (e) { next(e); }
};

export const getAgewiseSummary = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await svc.getSupplierAgewiseSummary(req.query)); } catch (e) { next(e); }
};
