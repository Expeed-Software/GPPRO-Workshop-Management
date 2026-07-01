import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/jobs.service';
import { sendSuccess } from '../utils/response';

const h = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => fn;

export const listEstimations = h(async (req, res, next) => { try { sendSuccess(res, await svc.listEstimations(req.query, req.user!)); } catch (e) { next(e); } });
export const getEstimation = h(async (req, res, next) => { try { sendSuccess(res, await svc.getEstimation(req.params.jobCardNo, req.user!)); } catch (e) { next(e); } });
export const createEstimation = h(async (req, res, next) => { try { res.status(201); sendSuccess(res, await svc.createEstimation(req.body, req.user!)); } catch (e) { next(e); } });
export const updateEstimation = h(async (req, res, next) => { try { sendSuccess(res, await svc.updateEstimation(req.params.id, req.body, req.user!)); } catch (e) { next(e); } });
export const submitEstimation = h(async (req, res, next) => { try { await svc.submitEstimation(req.params.id, req.user!); sendSuccess(res, { message: 'Estimation submitted.' }); } catch (e) { next(e); } });
export const approveEstimation = h(async (req, res, next) => { try { const { action, comment, assignTo } = req.body; await svc.approveEstimation(req.params.id, action, comment, assignTo, req.user!); sendSuccess(res, { message: `Estimation ${action}d.` }); } catch (e) { next(e); } });
export const getEstimationAudit = h(async (req, res, next) => { try { sendSuccess(res, await svc.getEstimationAuditLog(req.params.id, req.user!)); } catch (e) { next(e); } });

export const createJob = h(async (req, res, next) => { try { res.status(201); sendSuccess(res, await svc.createJob(req.body, req.user!)); } catch (e) { next(e); } });
export const updateJob = h(async (req, res, next) => { try { await svc.updateJob(req.params.id, req.body, req.user!); sendSuccess(res, { message: 'Job updated.' }); } catch (e) { next(e); } });
export const assignJob = h(async (req, res, next) => { try { await svc.assignJob(req.params.id, req.body.staffId, req.user!); sendSuccess(res, { message: 'Job assigned.' }); } catch (e) { next(e); } });
export const updateJobStatus = h(async (req, res, next) => { try { await svc.updateJobStatus(req.params.id, req.body.status, req.user!); sendSuccess(res, { message: 'Status updated.' }); } catch (e) { next(e); } });
export const updateJobProgress = h(async (req, res, next) => { try { await svc.updateJobProgress(req.params.id, req.body.progress, req.body.note, req.user!); sendSuccess(res, { message: 'Progress updated.' }); } catch (e) { next(e); } });
export const completeJob = h(async (req, res, next) => { try { await svc.completeJob(req.params.id, req.body.signature, req.user!); sendSuccess(res, { message: 'Job completed.' }); } catch (e) { next(e); } });
export const getJobStatusHistory = h(async (req, res, next) => { try { sendSuccess(res, await svc.getJobStatusHistory(req.params.jobId || String(req.query.jobId), req.user!)); } catch (e) { next(e); } });
export const getWorkStatus = h(async (req, res, next) => { try { sendSuccess(res, await svc.getWorkStatus(req.query, req.user!)); } catch (e) { next(e); } });
export const getRunningJobs = h(async (req, res, next) => { try { sendSuccess(res, await svc.getRunningJobs(req.query, req.user!)); } catch (e) { next(e); } });
export const getCompletedJobs = h(async (req, res, next) => { try { sendSuccess(res, await svc.getCompletedJobs(req.query, req.user!)); } catch (e) { next(e); } });
export const getPartsNotAvailable = h(async (req, res, next) => { try { sendSuccess(res, await svc.getPartsNotAvailableJobs(req.query, req.user!)); } catch (e) { next(e); } });
export const getWorkStatusOverview = h(async (req, res, next) => { try { sendSuccess(res, await svc.getWorkStatusOverview(req.user!)); } catch (e) { next(e); } });
export const getJobStatusMaster = h(async (req, res, next) => { try { sendSuccess(res, await svc.getJobStatusMaster(req.user!)); } catch (e) { next(e); } });
export const createJobStatusMaster = h(async (req, res, next) => { try { res.status(201); sendSuccess(res, await svc.createJobStatus(req.body, req.user!)); } catch (e) { next(e); } });
export const updateJobStatusMaster = h(async (req, res, next) => { try { await svc.updateJobStatus_Master(req.params.id, req.body, req.user!); sendSuccess(res, { message: 'Status master updated.' }); } catch (e) { next(e); } });
export const getJobAuditLogs = h(async (req, res, next) => { try { sendSuccess(res, await svc.getJobAuditLogs(req.params.jobId || String(req.query.jobId), req.user!)); } catch (e) { next(e); } });
