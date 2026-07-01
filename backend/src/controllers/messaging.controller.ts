import { Request, Response } from 'express';
import * as svc from '../services/messaging.service';

type Roles = string[];
const roles = (req: Request): Roles => (req as any).user?.roles ?? [];
const uid = (req: Request): number => (req as any).user?.id ?? 0;

function h(fn: () => Promise<any>, res: Response) {
  fn().then((data) => res.json({ success: true, data })).catch((err) => {
    const status = err.status ?? 500;
    res.status(status).json({ success: false, error: { code: status === 403 ? 'FORBIDDEN' : status === 422 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR', message: err.message } });
  });
}

export const getMailCount = (req: Request, res: Response) => h(() => svc.getMailCount({ mUserID: uid(req) }, roles(req)), res);
export const getMail = (req: Request, res: Response) => h(() => svc.getMail({ Uid: uid(req), ...req.query }, roles(req)), res);
export const sendMail = (req: Request, res: Response) => h(() => svc.sendMail(req.body, roles(req), uid(req)), res);
export const markMailRead = (req: Request, res: Response) => h(() => svc.markMailRead({ id: req.params.id, ...req.body }, roles(req), uid(req)), res);
export const deleteMail = (req: Request, res: Response) => h(() => svc.deleteMail({ id: req.params.id }, roles(req), uid(req)), res);
export const sendReportMail = (req: Request, res: Response) => h(() => svc.sendReportMail(req.body, roles(req), uid(req)), res);
export const getSentReportMails = (req: Request, res: Response) => h(() => svc.getSentReportMails(req.query, roles(req)), res);
export const getDeclareItems = (req: Request, res: Response) => h(() => svc.getDeclareItems(req.query, roles(req)), res);
export const createDeclareItem = (req: Request, res: Response) => h(() => svc.createDeclareItem(req.body, roles(req), uid(req)), res);
export const updateDeclareItem = (req: Request, res: Response) => h(() => svc.updateDeclareItem({ ...req.body, id: req.params.id }, roles(req), uid(req)), res);
export const deleteDeclareItem = (req: Request, res: Response) => h(() => svc.deleteDeclareItem({ id: req.params.id }, roles(req), uid(req)), res);
export const runUtility = (req: Request, res: Response) => h(() => svc.runUtility({ name: req.params.name, ...req.body }, roles(req), uid(req)), res);
export const numToWords = (req: Request, res: Response) => h(() => svc.numToWords(req.query, roles(req)), res);
export const getCompanyInfo = (req: Request, res: Response) => h(() => svc.getCompanyInfo(req.query, roles(req)), res);
export const updateCompanyInfo = (req: Request, res: Response) => h(() => svc.updateCompanyInfo(req.body, roles(req), uid(req)), res);
export const getDocuments = (req: Request, res: Response) => h(() => svc.getDocuments(req.query, roles(req)), res);
export const uploadDocument = (req: Request, res: Response) => h(() => svc.uploadDocument(req.body, roles(req), uid(req)), res);
export const updateDocument = (req: Request, res: Response) => h(() => svc.updateDocument({ ...req.body, id: req.params.id }, roles(req), uid(req)), res);
export const deleteDocument = (req: Request, res: Response) => h(() => svc.deleteDocument({ id: req.params.id }, roles(req), uid(req)), res);
