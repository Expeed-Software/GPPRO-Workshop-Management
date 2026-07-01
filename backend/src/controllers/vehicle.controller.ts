import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/vehicle.service';
import { sendSuccess } from '../utils/response';

export const listVehicles = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await svc.listVehicles(req.query, req.user!)); } catch (e) { next(e); }
};

export const getVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await svc.getVehicleById(Number(req.params.vehId), req.user!)); } catch (e) { next(e); }
};

export const createVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.createVehicle(req.body, req.user!);
    res.status(201); sendSuccess(res, data);
  } catch (e) { next(e); }
};

export const updateVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await svc.updateVehicle(Number(req.params.vehId), req.body, req.user!)); } catch (e) { next(e); }
};

export const deleteVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await svc.deleteVehicle(Number(req.params.vehId), req.user!);
    sendSuccess(res, { message: 'Vehicle deleted.' });
  } catch (e) { next(e); }
};

export const mergeVehicles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { masterId, duplicateIds, fieldMap } = req.body;
    await svc.mergeVehicles(masterId, duplicateIds, fieldMap, req.user!);
    sendSuccess(res, { message: 'Vehicles merged.' });
  } catch (e) { next(e); }
};

export const searchVehicles = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await svc.searchVehicles(req.query, req.user!)); } catch (e) { next(e); }
};
