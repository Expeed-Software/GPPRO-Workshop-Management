import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/customer.service';
import { sendSuccess } from '../utils/response';

export const listCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.listCustomers(req.query, req.user!);
    sendSuccess(res, data);
  } catch (e) { next(e); }
};

export const getCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.getCustomerById(Number(req.params.id), req.user!);
    sendSuccess(res, data);
  } catch (e) { next(e); }
};

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.createCustomer(req.body, req.user!);
    res.status(201);
    sendSuccess(res, data);
  } catch (e) { next(e); }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.updateCustomer(Number(req.params.id), req.body, req.user!);
    sendSuccess(res, data);
  } catch (e) { next(e); }
};

export const setCustomerStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await svc.setCustomerStatus(Number(req.params.id), req.body.status, req.body.reason, req.user!);
    sendSuccess(res, { message: 'Status updated.' });
  } catch (e) { next(e); }
};

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await svc.deleteCustomer(Number(req.params.id), req.user!);
    sendSuccess(res, { message: 'Customer deleted.' });
  } catch (e) { next(e); }
};

export const mergeCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { masterId, duplicateIds, fieldMap } = req.body;
    await svc.mergeCustomers(masterId, duplicateIds, fieldMap, req.user!);
    sendSuccess(res, { message: 'Customers merged successfully.' });
  } catch (e) { next(e); }
};

export const importCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = req.body.rows || [];
    const result = await svc.importCustomers(rows, req.user!);
    sendSuccess(res, result);
  } catch (e) { next(e); }
};

export const exportCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await svc.exportCustomers(req.query, req.user!);
    sendSuccess(res, result);
  } catch (e) { next(e); }
};

export const getAgewiseSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await svc.getCustomerAgewiseSummary(req.query, req.user!);
    sendSuccess(res, result);
  } catch (e) { next(e); }
};

export const getAuditLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await svc.getAuditLog(req.query, req.user!);
    sendSuccess(res, result);
  } catch (e) { next(e); }
};
