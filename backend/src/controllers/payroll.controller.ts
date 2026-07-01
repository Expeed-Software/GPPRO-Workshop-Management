import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/payroll.service';
import { sendSuccess } from '../utils/response';

// ─── Employee ─────────────────────────────────────────────────────────────────

export async function listEmployees(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await svc.listEmployees(req.query)); } catch (e) { next(e); }
}

export async function getEmployee(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await svc.getEmployeeById(req.params.empId)); } catch (e) { next(e); }
}

export async function createEmployee(req: Request, res: Response, next: NextFunction) {
  try { res.status(201); sendSuccess(res, await svc.createEmployee(req.body)); } catch (e) { next(e); }
}

export async function updateEmployee(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await svc.updateEmployee(req.params.empId, req.body)); } catch (e) { next(e); }
}

export async function deactivateEmployee(req: Request, res: Response, next: NextFunction) {
  try { await svc.deactivateEmployee(req.params.empId); sendSuccess(res, { message: 'Deactivated.' }); } catch (e) { next(e); }
}

// ─── Salary ───────────────────────────────────────────────────────────────────

export async function getSalary(req: Request, res: Response, next: NextFunction) {
  try {
    const { empId, month, year } = req.params;
    sendSuccess(res, await svc.getSalary(empId, month, year));
  } catch (e) { next(e); }
}

export async function saveSalary(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await svc.saveSalary(req.body)); } catch (e) { next(e); }
}

// ─── Clocking ─────────────────────────────────────────────────────────────────

export async function listClocking(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await svc.listClocking(req.query)); } catch (e) { next(e); }
}

export async function clockIn(req: Request, res: Response, next: NextFunction) {
  try { res.status(201); sendSuccess(res, await svc.clockIn(req.body)); } catch (e) { next(e); }
}

export async function clockOut(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await svc.clockOut(req.params.id, req.body)); } catch (e) { next(e); }
}
