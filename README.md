# SMB Inventory, Warehouse & Order Management System

Production-grade MERN app for small-to-medium businesses. Real internal tool, not a tutorial CRUD.

## Stack
- Client: React + Vite, Redux Toolkit, Tailwind, Recharts, Socket.IO-client
- Server: Node + Express, Mongoose, JWT, Joi, Helmet, Rate-limit, Socket.IO, PDFKit, Cloudinary
- DB: MongoDB

## Quick start

```bash
# 1. MongoDB
docker run -d -p 27017:27017 mongo:7
# or: docker compose up mongo

# 2. Server
cd server
cp .env.example .env
npm install
npm run seed   # admin@company.com / Admin123!
npm run dev    # :5000

# 3. Client (new terminal)
cd client
cp .env.example .env
npm install
npm run dev    # :5173
```

Root shortcut: `npm run install:all`, `npm run dev` (needs concurrently).

## Roles & RBAC
- `super_admin`: everything, user management
- `warehouse_manager`: products, warehouses, inventory moves, PO receive
- `sales_manager`: sales orders, reports
- `employee`: stock moves, create sales orders
- Middleware: `protect` (JWT) + `authorize(...roles)`

## Core flows
- **Product**: SKU unique, barcode, category/brand/supplier, cost/selling, minStock, images (Cloudinary ready), archive vs delete
- **Inventory**: `POST /api/inventory/move` {product, warehouse, type: in|out|adjustment|transfer, quantity, toWarehouse?} → updates Inventory + StockMovement + Product.stockQuantity + low/out notifications + Socket.IO `stock:update`
- **PO**: create → receive (`POST /purchase-orders/:id/receive`) auto stock-in
- **SO pipeline**: pending → confirmed → processing → shipped (deducts stock) → delivered, cancelled. Invoice: `GET /api/sales/:id/invoice.pdf`

## Dashboard
Total products, inventory value (stock×cost), low/out counts, today's orders, monthly sales, purchase costs, profit est.

## Folder structure
```
Inventory/
 server/src/
  config/ db.js cloudinary.js
  models/ User Warehouse Product Inventory StockMovement Supplier PurchaseOrder SalesOrder ActivityLog Notification
  middleware/ auth error rateLimit validate
  controllers/ authController productController inventoryController opsController
  routes/ auth products inventory purchasing sales
  utils/ helpers validators tokens pdf
  sockets/ inventorySocket.js
  seed/ seed.js
 client/src/
  api/ store/ components/ pages/ main.jsx
 docs/ API.md ARCHITECTURE.md DEPLOYMENT.md
```

## Env
Server `.env`: MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN, PORT, CLIENT_URL, CLOUDINARY_*
Client `.env`: VITE_API_URL

## Security
Helmet, CORS, mongo-sanitize, xss-clean, rate-limit (/api 300/15m, auth 50/15m), Joi validation, centralized errorHandler, bcrypt, JWT.

## Deployment
See `docs/DEPLOYMENT.md`. Docker Compose included.
