import * as repo from '../repositories/payroll.repository';
import { NotFoundError } from '../utils/errors';

// ─── Employee ─────────────────────────────────────────────────────────────────

export async function listEmployees(filter: any) {
  return repo.listEmployeeDet(filter);
}

export async function getEmployeeById(empId: string) {
  const r = await repo.getEmployeeDetById(empId);
  const row = r.recordset?.[0];
  if (!row) throw new NotFoundError('Employee not found.');
  return row;
}

export async function createEmployee(data: any) {
  if (!data.EmpID) throw new Error('EmpID is required.');
  if (!data.EmpName) throw new Error('EmpName is required.');
  await repo.insertEmployeeDet(data);
  return { EmpID: data.EmpID };
}

export async function updateEmployee(empId: string, data: any) {
  await repo.updateEmployeeDet(empId, data);
  return { EmpID: empId };
}

export async function deactivateEmployee(empId: string) {
  await repo.deactivateEmployeeDet(empId);
}

// ─── Salary ───────────────────────────────────────────────────────────────────

export async function getSalary(empId: string, month: string, year: string) {
  const r = await repo.getSalary(empId, month, year);
  return r.recordset?.[0] ?? null;
}

export async function saveSalary(data: any) {
  if (!data.empId) throw new Error('empId is required.');
  if (!data.Month) throw new Error('Month is required.');
  if (!data.Year)  throw new Error('Year is required.');
  await repo.upsertSalary(data);
  return { success: true };
}

// ─── Clocking ─────────────────────────────────────────────────────────────────

export async function listClocking(filter: any) {
  return repo.listClocking(filter);
}

export async function clockIn(data: any) {
  const r = await repo.insertClocking(data);
  const newId = r.recordset?.[0]?.ID;
  return { ID: newId, ...data };
}

export async function clockOut(id: string, data: any) {
  await repo.updateClocking(id, data);
  return { ID: id };
}
