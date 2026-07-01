import { Response } from 'express';
import { ApiResponse } from '../types';

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: ApiResponse['meta']
): void {
  const response: ApiResponse<T> = { success: true, data };
  if (meta) response.meta = meta;
  res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: any
): void {
  const response: ApiResponse = {
    success: false,
    error: { code, message, ...(details ? { details } : {}) },
  };
  res.status(statusCode).json(response);
}
