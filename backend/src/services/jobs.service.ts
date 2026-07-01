import * as repo from '../repositories/jobs.repository';
import { AppError, ForbiddenError, NotFoundError } from '../utils/errors';

const SUP_ADMIN = ['Administrator', 'Supervisor'];

function assertRole(userRoles: string[], allowed: string[], msg = 'Forbidden') {
  if (!userRoles.some((r) => allowed.includes(r))) throw new ForbiddenError(msg);
}

// Estimations
export async function listEstimations(filter: any, user: any) {
  const { recordset, total, page, limit } = await repo.listEstimations(filter);
  return { data: recordset, meta: { total, page, limit } };
}

export async function getEstimation(jobCardNo: string, user: any) {
  const result = await repo.getEstimationDetails(jobCardNo);
  return result.recordset?.[0] ?? null;
}

export async function createEstimation(data: any, user: any) {
  // BR-39: must have required fields and at least one item
  if (!data.custId) throw new AppError('Customer is required (BR-39).', 400, 'MISSING_CUSTOMER');
  if (!data.vehicleId) throw new AppError('Vehicle is required (BR-39).', 400, 'MISSING_VEHICLE');
  if (!data.serviceDescription) throw new AppError('Service description is required (BR-39).', 400, 'MISSING_DESCRIPTION');
  if (!data.items || !data.items.length) throw new AppError('At least one item is required (BR-39).', 400, 'MISSING_ITEMS');
  const result = await repo.insertEstimation({ ...data, createdBy: user.id });
  const newId = result.recordset?.[0]?.id || result.output?.id;
  // BR-45
  await repo.writeJobAuditLog({ entityId: newId, action: 'estimation-create', userId: user.id, after: data });
  return { id: newId, ...data };
}

export async function updateEstimation(id: string, data: any, user: any) {
  await repo.updateEstimation(id, { ...data, updatedBy: user.id });
  await repo.writeJobAuditLog({ entityId: id, action: 'estimation-edit', userId: user.id, after: data });
  return { id, ...data };
}

export async function submitEstimation(id: string, user: any) {
  await repo.submitEstimation(id);
  await repo.writeJobAuditLog({ entityId: id, action: 'estimation-submit', userId: user.id });
}

export async function approveEstimation(id: string, action: string, comment: string, assignTo: string | undefined, user: any) {
  // BR-40: only supervisor/admin
  assertRole(user.roles, SUP_ADMIN, 'BR-40: Only Supervisor or Administrator can approve/reject estimations.');
  if ((action === 'reject' || action === 'revision') && (!comment || comment.length < 16))
    throw new AppError('Comment is required (min 16 chars) for reject/revision.', 400, 'COMMENT_REQUIRED');
  await repo.approveEstimation(id, action, comment, assignTo);
  await repo.writeJobAuditLog({ entityId: id, action: `estimation-${action}`, userId: user.id, after: { action, comment, assignTo } });
}

export async function getEstimationAuditLog(id: string, user: any) {
  // BR-131/135
  assertRole(user.roles, SUP_ADMIN, 'BR-131: Only Supervisor/Admin can view audit logs.');
  const result = await repo.getEstimationAuditLog(id);
  await repo.writeJobAuditLog({ entityId: id, action: 'audit-log-read', userId: user.id });
  return result.recordset || [];
}

// Job Work Orders
export async function createJob(data: any, user: any) {
  const result = await repo.insertJobWorkOrder({ ...data, createdBy: user.id });
  const newId = result.recordset?.[0]?.id || result.output?.id;
  await repo.writeJobAuditLog({ entityId: newId, action: 'job-create', userId: user.id, after: data });
  return { id: newId, ...data };
}

export async function updateJob(id: string, data: any, user: any) {
  await repo.updateJobWorkOrder(id, { ...data, updatedBy: user.id });
  await repo.writeJobAuditLog({ entityId: id, action: 'job-edit', userId: user.id, after: data });
}

