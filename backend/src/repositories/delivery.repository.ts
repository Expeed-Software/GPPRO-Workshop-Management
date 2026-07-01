import { getDbPool } from '../db/connection';
import sql from 'mssql';

export async function getDeliveryNotes(orderId: string) {
  const pool = await getDbPool(); const req = pool.request(); req.input('ordr',sql.NVarChar,orderId?orderId+'%':'%');
  const result = await req.query('SELECT d.ID, d.Ccode, d.yr, d.DONo, d.DODt, d.CustId, d.Lpo, d.Total, d.Nett, d.Remarks, d.[User], d.Ordr, c.custname AS CustomerName FROM Delivery01 d LEFT JOIN Customer c ON c.CustId=d.CustId WHERE d.Ordr LIKE @ordr ORDER BY d.DODt DESC');
  return { recordset: result.recordset };
}
export async function createDeliveryNote(body: Record<string, any>) {
  const pool = await getDbPool(); const req = pool.request();
  req.input('Ccode',sql.NVarChar,body.Ccode||''); req.input('yr',sql.NVarChar,body.yr||new Date().getFullYear().toString());
  req.input('DONo',sql.NVarChar,body.DONo||''); req.input('DODt',sql.DateTime,body.DODt?new Date(body.DODt):new Date());
  req.input('CustId',sql.NVarChar,body.CustId||''); req.input('Lpo',sql.NVarChar,body.Lpo||'');
  req.input('Total',sql.Float,body.Total||0); req.input('Nett',sql.Float,body.Nett||0);
  req.input('Remarks',sql.NVarChar,body.Remarks||''); req.input('User',sql.NVarChar,body.User||''); req.input('Ordr',sql.NVarChar,body.Ordr||'');
  await req.query('INSERT INTO Delivery01 (Ccode,yr,DONo,DODt,CustId,Lpo,Total,Nett,Remarks,[User],Ordr) VALUES (@Ccode,@yr,@DONo,@DODt,@CustId,@Lpo,@Total,@Nett,@Remarks,@User,@Ordr)');
  return { success: true };
}
export async function updateDeliveryNote(noteId: string, body: Record<string, any>) {
  const pool = await getDbPool(); const req = pool.request(); req.input('id',sql.Int,parseInt(noteId));
  req.input('Remarks',sql.NVarChar,body.Remarks||''); req.input('Total',sql.Float,body.Total||0); req.input('Nett',sql.Float,body.Nett||0);
  await req.query('UPDATE Delivery01 SET Remarks=@Remarks, Total=@Total, Nett=@Nett WHERE ID=@id');
  return { success: true };
}
export async function deleteDeliveryNote(noteId: string, _userId: number) {
  const pool = await getDbPool(); const req = pool.request(); req.input('id',sql.Int,parseInt(noteId));
  await req.query('DELETE FROM Delivery01 WHERE ID=@id'); return { success: true };
}
export async function getDeliveryLog(filter: Record<string, any>) {
  const pool = await getDbPool(); const req = pool.request(); req.input('ordr',sql.NVarChar,filter.orderId?filter.orderId+'%':'%');
  const result = await req.query('SELECT TOP 100 d.*, c.custname AS CustomerName FROM Delivery01 d LEFT JOIN Customer c ON c.CustId=d.CustId WHERE d.Ordr LIKE @ordr ORDER BY d.DODt DESC');
  return { recordset: result.recordset };
}
export async function linkDeliveryNote(noteId: string, orderId: string) {
  const pool = await getDbPool(); const req = pool.request(); req.input('id',sql.Int,parseInt(noteId)); req.input('Ordr',sql.NVarChar,orderId);
  await req.query('UPDATE Delivery01 SET Ordr=@Ordr WHERE ID=@id'); return { success: true };
}
export async function exportDeliveryNote(noteId: string) {
  const pool = await getDbPool(); const req = pool.request(); req.input('id',sql.Int,parseInt(noteId));
  const result = await req.query('SELECT d.*, c.custname AS CustomerName FROM Delivery01 d LEFT JOIN Customer c ON c.CustId=d.CustId WHERE d.ID=@id');
  return { recordset: result.recordset };
}
export async function getDeliveryNoteAuditTrail(_noteId: string) { return { recordset: [] }; }
export async function getDeliveryNoteReport(filter: Record<string, any>) {
  const pool = await getDbPool(); const req = pool.request(); req.input('cust',sql.NVarChar,filter.custId?filter.custId+'%':'%');
  const result = await req.query('SELECT TOP 100 d.*, c.custname AS CustomerName FROM Delivery01 d LEFT JOIN Customer c ON c.CustId=d.CustId WHERE d.CustId LIKE @cust ORDER BY d.DODt DESC');
  return { recordset: result.recordset };
}
export async function printDeliveryNote(noteId: string) { return exportDeliveryNote(noteId); }
export async function writeDeliveryAuditLog(_entry: any): Promise<void> {}
