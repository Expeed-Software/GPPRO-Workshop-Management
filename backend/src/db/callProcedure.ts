import sql from 'mssql';
import { getDbPool } from './connection';

export interface ProcedureResult<T = any> {
  recordset: T[];
  output: Record<string, any>;
  rowsAffected: number[];
}

/**
 * Call a SQL Server stored procedure by name, passing named params.
 * Only stored procedures listed in DB_CONNECTION_SPEC.md may be called.
 * Never use raw SQL queries.
 */
export async function callProcedure<T = any>(
  procName: string,
  params: Record<string, any> = {},
  outputDefs: Record<string, any> = {}
): Promise<ProcedureResult<T>> {
  const pool = await getDbPool();
  const req = pool.request();

  Object.entries(params).forEach(([name, value]) => {
    if (value === undefined || value === null) {
      req.input(name, null);
    } else {
      req.input(name, value);
    }
  });

  Object.entries(outputDefs).forEach(([name, sqlType]) => {
    req.output(name, sqlType);
  });

  const result = await req.execute(procName);

  return {
    recordset: result.recordset as T[],
    output: result.output,
    rowsAffected: result.rowsAffected,
  };
}
