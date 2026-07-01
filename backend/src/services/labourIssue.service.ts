import * as repo from '../repositories/labourIssue.repository';
import { NotFoundError } from '../utils/errors';

export async function getLabourIssues(filter: any) {
  return repo.getLabourIssues(filter);
}

export async function getLabourIssueById(id: string) {
  const r = await repo.getLabourIssueById(id);
  const row = r.recordset?.[0];
  if (!row) throw new NotFoundError('Labour issue line not found.');
  return row;
}

export async function createLabourIssue(data: any) {
  const r = await repo.insertLabourIssue(data);
  const newId = r.recordset?.[0]?.ID;
  return { ID: newId, ...data };
}

export async function updateLabourIssue(id: string, data: any) {
  await repo.updateLabourIssue(id, data);
  return { ID: id, ...data };
}

export async function deleteLabourIssue(id: string) {
  await repo.deleteLabourIssue(id);
}
