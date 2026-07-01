import { Request, Response, NextFunction } from 'express';
import * as orderSvc from '../services/salesOrder.service';
import * as delivSvc from '../services/delivery.service';
import { sendSuccess } from '../utils/response';

const h = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => fn;

// Sales Orders
export const listOrders = h(async (req, res, next) => { try { sendSuccess(res, await orderSvc.getSalesOrders(req.query, req.user!)); } catch (e) { next(e); } });
export const getOrder = h(async (req, res, next) => { try { sendSuccess(res, await orderSvc.getSalesOrderById(req.params.id, req.user!)); } catch (e) { next(e); } });
export const createOrder = h(async (req, res, next) => { try { res.status(201); sendSuccess(res, await orderSvc.createSalesOrder(req.body, req.user!)); } catch (e) { next(e); } });
export const updateOrder = h(async (req, res, next) => { try { await orderSvc.updateSalesOrder(req.params.id, req.body, req.user!); sendSuccess(res, { message: 'Order updated.' }); } catch (e) { next(e); } });
export const changeStatus = h(async (req, res, next) => { try { const { status, reason } = req.body; await orderSvc.changeOrderStatus(req.params.id, status, reason, req.user!); sendSuccess(res, { message: 'Status updated.' }); } catch (e) { next(e); } });
export const bulkStatus = h(async (req, res, next) => { try { const { orderIds, status } = req.body; await orderSvc.bulkUpdateOrderStatus(orderIds, status, req.user!); sendSuccess(res, { message: 'Bulk status updated.' }); } catch (e) { next(e); } });
export const deleteOrder = h(async (req, res, next) => { try { await orderSvc.deleteOrVoidOrder(req.params.id, req.user!); sendSuccess(res, { message: 'Order deleted.' }); } catch (e) { next(e); } });
export const changeCustomer = h(async (req, res, next) => { try { const { customerId, reason } = req.body; await orderSvc.changeOrderCustomer(req.params.id, customerId, reason, req.user!); sendSuccess(res, { message: 'Customer updated.' }); } catch (e) { next(e); } });
export const getOrderAudit = h(async (req, res, next) => { try { sendSuccess(res, await orderSvc.getSalesOrderAuditTrail(req.params.id || String(req.query.orderId), req.user!)); } catch (e) { next(e); } });
export const getOrderReport = h(async (req, res, next) => { try { sendSuccess(res, await orderSvc.getSalesOrderReport(req.query, req.user!)); } catch (e) { next(e); } });
export const getPendingOrders = h(async (req, res, next) => { try { sendSuccess(res, await orderSvc.getPendingOrders(req.query, req.user!)); } catch (e) { next(e); } });
export const getPendingRegister = h(async (req, res, next) => { try { sendSuccess(res, await orderSvc.getPendingOrderRegister(req.query, req.user!)); } catch (e) { next(e); } });
export const getStatusReport = h(async (req, res, next) => { try { sendSuccess(res, await orderSvc.getOrderStatusReport(req.query, req.user!)); } catch (e) { next(e); } });
export const getOrderHelp = h(async (req, res, next) => { try { sendSuccess(res, await orderSvc.getSalesOrders({ status: 'all', limit: 50 }, req.user!)); } catch (e) { next(e); } });

// Delivery Notes
export const listDeliveryNotes = h(async (req, res, next) => { try { sendSuccess(res, await delivSvc.getDeliveryNotes(req.params.id, req.user!)); } catch (e) { next(e); } });
export const createDeliveryNote = h(async (req, res, next) => { try { res.status(201); sendSuccess(res, await delivSvc.createDeliveryNote(req.params.id, req.body, req.user!)); } catch (e) { next(e); } });
export const updateDeliveryNote = h(async (req, res, next) => { try { await delivSvc.updateDeliveryNote(req.params.noteId, req.body, req.user!); sendSuccess(res, { message: 'Delivery note updated.' }); } catch (e) { next(e); } });
export const deleteDeliveryNote = h(async (req, res, next) => { try { await delivSvc.deleteDeliveryNote(req.params.noteId, req.user!); sendSuccess(res, { message: 'Delivery note deleted.' }); } catch (e) { next(e); } });
export const getDeliveryLog = h(async (req, res, next) => { try { sendSuccess(res, await delivSvc.getDeliveryLog(req.query, req.user!)); } catch (e) { next(e); } });
export const printNote = h(async (req, res, next) => { try { sendSuccess(res, await delivSvc.printDeliveryNote(req.params.noteId, req.user!)); } catch (e) { next(e); } });
export const exportNote = h(async (req, res, next) => { try { sendSuccess(res, await delivSvc.exportDeliveryNote(req.params.noteId, req.user!)); } catch (e) { next(e); } });
export const getNoteAudit = h(async (req, res, next) => { try { sendSuccess(res, await delivSvc.getDeliveryNoteAuditTrail(req.params.noteId, req.user!)); } catch (e) { next(e); } });
export const getDeliveryReport = h(async (req, res, next) => { try { sendSuccess(res, await delivSvc.getDeliveryNoteReport(req.query, req.user!)); } catch (e) { next(e); } });
export const linkNote = h(async (req, res, next) => { try { const { orderId } = req.body; sendSuccess(res, await delivSvc.linkDeliveryNote(req.params.noteId, orderId, req.user!)); } catch (e) { next(e); } });
