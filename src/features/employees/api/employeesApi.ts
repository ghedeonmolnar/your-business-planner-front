import { apiPaginatedRequest, apiRequest } from '@/shared/api/client';
import {
  Employee,
  EmployeeAccessChange,
  EmployeeInvitation,
  EmployeePayload,
  EmployeeProfile,
} from '@/features/employees/types';
import {
  employeeAccessChangeSchema,
  employeeInvitationSchema,
  employeeProfileSchema,
  employeeSchema,
} from '@/features/employees/schemas/employeeApiSchemas';
import { actionResponseSchema } from '@/shared/api/responseSchemas';

export const getEmployeesApi = () =>
  apiPaginatedRequest<Employee>('/employees', { itemSchema: employeeSchema });

export const getEmployeeProfileApi = (id: string) =>
  apiRequest<EmployeeProfile>(`/employees/${id}`, {
    schema: employeeProfileSchema,
  });

export const createEmployeeApi = (payload: EmployeePayload) =>
  apiRequest<Employee>('/employees', {
    method: 'POST',
    body: payload,
    schema: employeeSchema,
  });

export const updateEmployeeApi = (id: string, payload: EmployeePayload) =>
  apiRequest<Employee>(`/employees/${id}`, {
    method: 'PUT',
    body: payload,
    schema: employeeSchema,
  });

export const deleteEmployeeApi = (id: string) =>
  apiRequest(`/employees/${id}`, {
    method: 'DELETE',
    schema: actionResponseSchema,
  });

export const forceDeleteEmployeeApi = (id: string) =>
  apiRequest(`/employees/${id}/permanent`, {
    method: 'DELETE',
    schema: actionResponseSchema,
  });

export const inviteEmployeeApi = (id: string, email: string) =>
  apiRequest<EmployeeInvitation>(`/employees/${id}/invitation`, {
    method: 'POST',
    body: { email },
    schema: employeeInvitationSchema,
  });

export const blockEmployeeApi = (id: string) =>
  apiRequest<EmployeeAccessChange>(`/employees/${id}/block`, {
    method: 'POST',
    schema: employeeAccessChangeSchema,
  });

export const unblockEmployeeApi = (id: string) =>
  apiRequest<EmployeeAccessChange>(`/employees/${id}/unblock`, {
    method: 'POST',
    schema: employeeAccessChangeSchema,
  });
