import { Request, Response } from 'express';
import * as itemSvc from '../services/items.service';
import * as stockSvc from '../services/stock.service';

type Roles = string[];
const roles = (req: Request): Roles => (req as any).user?.roles ?? [];
const userId = (req: Request): number => (req as any).user?.id ?? 0;

function h(fn: () => Promise<any>, res: Response) {
  fn().then((data) => res.json({ success: true, data })).catch((err) => {
    const status = err.status ?? err.statusCode ?? 500;
    res.status(status).json({ success: false, error: { code: err.code ?? 'ERROR', message: err.message } });
  });
}

// Items
export const listItems = (req: Request, res: Response) => h(() => itemSvc.listItems(req.query as any), res);
export const itemsHelp = (req: Request, res: Response) => h(() => itemSvc.getItemsHelp(req.query as any), res);
export const itemCategories = (req: Request, res: Response) => h(() => itemSvc.getItemCategories(), res);
export const createItem = (req: Request, res: Response) => h(() => itemSvc.createItem({ ...req.body, userId: userId(req) }, roles(req)), res);
export const updateItem = (req: Request, res: Response) => h(() => itemSvc.updateItem(req.params.itemCode, { ...req.body, userId: userId(req) }, roles(req)), res);
export const deleteItem = (req: Request, res: Response) => h(() => itemSvc.deleteItem(req.params.itemCode, userId(req), roles(req)), res);
export const bulkImportItems = (req: Request, res: Response) => h(() => itemSvc.bulkImportItems(req.body, roles(req)), res);
export const bulkExportItems = (req: Request, res: Response) => h(() => itemSvc.bulkExportItems(req.query as any, roles(req)), res);
export const itemAuditLogs = (req: Request, res: Response) => h(() => itemSvc.getItemAuditLogs(req.params.itemCode, req.query as any, roles(req)), res);
export const linkItemToInventory = (req: Request, res: Response) => h(() => itemSvc.linkItemToInventory(req.params.itemCode, req.body.inventoryId, roles(req)), res);
export const itemDOList = (req: Request, res: Response) => h(() => itemSvc.getItemDOList(req.params.itemCode, req.query as any), res);
export const itemDOSummary = (req: Request, res: Response) => h(() => itemSvc.getItemDOSummary(req.params.itemCode, req.query as any), res);
export const itemPendingDOList = (req: Request, res: Response) => h(() => itemSvc.getItemPendingDOList(req.params.itemCode, req.query as any), res);
export const itemPurchaseListImport = (req: Request, res: Response) => h(() => itemSvc.getItemPurchaseListImport(req.query as any), res);
export const itemPurchaseListLocal = (req: Request, res: Response) => h(() => itemSvc.getItemPurchaseListLocal(req.query as any), res);
export const itemPurchaseReturnList = (req: Request, res: Response) => h(() => itemSvc.getItemPurchaseReturnList(req.query as any), res);
export const itemPurchaseReturnSumm = (req: Request, res: Response) => h(() => itemSvc.getItemPurchaseReturnSumm(req.query as any), res);
export const itemPurchaseSummImport = (req: Request, res: Response) => h(() => itemSvc.getItemPurchaseSummImport(req.query as any), res);
export const itemPurchaseSummLocal = (req: Request, res: Response) => h(() => itemSvc.getItemPurchaseSummLocal(req.query as any), res);

// Stock
export const stockIn = (req: Request, res: Response) => h(() => stockSvc.stockIn(req.body, roles(req), userId(req)), res);
export const stockOut = (req: Request, res: Response) => h(() => stockSvc.stockOut(req.body, roles(req), userId(req)), res);
export const manualAdjust = (req: Request, res: Response) => h(() => stockSvc.manualAdjust(req.body, roles(req), userId(req)), res);
export const physicalAdjust = (req: Request, res: Response) => h(() => stockSvc.physicalAdjust(req.body, roles(req), userId(req)), res);
export const stockQty = (req: Request, res: Response) => h(() => stockSvc.getStockQty(req.params.itemCode), res);
export const stockDisplay = (req: Request, res: Response) => h(() => stockSvc.getStockDisplay(req.query as any), res);
export const stockMovementReport = (req: Request, res: Response) => h(() => stockSvc.getStockMovementReport(req.query as any), res);
export const stockLedger = (req: Request, res: Response) => h(() => stockSvc.getStockLedger(req.query as any), res);
export const stockAgingReport = (req: Request, res: Response) => h(() => stockSvc.getStockAgingReport(req.query as any, roles(req)), res);
export const stockValuation = (req: Request, res: Response) => h(() => stockSvc.getStockValuation(req.query as any, roles(req)), res);
export const stockValuationSummary = (req: Request, res: Response) => h(() => stockSvc.getStockValuationSummary(req.query as any, roles(req)), res);
export const reorderStatus = (req: Request, res: Response) => h(() => stockSvc.getReorderStatus(req.query as any), res);
export const stockInList = (req: Request, res: Response) => h(() => stockSvc.getStockInList(req.query as any), res);
export const stockOutList = (req: Request, res: Response) => h(() => stockSvc.getStockOutList(req.query as any), res);
export const stockStatement = (req: Request, res: Response) => h(() => stockSvc.getStockStatement(req.query as any), res);
export const stockStatement1 = (req: Request, res: Response) => h(() => stockSvc.getStockStatement1(req.query as any), res);
export const stockStatementFromItemFile = (req: Request, res: Response) => h(() => stockSvc.getStockStatementFromItemFile(req.query as any), res);
export const stockStatementDD = (req: Request, res: Response) => h(() => stockSvc.getStockStatementDD(req.query as any), res);
export const stockAuditLogs = (req: Request, res: Response) => h(() => stockSvc.getStockAuditLogs(req.query as any, roles(req)), res);
