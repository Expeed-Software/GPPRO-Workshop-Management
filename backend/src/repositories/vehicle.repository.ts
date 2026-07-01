import { callProcedure } from '../db/callProcedure';
import { getDbPool } from '../db/connection';
import sql from 'mssql';

async function queryVehicles(params: { search?: string; custId?: string; page?: number; limit?: number }) {
  const pool = await getDbPool();
  const page = params.page || 1;
  const limit = params.limit || 50;
  const offset = (page - 1) * limit;
  const search = params.search || '';

  const req = pool.request();
  req.input('search', sql.NVarChar, '%' + search + '%');
  req.input('limit', sql.Int, limit);
  req.input('offset', sql.Int, offset);

  let custClause = '';
  if (params.custId) {
    req.input('custId', sql.NVarChar, String(params.custId));
    custClause = 'AND cv.Ccode = @custId';
  }

  const result = await req.query(
    'SELECT * FROM (' +
    '  SELECT ROW_NUMBER() OVER (ORDER BY cv.VehNo) AS rn,' +
    '         cv.VehID, cv.Ccode, cv.EngineNo, cv.VehNo, cv.RegType,' +
    '         cv.Make, cv.Colour, cv.ManYear, cv.Remarks, c.custname AS CustomerName' +
    '  FROM CustomerVehicle cv' +
    '  LEFT JOIN Customer c ON c.CustId = cv.Ccode' +
    '  WHERE (cv.VehNo LIKE @search OR cv.Make LIKE @search OR cv.EngineNo LIKE @search OR c.custname LIKE @search)' +
    '  ' + custClause +
    ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
  );
  return { recordset: result.recordset, page, limit };
}

export async function searchVehicles(filters: any) { return queryVehicles(filters); }
export async function getVehicleList(params: any) { return queryVehicles(params); }

export async function getVehicleById(id: string | number) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('id', sql.NVarChar, String(id));
  const result = await req.query(
    'SELECT cv.VehID, cv.Ccode, cv.EngineNo, cv.VehNo, cv.RegType, cv.Make,' +
    '       cv.Colour, cv.ManYear, cv.Remarks, c.custname AS CustomerName' +
    ' FROM CustomerVehicle cv' +
    ' LEFT JOIN Customer c ON c.CustId = cv.Ccode' +
    ' WHERE cv.VehID = @id'
  );
  return { recordset: result.recordset };
}

export async function getVehicleHistory(id: any) { return callProcedure('VehicleHistory', { VehNo: id }); }
export async function getVehicleStatus(params: any) { return callProcedure('spGetVehicleStatus', params); }
export async function insertVehicle(data: any) { return callProcedure('spInsertVehicle', data); }
export async function updateVehicle(id: any, data: any) { return callProcedure('spUpdateVehicle', { id, ...data }); }
export async function deleteVehicle(id: any) { return callProcedure('spDeleteVehicle', { id }); }
export async function writeVehicleAuditLog(_entry: any): Promise<void> { }
