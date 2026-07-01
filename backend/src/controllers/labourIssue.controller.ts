import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/labourIssue.service';
import { sendSuccess } from '../utils/response';

export async function list(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await svc.getLabourIssues(req.query)); } catch (e) { next(e); }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await svc.getLabourIssueById(req.params.id)); } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try { res.status(201); sendSuccess(res, await svc.createLabourIssue(req.body)); } catch (e) { next(e); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await svc.updateLabourIssue(req.params.id, req.body)); } catch (e) { next(e); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try { await svc.deleteLabourIssue(req.params.id); sendSuccess(res, { message: 'Deleted.' }); } catch (e) { next(e); }
}