export async function assignJob(jobId: string, staffId: string, user: any) {
  // BR-41: supervisor/admin
  assertRole(user.roles, SUP_ADMIN, 'BR-41: Only Supervisor or Administrator can assign jobs.');
  await repo.assignJobToStaff(jobId, staffId);
  await repo.writeJobAuditLog({ entityId: jobId, action: 'job-assign', userId: user.id, after: { staffId } });
}

export async function updateJobStatus(jobId: string, status: string, user: any, jobStatusMaster: any[] = []) {
  // BR-42: cannot assign inactive status
  const statusDef = jobStatusMaster.find((s: any) => s.code === status || s.status === status);
  if (statusDef && statusDef.active === false) throw new AppError('Cannot assign an inactive job status (BR-42).', 400, 'INACTIVE_STATUS');
  await repo.updateJobStatus(jobId, status, user.id);
  await repo.writeJobAuditLog({ entityId: jobId, action: `job-status-${status}`, userId: user.id, after: { status } });
}

export async function updateJobProgress(jobId: string, progress: number, note: string, user: any) {
  await repo.updateJobProgress(jobId, progress, note, user.id);
  await repo.writeJobAuditLog({ entityId: jobId, action: 'job-progress', userId: user.id, after: { progress, note } });
}

export async function completeJob(jobId: string, signature: string, user: any) {
  // BR-48: digital signature required; BR-46: ensure job is complete
  if (!signature) throw new AppError('Digital signature is required for job completion (BR-48).', 400, 'SIGNATURE_REQUIRED');
  await repo.completeJobWithSignoff(jobId, signature);
  await repo.writeJobAuditLog({ entityId: jobId, action: 'job-complete', userId: user.id, after: { signature: '[provided]' } });
}

// Status Master
export async function getJobStatusMaster(user: any) {
  const result = await repo.getJobStatusMaster();
  return result.recordset || [];
}

export async function createJobStatus(data: any, user: any) {
  // BR-50: admin only
  assertRole(user.roles, ['Administrator'], 'BR-50: Only Administrator can edit master job status list.');
  const result = await repo.insertJobStatusMaster({ ...data, createdBy: user.id });
  await repo.writeJobAuditLog({ entityId: result.recordset?.[0]?.id || '0', action: 'job-status-create', userId: user.id, after: data });
  return result;
}

export async function updateJobStatus_Master(id: string, data: any, user: any) {
  assertRole(user.roles, ['Administrator'], 'BR-50: Only Administrator can edit master job status list.');
  await repo.updateJobStatusMaster(id, data);
  await repo.writeJobAuditLog({ entityId: id, action: 'job-status-master-edit', userId: user.id, after: data });
}

// Reports
export async function getWorkStatus(filter: any, user: any) { const r = await repo.getWorkStatus(filter); return r.recordset || []; }
export async function getRunningJobs(filter: any, user: any) { const r = await repo.getRunningJobs(filter); return r.recordset || []; }
export async function getCompletedJobs(filter: any, user: any) { const r = await repo.getCompletedJobs(filter); return r.recordset || []; }
export async function getPartsNotAvailableJobs(filter: any, user: any) { const r = await repo.getPartsNotAvailableJobs(filter); return r.recordset || []; }
export async function getWorkStatusOverview(user: any) { assertRole(user.roles, SUP_ADMIN); const r = await repo.getWorkStatusOverview(); return r.recordset || []; }
export async function getJobStatusHistory(jobId: string, user: any) { const r = await repo.getJobStatusHistory(jobId); return r.recordset || []; }
export async function getJobAuditLogs(jobId: string, user: any) { assertRole(user.roles, SUP_ADMIN, 'BR-131/135: Only Supervisor/Admin.'); await repo.writeJobAuditLog({ entityId: jobId, action: 'audit-log-read', userId: user.id }); const r = await repo.getJobAuditLogs(jobId); return r.recordset || []; }
