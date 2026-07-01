import * as repo from '../repositories/vehicle.repository';
import { ForbiddenError, NotFoundError, ConflictError, AppError } from '../utils/errors';

const WRITE_ROLES = ['Administrator', 'Supervisor'];
const MERGE_ROLES = ['Administrator', 'Supervisor'];

function assertRole(userRoles: string[], allowed: string[], msg = 'Forbidden') {
  if (!userRoles.some((r) => allowed.includes(r))) throw new ForbiddenError(msg);
}

export async function listVehicles(params: any, user: any) {
  const result = await repo.searchVehicles(params);
  return result.recordset || [];
}

export async function getVehicleById(vehId: number, user: any) {
  const result = await repo.getVehicleById(vehId);
  const vehicle = result.recordset?.[0];
  if (!vehicle) throw new NotFoundError('Vehicle not found.');
  return vehicle;
}

export async function createVehicle(data: any, user: any) {
  assertRole(user.roles, WRITE_ROLES);
  if (!data.custId) throw new AppError('Vehicle must be linked to a customer.', 400, 'MISSING_CUSTOMER_LINK');
  // BR-25: one active customer link per vehicle
  const existing = await repo.checkActiveCustomerLink(data.custId, data.regNo);
  if (existing.length) throw new ConflictError('This vehicle registration is already linked to this customer (BR-25).', 'DUPLICATE_VEHICLE_LINK');
  const result = await repo.insertVehicle({ ...data, createdBy: user.id });
  const newId = result.recordset?.[0]?.id || result.output?.id;
  await repo.writeVehicleAuditLog({ entityId: newId, action: 'create', userId: user.id, after: data });
  return { id: newId, ...data };
}

export async function updateVehicle(vehId: number, data: any, user: any) {
  assertRole(user.roles, WRITE_ROLES);
  const existing = await getVehicleById(vehId, user);
  await repo.updateVehicle(vehId, { ...data, updatedBy: user.id });
  await repo.writeVehicleAuditLog({ entityId: vehId, action: 'edit', userId: user.id, before: existing, after: data });
  return { vehId, ...data };
}

export async function deleteVehicle(vehId: number, user: any) {
  assertRole(user.roles, ['Administrator']);
  const existing = await getVehicleById(vehId, user);
  await repo.deleteVehicle(vehId);
  await repo.writeVehicleAuditLog({ entityId: vehId, action: 'delete', userId: user.id, before: existing });
}

export async function mergeVehicles(masterId: number, duplicateIds: number[], fieldMap: any, user: any) {
  assertRole(user.roles, MERGE_ROLES, 'Only Supervisor or Administrator can merge vehicles.');
  await repo.mergeVehicles(masterId, duplicateIds, fieldMap);
  await repo.writeVehicleAuditLog({ entityId: masterId, action: 'merge', userId: user.id, after: { masterId, duplicateIds } });
}

export async function searchVehicles(params: any, user: any) {
  const result = await repo.searchVehicles(params);
  return result.recordset || [];
}
