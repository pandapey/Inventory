import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from '../models/User.js';
import Warehouse from '../models/Warehouse.js';
import Supplier from '../models/Supplier.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';

const run = async () => {
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_SEED) {
    console.error('Refusing to seed in production without ALLOW_SEED=true');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log('seeding...');
  await Promise.all([User.deleteMany({}), Warehouse.deleteMany({}), Supplier.deleteMany({}), Product.deleteMany({}), Inventory.deleteMany({})]);

  const admin = await User.create({ name: 'Super Admin', email: 'admin@company.com', password: 'Admin123!', role: 'super_admin' });
  await User.create([
    { name: 'Warehouse Manager', email: 'warehouse@company.com', password: 'Admin123!', role: 'warehouse_manager' },
    { name: 'Sales Manager', email: 'sales@company.com', password: 'Admin123!', role: 'sales_manager' },
    { name: 'Employee', email: 'employee@company.com', password: 'Admin123!', role: 'employee' }
  ]);

  const wh1 = await Warehouse.create({ name: 'Main Warehouse', code: 'WH-001', city: 'New York', manager: admin._id });
  const wh2 = await Warehouse.create({ name: 'West Branch', code: 'WH-002', city: 'Chicago' });

  const sup1 = await Supplier.create({ name: 'Acme Supplies', email: 'sales@acme.com', phone: '+1-555-0100', address: '123 Industrial Rd' });
  const sup2 = await Supplier.create({ name: 'Global Parts', email: 'info@globalparts.com', phone: '+1-555-0200' });

  const products = await Product.insertMany([
    { name: 'Wireless Mouse', sku: 'WM-1001', barcode: '10000001', category: 'Electronics', brand: 'LogiTech', supplier: sup1._id, costPrice: 12, sellingPrice: 25, minStockLevel: 20, stockQuantity: 150 },
    { name: 'Mechanical Keyboard', sku: 'MK-2002', barcode: '10000002', category: 'Electronics', brand: 'KeyPro', supplier: sup1._id, costPrice: 35, sellingPrice: 70, minStockLevel: 15, stockQuantity: 8 },
    { name: 'Office Chair', sku: 'OC-3003', barcode: '10000003', category: 'Furniture', brand: 'ErgoMax', supplier: sup2._id, costPrice: 80, sellingPrice: 149, minStockLevel: 5, stockQuantity: 0 },
    { name: 'USB-C Hub', sku: 'UH-4004', barcode: '10000004', category: 'Electronics', brand: 'ConnectX', supplier: sup2._id, costPrice: 18, sellingPrice: 39, minStockLevel: 25, stockQuantity: 60 }
  ]);

  for (const p of products) {
    await Inventory.create({ product: p._id, warehouse: wh1._id, quantity: p.stockQuantity });
  }

  console.log('Seed done. Login: admin@company.com / Admin123!');
  await mongoose.disconnect();
};
run().catch(e => { console.error(e); process.exit(1); });
