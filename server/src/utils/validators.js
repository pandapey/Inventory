import Joi from 'joi';

export const registerSchema = Joi.object({ name: Joi.string().trim().min(2).max(80).required(), email: Joi.string().email().required(), password: Joi.string().min(6).max(128).required() });
export const loginSchema = Joi.object({ email: Joi.string().email().required(), password: Joi.string().required() });
export const productSchemaJoi = Joi.object({
  name: Joi.string().required(), sku: Joi.string().required(), barcode: Joi.string().allow('', null),
  description: Joi.string().allow('', null), category: Joi.string().required(), brand: Joi.string().allow('', null),
  supplier: Joi.string().allow('', null), costPrice: Joi.number().min(0).required(),
  sellingPrice: Joi.number().min(0).required(), minStockLevel: Joi.number().min(0).default(10)
});
export const warehouseSchemaJoi = Joi.object({ name: Joi.string().required(), code: Joi.string().required(), address: Joi.string().allow('', null), city: Joi.string().allow('', null) });
export const supplierSchemaJoi = Joi.object({ name: Joi.string().required(), email: Joi.string().email().allow('', null), phone: Joi.string().allow('', null), address: Joi.string().allow('', null), taxId: Joi.string().allow('', null), paymentTerms: Joi.string().allow('', null) });
export const stockMoveSchema = Joi.object({
  product: Joi.string().required(), warehouse: Joi.string().required(),
  type: Joi.string().valid('in','out','adjustment','transfer').required(),
  quantity: Joi.number().integer().min(0).required(), reason: Joi.string().allow('', null),
  toWarehouse: Joi.string().allow('', null)
});
export const poSchemaJoi = Joi.object({
  supplier: Joi.string().required(), warehouse: Joi.string().required(),
  items: Joi.array().items(Joi.object({ product: Joi.string().required(), quantity: Joi.number().min(1).required(), costPrice: Joi.number().min(0).required() })).min(1).required(),
  expectedDelivery: Joi.date().allow(null, '')
});
export const soSchemaJoi = Joi.object({
  customer: Joi.object({ name: Joi.string().required(), email: Joi.string().allow('', null), phone: Joi.string().allow('', null), address: Joi.string().allow('', null) }).required(),
  warehouse: Joi.string().required(),
  items: Joi.array().items(Joi.object({ product: Joi.string().required(), quantity: Joi.number().min(1).required(), price: Joi.number().min(0).required(), discount: Joi.number().min(0).default(0) })).min(1).required(),
  taxRate: Joi.number().min(0).max(100).default(0)
});
