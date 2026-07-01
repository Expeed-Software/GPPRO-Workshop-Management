import { api, normList } from './client';

export const payrollApi = {
  // Employee (EmployeeDet)
  listEmployees:    (params?: any) => api.get('/payroll/employees', { params }).then(normList),
  getEmployee:      (empId: string) => api.get(`/payroll/employees/${empId}`).then((r: any) => r.data),
  createEmployee:   (data: any) => api.post('/payroll/employees', data).then((r: any) => r.data),
  updateEmployee:   (empId: string, data: any) => api.patch(`/payroll/employees/${empId}`, data).then((r: any) => r.data),
  deactivateEmployee: (empId: string) => api.delete(`/payroll/employees/${empId}`).then((r: any) => r.data),

  // Salary (Salary01)
  getSalary: (empId: string, month: number, year: number) =>
    api.get(`/payroll/salary/${empId}/${month}/${year}`).then((r: any) => r.data),
  saveSalary: (data: any) => api.post('/payroll/salary', data).then((r: any) => r.data),

  // Clocking (jobInProgress)
  listClocking: (params?: any) => api.get('/payroll/clocking', { params }).then(normList),
  clockIn:  (data: any) => api.post('/payroll/clocking', data).then((r: any) => r.data),
  clockOut: (id: string, data: any) => api.patch(`/payroll/clocking/${id}`, data).then((r: any) => r.data),
};
