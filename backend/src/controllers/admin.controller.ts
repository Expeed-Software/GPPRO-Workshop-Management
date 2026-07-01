import { Request, Response } from 'express';
import * as svc from '../services/admin.service';

type Roles = string[];
const roles = (req: Request): Roles => (req as any).user?.roles ?? [];
const uid = (req: Request): number => (req as any).user?.id ?? 0;

function h(fn: () => Promise<any>, res: Response) {
  fn().then((data) => res.json({ success: true, data })).catch((err) => {
    const status = err.status ?? 500;
    res.status(status).json({ success: false, error: { code: status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR', message: err.message } });
  });
}

export const getAccountModificationLogs = (req: Request, res: Response) => h(() => svc.getAccountModificationLogs(req.query, roles(req), uid(req)), res);
export const exportAccountModificationLogs = (req: Request, res: Response) => h(() => svc.exportAccountModificationLogs(req.query, roles(req), uid(req)), res);
export const getSystemChangeLogs = (req: Request, res: Response) => h(() => svc.getSystemChangeLogs(req.query, roles(req), uid(req)), res);
export const exportSystemChangeLogs = (req: Request, res: Response) => h(() => svc.exportSystemChangeLogs(req.query, roles(req), uid(req)), res);
export const getDuplicateRemovalLogs = (req: Request, res: Response) => h(() => svc.getDuplicateRemovalLogs(req.query, roles(req), uid(req)), res);
export const addDuplicateNote = (req: Request, res: Response) => h(() => svc.addDuplicateNote(req.body, roles(req), uid(req)), res);
export const exportDuplicateRemovalLogs = (req: Request, res: Response) => h(() => svc.exportDuplicateRemovalLogs(req.query, roles(req), uid(req)), res);
export const restoreDuplicateRecord = (req: Request, res: Response) => h(() => svc.restoreDuplicateRecord(req.body, roles(req), uid(req)), res);
export const getUserActionLogs = (req: Request, res: Response) => h(() => svc.getUserActionLogs(req.query, roles(req), uid(req)), res);
export const annotateUserAction = (req: Request, res: Response) => h(() => svc.annotateUserAction(req.body, roles(req), uid(req)), res);
export const exportUserActionLogs = (req: Request, res: Response) => h(() => svc.exportUserActionLogs(req.query, roles(req), uid(req)), res);
export const getAdminDashboard = (req: Request, res: Response) => h(() => svc.getAdminDashboard(req.query, roles(req), uid(req)), res);
export const getAdminNotifications = (req: Request, res: Response) => h(() => svc.getAdminNotifications(req.query, roles(req), uid(req)), res);
export const updateNotificationStatus = (req: Request, res: Response) => h(() => svc.updateNotificationStatus({ ...req.body, id: req.params.id }, roles(req), uid(req)), res);
export const getSettings = (req: Request, res: Response) => h(() => svc.getSettings(req.query, roles(req)), res);
export const updateSettings = (req: Request, res: Response) => h(() => svc.updateSettings(req.body, roles(req), uid(req)), res);
export const getUserLogReport = (req: Request, res: Response) => h(() => svc.getUserLogReport(req.query, roles(req), uid(req)), res);
export const exportUserLogReport = (req: Request, res: Response) => h(() => svc.exportUserLogReport(req.query, roles(req), uid(req)), res);
export const getAuditSupportLogs = (req: Request, res: Response) => h(() => svc.getAuditSupportLogs(req.query, roles(req), uid(req)), res);
export const exportAuditSupportLogs = (req: Request, res: Response) => h(() => svc.exportAuditSupportLogs(req.query, roles(req), uid(req)), res);
