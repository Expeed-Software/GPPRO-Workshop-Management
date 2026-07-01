import { Request, Response, NextFunction } from 'express';
import { usersService } from '../services/users.service';
import { sendSuccess, sendError } from '../utils/response';

export class UsersController {
  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, role, status, page, limit } = req.query;
      const result = await usersService.listUsers(
        { name: name as string, role: role as string, status: status as string, page: Number(page || 1), limit: Number(limit || 20) },
        req.user!
      );
      sendSuccess(res, result.data, 200, { total: result.total, page: Number(page || 1) });
    } catch (err) { next(err); }
  }

  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await usersService.getUserById(Number(req.params.id), req.user!);
      sendSuccess(res, user);
    } catch (err) { next(err); }
  }

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, phone, roles, password, status, expiresAt } = req.body;
      if (!name || !email || !password) {
        sendError(res, 400, 'VALIDATION_ERROR', 'name, email, and password are required.');
        return;
      }
      const result = await usersService.createUser({ name, email, phone, roles, password, status, expiresAt }, req.user!);
      sendSuccess(res, result, 201);
    } catch (err) { next(err); }
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await usersService.updateUser(Number(req.params.id), req.body, req.user!);
      sendSuccess(res, { success: true });
    } catch (err) { next(err); }
  }

  async setUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.body;
      if (!['active', 'inactive', 'locked'].includes(status)) {
        sendError(res, 400, 'BAD_STATUS', 'status must be active, inactive, or locked.');
        return;
      }
      await usersService.setUserStatus(Number(req.params.id), status, req.user!);
      sendSuccess(res, { success: true });
    } catch (err) { next(err); }
  }

  async bulkSetStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userIds, status } = req.body;
      if (!userIds?.length || !status) {
        sendError(res, 400, 'VALIDATION_ERROR', 'userIds and status are required.');
        return;
      }
      await usersService.bulkSetStatus(userIds, status, req.user!);
      sendSuccess(res, { success: true });
    } catch (err) { next(err); }
  }

  async resetUserPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { newPassword } = req.body;
      if (!newPassword) { sendError(res, 400, 'VALIDATION_ERROR', 'newPassword is required.'); return; }
      await usersService.resetUserPassword(Number(req.params.id), newPassword, req.user!);
      sendSuccess(res, { success: true });
    } catch (err) { next(err); }
  }

  async updateSelfProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await usersService.updateSelfProfile(req.body, req.user!);
      sendSuccess(res, { success: true });
    } catch (err) { next(err); }
  }

  async assignRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, roles } = req.body;
      if (!userId || !roles?.length) { sendError(res, 400, 'VALIDATION_ERROR', 'userId and roles are required.'); return; }
      await usersService.assignRoles(userId, roles, req.user!);
      sendSuccess(res, { success: true });
    } catch (err) { next(err); }
  }

  async bulkImportUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rows = req.body?.rows || [];
      const result = await usersService.bulkImportUsers(rows, req.user!);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  async exportUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await usersService.listUsers({}, req.user!);
      const format = req.query.format || 'csv';
      if (format === 'csv') {
        const header = 'ID,Name,Email,Roles,Status,CreatedAt\n';
        const rows = result.data
          .map((u) => `${u.id},"${u.name}","${u.email}","${u.roles.join('|')}",${u.status},${u.createdAt}`)
          .join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
        res.send(header + rows);
      } else {
        sendSuccess(res, result.data);
      }
    } catch (err) { next(err); }
  }

  async getUserLog(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, fromDate, toDate, type, page, limit } = req.query;
      const result = await usersService.getUserLog(
        { userId: userId ? Number(userId) : undefined, fromDate, toDate, type, page: Number(page || 1), limit: Number(limit || 50) },
        req.user!
      );
      sendSuccess(res, result.data, 200, { total: result.total, page: Number(page || 1) });
    } catch (err) { next(err); }
  }

  async getEmployees(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dept, role, status, page, limit } = req.query;
      const result = await usersService.getEmployeeList({ dept, role, status, page: Number(page || 1), limit: Number(limit || 20) }, req.user!);
      sendSuccess(res, result.data, 200, { total: result.total, page: Number(page || 1) });
    } catch (err) { next(err); }
  }

  async getEmployeeById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const emp = await usersService.getEmployeeById(Number(req.params.id), req.user!);
      if (!emp) { sendError(res, 404, 'NOT_FOUND', 'Employee not found.'); return; }
      sendSuccess(res, emp);
    } catch (err) { next(err); }
  }

  async getRolePermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await usersService.getRolePermissions(req.user!);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  async assignPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await usersService.assignPermissions(req.body, req.user!);
      sendSuccess(res, { success: true });
    } catch (err) { next(err); }
  }
}

export const usersController = new UsersController();
