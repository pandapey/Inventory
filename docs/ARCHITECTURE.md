# Architecture

Client (React) → REST / Socket.IO → Express → Mongoose → MongoDB

## Collections
- User: email unique, password hashed, role enum, isActive
- Warehouse: name/code unique
- Product: sku unique, text index, supplier ref, cost/selling, minStock, stockQuantity (denormalized), isArchived
- Inventory: {product, warehouse} unique, quantity — per-warehouse source of truth
- StockMovement: product, warehouse, from/to, type in|out|adjustment|transfer, refType purchase|sale|manual|transfer, createdBy
- Supplier, PurchaseOrder (poNumber auto, items.received, status draft|ordered|partial|received|cancelled), SalesOrder (soNumber auto, totals computed, status pipeline)
- ActivityLog, Notification (low_stock/out_of_stock/order/purchase/system)

## Key invariants
- Product.stockQuantity = SUM(Inventory.quantity)
- SO shipped = atomic stock decrement (fails on insufficient)
- PO receive = stock increment + movement
- Low/out alerts → Notification + socket emit

## Scaling
- Add Redis for sockets, indexes already on sku/barcode/category/role/status, pagination everywhere, CSV streaming for large reports, Cloudinary for images, separate worker for PDF/email later.
