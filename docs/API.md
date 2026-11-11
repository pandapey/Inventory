# REST API

Base: `/api` — Auth: `Authorization: Bearer <JWT>`

## Auth
- POST `/auth/register` {name,email,password,role?} → first user = super_admin
- POST `/auth/login` {email,password}
- GET `/auth/me`
- GET `/auth/users` [super_admin]

## Products
- GET `/products?search=&category=&brand=&low=true&out=true&page=&limit=&sort=`
- GET `/products/:id` (+ per-warehouse stock)
- POST `/products` [super_admin, warehouse_manager]
- PUT `/products/:id`
- POST `/products/:id/archive`
- DELETE `/products/:id` [super_admin]

## Inventory / Warehouses / Dashboard
- POST `/inventory/move` {product, warehouse, type, quantity, reason?, toWarehouse?}
- GET `/inventory/history?product=&warehouse=&type=`
- GET `/inventory/warehouse/:warehouseId`
- POST `/inventory/warehouses` / GET `/inventory/warehouses`
- GET `/inventory/dashboard`
- GET `/inventory/reports/sales?from=&to=&format=csv`
- GET `/inventory/reports/inventory?format=csv`

## Purchasing
- POST `/purchasing/suppliers` / GET `/purchasing/suppliers?search=` / PUT `/purchasing/suppliers/:id`
- GET `/purchasing/suppliers/:id/history`
- POST `/purchasing/purchase-orders` {supplier, warehouse, items[{product,quantity,costPrice}], expectedDelivery?}
- GET `/purchasing/purchase-orders?status=`
- POST `/purchasing/purchase-orders/:id/receive`

## Sales
- POST `/sales` {customer{name,email?,phone?,address?}, warehouse, items[{product,quantity,price,discount?}], taxRate?}
- GET `/sales?status=&page=&limit=`
- PATCH `/sales/:id/status` {status}
- GET `/sales/:id/invoice.pdf`

## Sockets
- `stock:update` {product, total}
- `notification` {...}

## Errors
`{ success:false, message, errors? }` — 400 validation, 401 auth, 403 RBAC, 404, 500.
