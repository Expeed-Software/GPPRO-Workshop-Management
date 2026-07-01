import { getDbPool } from '../db/connection';
import sql from 'mssql';

export async function getLabourIssues(filter: Record<string, any>) {
  const pool = await getDbPool();
  const page  = Number(filter.page  || 1);
  const limit = Number(filter.limit || 50);
  const offset = (page - 1) * limit;

  const req = pool.request();
  req.input('limit',  sql.Int, limit);
  req.input('offset', sql.Int, offset);

  let where = '1=1';
  if (filter.Ordr) {
    req.input('Ordr', sql.NVarChar, filter.Ordr);
    where += ' AND d.Ordr = @Ordr';
  }
  if (filter.DoNo) {
    req.input('DoNo', sql.NVarChar, filter.DoNo);
    where += ' AND d.DoNo = @DoNo';
  }

  const result = await req.query(
    'SELECT * FROM (' +
    '  SELECT ROW_NUMBER() OVER (ORDER BY d.ID DESC) AS rn,' +
    '         d.ID, d.DoNo, d.Itemcode, d.Qty, d.Rate, d.Tdr, d.Tda,' +
    '         d.Amount, d.Srl, d.GdID, d.CCode, d.Ordr' +
    '  FROM Delivery02 d' +
    '  WHERE ' + where +
    ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
  );
  return { recordset: result.recordset, page, limit };
}

export async function getLabourIssueById(id: string) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('id', sql.Int, parseInt(id, 10));
  const result = await req.query(
    'SELECT ID, DoNo, Itemcode, Qty, Rate, Tdr, Tda, Amount, Srl, GdID, CCode, Ordr' +
    ' FROM Delivery02 WHERE ID = @id'
  );
  return { recordset: result.recordset };
}

export async function insertLabourIssue(body: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('DoNo',     sql.NVarChar, body.DoNo     || '');
  req.input('Itemcode', sql.NVarChar, body.Itemcode || '');
  req.input('Qty',      sql.Float,    Number(body.Qty)    || 0);
  req.input('Rate',     sql.Float,    Number(body.Rate)   || 0);
  req.input('Tdr',      sql.Float,    Number(body.Tdr)    || 0);
  req.input('Tda',      sql.Float,    Number(body.Tda)    || 0);
  req.input('Amount',   sql.Float,    Number(body.Amount) || 0);
  req.input('Srl',      sql.Int,      Number(body.Srl)    || 0);
  req.input('GdID',     sql.NVarChar, body.GdID    || '');
  req.input('CCode',    sql.NVarChar, body.CCode   || '');
  req.input('Ordr',     sql.NVarChar, body.Ordr    || '');

  const result = await req.query(
    'INSERT INTO Delivery02 (DoNo, Itemcode, Qty, Rate, Tdr, Tda, Amount, Srl, GdID, CCode, Ordr)' +
    ' OUTPUT INSERTED.ID' +
    ' VALUES (@DoNo, @Itemcode, @Qty, @Rate, @Tdr, @Tda, @Amount, @Srl, @GdID, @CCode, @Ordr)'
  );
  return { recordset: result.recordset };
}

export async function updateLabourIssue(id: string, body: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('id',       sql.Int,      parseInt(id, 10));
  req.input('DoNo',     sql.NVarChar, body.DoNo     || '');
  req.input('Itemcode', sql.NVarChar, body.Itemcode || '');
  req.input('Qty',      sql.Float,    Number(body.Qty)    || 0);
  req.input('Rate',     sql.Float,    Number(body.Rate)   || 0);
  req.input('Tdr',      sql.Float,    Number(body.Tdr)    || 0);
  req.input('Tda',      sql.Float,    Number(body.Tda)    || 0);
  req.input('Amount',   sql.Float,    Number(body.Amount) || 0);
  req.input('Srl',      sql.Int,      Number(body.Srl)    || 0);
  req.input('GdID',     sql.NVarChar, body.GdID    || '');
  req.input('CCode',    sql.NVarChar, body.CCode   || '');
  req.input('Ordr',     sql.NVarChar, body.Ordr    || '');

  await req.query(
    'UPDATE Delivery02 SET' +
    '  DoNo=@DoNo, Itemcode=@Itemcode, Qty=@Qty, Rate=@Rate,' +
    '  Tdr=@Tdr, Tda=@Tda, Amount=@Amount, Srl=@Srl,' +
    '  GdID=@GdID, CCode=@CCode, Ordr=@Ordr' +
    ' WHERE ID=@id'
  );
  return { success: true };
}

export async function deleteLabourIssue(id: string) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('id', sql.Int, parseInt(id, 10));
  await req.query('DELETE FROM Delivery02 WHERE ID = @id');
  return { success: true };
}
