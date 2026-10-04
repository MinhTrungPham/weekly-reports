# Kế hoạch chi tiết Tuần 2 - Chương trình Intern WMS

## 1. Mục tiêu cần đạt trong Tuần 2

Trọng tâm của Tuần 2 là xây dựng nền móng cốt lõi cho hệ thống Mini-WMS. Đến cuối tuần, team cần đạt được các mục tiêu sau:

- **Cấu hình Database & Dữ liệu mồi (Seed Data):** Thiết lập kết nối Database, viết script/logic tạo các dữ liệu mặc định bắt buộc khi khởi chạy hệ thống (tài khoản hệ thống `admin`, danh sách các Roles chuẩn như ADMIN, WH_MANAGER, v.v.).
- **Đăng nhập & Phân quyền:** Người dùng có thể đăng nhập vào hệ thống, quản lý tài khoản và phân quyền dựa trên kho hàng.
- **Danh mục (Master Data):** Có thể tạo và quản lý danh sách Kho, Sơ đồ vị trí trong kho, Đơn vị tính (UOM) và Sản phẩm (SKU).
- **Trái tim hệ thống - Sổ cái tồn kho (Stock Ledger):** Xây dựng thành công `InventoryLedgerService` - service duy nhất chịu trách nhiệm ghi nhận mọi thay đổi về tồn kho. Phải đảm bảo tính vẹn toàn dữ liệu (Transaction), thiết kế thêm mới liên tục (Append-only) và có cơ chế khóa (Lock) chống chạy trùng (concurrency).

---

## 2. Danh sách các giao diện (UI) cần xây dựng

- **Màn hình Đăng nhập (Login):** Form đăng nhập vào hệ thống.
- **Màn hình Quản lý Người dùng (User Management):**
  - Xem danh sách User.
  - Thêm mới, sửa thông tin User.
  - Khóa (Inactive) tài khoản.
- **Màn hình Gán quyền (Role Assignment):** Cấp quyền cho user (Ví dụ: Gán quyền "quản lý kho" nhưng giới hạn phạm vi tại "Kho A").
- **Màn hình Danh sách Kho (Warehouse List):** Hiển thị danh sách các kho, tạo kho mới.
- **Màn hình Sơ đồ/Vị trí Kho (Location Management):** Quản lý cấu trúc vị trí trong kho theo dạng cây phân cấp (Zone -> Aisle -> Rack -> Bin).
- **Màn hình Danh mục Hàng hóa (SKU List):** Xem danh sách sản phẩm, thêm mới thông tin cơ bản của sản phẩm (chưa bao gồm số lượng tồn).
- **Màn hình Chi tiết Hàng hóa (SKU Detail):** Hiển thị chi tiết thông tin của một mã hàng, bao gồm cả các quy đổi đơn vị (UOM Conversions).

---

## 3. Danh sách chi tiết API và DTO

### 3.1. Nhóm Đăng nhập & Phân quyền (Domain A)

#### 1. Xác thực người dùng

* **Endpoint:** `POST /api/auth/login`
* **Request (`LoginRequest`):**

```json
{
  "username": "admin",
  "password": "Password123!"
}
```

* **Response (`AuthResponse`):**

```json
{
  "accessToken": "eyJhbG...",
  "expiresIn": 3600
}
```

#### 2. Lấy thông tin User hiện tại

* **Endpoint:** `GET /api/auth/me`
* **Response (`UserProfileResponse`):**

```json
{
  "id": 1, 
  "username": "admin", 
  "fullName": "System Admin",
  "roles": [
    { "roleCode": "ADMIN", "warehouseId": null },
    { "roleCode": "WH_MANAGER", "warehouseId": 5 }
  ]
}
```

#### 3. CRUD Người dùng

* **Endpoint:** `GET / POST / PUT /api/users`
* **POST Request (`CreateUserRequest`):**

```json
{
  "username": "user1",
  "email": "user1@wms.com",
  "password": "pwd",
  "fullName": "Nguyễn Văn A"
}
```

* **PUT Request (`UpdateUserRequest`):**

```json
{
  "fullName": "Nguyễn Văn A+",
  "status": "INACTIVE"
}
```

#### 4. Gán Role cho User

* **Endpoint:** `POST /api/users/{id}/roles`
* **Request (`AssignRoleRequest`):**

```json
{
  "roleId": 2,
  "warehouseId": 5
}
```

---

### 3.2. Nhóm Quản lý Danh mục Kho & Hàng (Domain B & C)

#### 1. Quản lý cấu hình Kho

**a. Lấy danh sách kho (có phân trang)**

* **Endpoint:** `GET /api/warehouses`
* **Query Params:** `?page=1&limit=10` (Mặc định `page=1`, `limit=10` nếu không cung cấp)
* **Response:**

```json
{
  "data": [
    {
      "id": "1",
      "code": "WH-01",
      "name": "Kho A",
      "address": "Quận 1",
      "status": "ACTIVE",
      "createdAt": "2026-09-30T10:00:00.000Z",
      "createdBy": "1",
      "updatedAt": "2026-09-30T10:00:00.000Z",
      "updatedBy": null
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

**b. Lấy thông tin chi tiết một kho**

* **Endpoint:** `GET /api/warehouses/{id}`
* **Response:**

```json
{
  "id": "1",
  "code": "WH-01",
  "name": "Kho A",
  "address": "Quận 1",
  "status": "ACTIVE",
  "createdAt": "2026-09-30T10:00:00.000Z",
  "createdBy": "1",
  "updatedAt": "2026-09-30T10:00:00.000Z",
  "updatedBy": null
}
```

**c. Tạo mới kho**

* **Endpoint:** `POST /api/warehouses`
* **Request (`CreateWarehouseRequest`):**

```json
{
  "code": "WH-01",
  "name": "Kho A",
  "address": "Quận 1",
  "status": "ACTIVE"
}
```

**d. Cập nhật thông tin kho**

* **Endpoint:** `PUT /api/warehouses/{id}`
* **Request (`UpdateWarehouseRequest`):**

```json
{
  "name": "Kho A (Đổi tên)",
  "address": "Quận 2",
  "status": "INACTIVE"
}
```

#### 2. Quản lý Vị trí Kho (Location)

**a. Lấy danh sách vị trí của một kho (có phân trang)**

* **Endpoint:** `GET /api/warehouses/{warehouseId}/locations`
* **Query Params:** `?page=1&limit=10` (Mặc định `page=1`, `limit=10`)
* **Response:**

```json
{
  "data": [
    {
      "id": "1",
      "warehouseId": "1",
      "parentId": "10",
      "code": "A1-R01-B05",
      "fullPath": "A1/R01/A1-R01-B05",
      "name": "Bin 05",
      "locationType": "BIN",
      "purpose": "STORAGE",
      "maxWeight": 50.0,
      "maxVolume": 2.5,
      "isPickable": true,
      "isActive": true,
      "createdAt": "2026-09-30T10:00:00.000Z",
      "createdBy": "1",
      "updatedAt": "2026-09-30T10:00:00.000Z",
      "updatedBy": null
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 10, "totalPages": 1 }
}
```

**b. Tạo mới vị trí**

* **Endpoint:** `POST /api/warehouses/{warehouseId}/locations`
* **Request (`CreateLocationRequest`):**

```json
{
  "code": "A1-R01-B05",
  "name": "Bin 05",
  "parentId": "10",
  "locationType": "BIN",
  "purpose": "STORAGE",
  "maxWeight": 50.0,
  "maxVolume": 2.5,
  "isPickable": true
}
```

**c. Cập nhật vị trí**

* **Endpoint:** `PUT /api/warehouses/{warehouseId}/locations/{id}`
* **Request (`UpdateLocationRequest`):**

```json
{
  "name": "Bin 05 (Đổi tên)",
  "purpose": "STORAGE",
  "maxWeight": 60.0,
  "maxVolume": 3.0,
  "isPickable": false
}
```

**d. Xóa vị trí**

* **Endpoint:** `DELETE /api/warehouses/{warehouseId}/locations/{id}`
* Ghi chú: Trả về thành công nếu không có vị trí con.

#### 3. Quản lý Đơn vị tính (UOM)

**a. Lấy danh sách UOM (có phân trang)**

* **Endpoint:** `GET /api/uoms`
* **Query Params:** `?page=1&limit=10&isActive=true`
* **Response:**
```json
{
  "data": [
    {
      "id": "1",
      "code": "PCS",
      "name": "Cái / Chiếc",
      "description": "Đơn vị tính cơ bản",
      "isActive": true,
      "createdAt": "2026-09-30T10:00:00.000Z",
      "createdBy": "1",
      "updatedAt": "2026-09-30T10:00:00.000Z",
      "updatedBy": null
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 10, "totalPages": 1 }
}
```

**b. Lấy thông tin một UOM**

* **Endpoint:** `GET /api/uoms/{id}`
* **Response:**
```json
{
  "id": "1",
  "code": "PCS",
  "name": "Cái / Chiếc",
  "description": "Đơn vị tính cơ bản",
  "isActive": true,
  "createdAt": "2026-09-30T10:00:00.000Z",
  "createdBy": "1",
  "updatedAt": "2026-09-30T10:00:00.000Z",
  "updatedBy": null
}
```

**c. Tạo mới UOM**

* **Endpoint:** `POST /api/uoms`
* **Request (`CreateUomRequest`):**

```json
{
  "code": "PCS",
  "name": "Cái / Chiếc",
  "description": "Đơn vị tính cơ bản"
}
```

**d. Cập nhật UOM**

* **Endpoint:** `PUT /api/uoms/{id}`
* **Request (`UpdateUomRequest`):**

```json
{
  "name": "Cái (cập nhật)"
}
```

**e. Xóa UOM**

* **Endpoint:** `DELETE /api/uoms/{id}`

#### 4. Quản lý Sản phẩm (SKU)

**a. Lấy danh sách sản phẩm (có phân trang)**

* **Endpoint:** `GET /api/skus`
* **Query Params:** `?page=1&limit=10&status=ACTIVE`
* **Response:**

```json
{
  "data": [
    {
      "id": "1",
      "skuCode": "IPHONE-15",
      "name": "iPhone 15",
      "baseUomId": "1",
      "category": "Smartphone",
      "weight": 0.2,
      "volume": 0.001,
      "status": "ACTIVE",
      "isLotTracked": true,
      "isSerialTracked": true,
      "createdAt": "2026-09-30T10:00:00.000Z",
      "createdBy": "1",
      "updatedAt": "2026-09-30T10:00:00.000Z",
      "updatedBy": null,
      "baseUom": {
        "id": "1",
        "code": "PCS",
        "name": "Cái / Chiếc"
      }
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 10, "totalPages": 1 }
}
```

**b. Lấy chi tiết một sản phẩm**

* **Endpoint:** `GET /api/skus/{id}`
* **Response:**

```json
{
  "id": "1",
  "skuCode": "IPHONE-15",
  "name": "iPhone 15",
  "baseUomId": "1",
  "category": "Smartphone",
  "weight": 0.2,
  "volume": 0.001,
  "status": "ACTIVE",
  "isLotTracked": true,
  "isSerialTracked": true,
  "createdAt": "2026-09-30T10:00:00.000Z",
  "createdBy": "1",
  "updatedAt": "2026-09-30T10:00:00.000Z",
  "updatedBy": null,
  "baseUom": {
    "id": "1",
    "code": "PCS",
    "name": "Cái / Chiếc"
  },
  "skuUomConversions": []
}
```

**c. Tạo mới sản phẩm**

* **Endpoint:** `POST /api/skus`
* **Request (`CreateSkuRequest`):**

```json
{
  "skuCode": "IPHONE-15",
  "name": "iPhone 15",
  "baseUomId": "1",
  "category": "Smartphone",
  "weight": 0.2,
  "volume": 0.001,
  "status": "ACTIVE",
  "isLotTracked": true,
  "isSerialTracked": true
}
```

**d. Cập nhật sản phẩm**

* **Endpoint:** `PUT /api/skus/{id}`
* **Request (`UpdateSkuRequest`):**

```json
{
  "name": "iPhone 15 Pro",
  "category": "Smartphone High-end",
  "weight": 0.25,
  "volume": 0.001,
  "status": "ACTIVE",
  "isLotTracked": true,
  "isSerialTracked": true
}
```

**e. Xóa mềm sản phẩm**

* **Endpoint:** `DELETE /api/skus/{id}`
* Ghi chú: API sẽ cập nhật trường `status` của SKU thành `INACTIVE`.

---

### 3.3. Nhóm Sổ cái Tồn kho & Tra cứu (Domain D & E)

#### 1. Lọc và tra cứu tồn kho hiện hành

* **Endpoint:** `GET /api/inventory`
* **Query Params:** `?warehouseId=5&locationId=120&skuId=88&lotNo=LOT1`
* **Response (`InventoryListResponse`):**

```json
{
  "items": [
    {
      "skuCode": "IPHONE-15",
      "locationCode": "A1-R01-B05",
      "lotNo": "LOT1",
      "serialNo": "SN-001",
      "qtyOnHand": 100,
      "qtyReserved": 20,
      "qtyAvailable": 80
    }
  ]
}
```

#### 2. Truy vấn lịch sử thẻ kho (Stock Ledger)

* **Endpoint:** `GET /api/stock-ledger`
* **Query Params:** `?skuId=88&locationId=120`
* **Response (`LedgerHistoryResponse`):**

```json
{
  "items": [
    {
      "movementTypeCode": "ADJUST_IN",
      "qtyBefore": 0,
      "qtyChange": 100,
      "qtyAfter": 100,
      "createdAt": "2026-09-29T10:00:00Z"
    }
  ]
}
```

#### 3. API: Điều chỉnh Tồn kho

* **Endpoint:** `POST /api/inventory/adjust`
* **Request (`InventoryAdjustRequest`):**

```json
{
  "warehouseId": 5,
  "locationId": 120,
  "skuId": 88,
  "lotNo": "LOT1",
  "serialNo": "SN-001",
  "movementTypeCode": "ADJUST_IN",
  "qtyChange": 100,
  "referenceCode": "ADJ-001",
  "note": "Nhập kho test ban đầu"
}
```

*(Ghi chú: qtyChange nhận giá trị Âm (-) nếu giảm, Dương (+) nếu tăng)*

---

## 4. Core Service Cần Triển Khai: `StockLedgerService` (`InventoryLedgerService`)

Đây là bộ não thực thi của cả hệ thống kho, với 3 nguyên tắc sống còn:

1. **Transaction:** Thao tác cập nhật `inventory` và thêm mới vào `stock_ledger` phải cùng nằm trong 1 Database Transaction. Lỗi ở bất kỳ đâu cũng phải rollback toàn bộ.
2. **Append-Only:** Bảng lịch sử `stock_ledger` cấm sử dụng lệnh UPDATE/DELETE. Mọi thao tác sửa đổi phải là tạo ra một dòng `REVERSAL` (bút toán đảo).
3. **Lock dữ liệu:** Áp dụng Optimistic Lock hoặc Pessimistic Lock khi tính toán số lượng tồn để ngăn chặn lỗi Concurrency khi nhiều nhân viên cùng thao tác với một mặt hàng.

---

## 5. Bảng Phân Công Công Việc

Dưới đây là bảng phân bổ nhiệm vụ cho 4 thành viên trong team:

| Thành viên         | Vai trò                           | Chi tiết công việc dự kiến                                                                                                                                                                                                                                         |
| :------------------- | :--------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vy Tran**    | **Frontend (UI)**            | Xây dựng toàn bộ 7 màn hình giao diện (Đăng nhập, Quản lý User, Gán quyền, Danh sách Kho, Sơ đồ Vị trí, Danh mục Hàng hóa, Chi tiết SKU). Đảm bảo kết nối chặt chẽ với API.                                                             |
| **Thuan Le**   | **Backend (DB Setup + API)** | Chịu trách nhiệm chính việc **cấu hình kết nối Database** và tạo **Seed data**. (Ưu tiên hoàn thành sớm)<br />Tập trung xử lý Core Service `InventoryLedgerService` (Sổ cái tồn kho) và các API tra cứu, điều chỉnh tồn kho. |
| **Trung Pham** | **Backend (API)**            | Phát triển API Domain Cấu hình Kho, Vị trí và Danh mục Hàng hóa (Warehouses, Locations, SKUs, UOMs).                                                                                                                                                          |
| **Nam Nguyen** | **Backend (API)**            | Phát triển API Domain Đăng nhập & Quản lý User.                                                                                                                                                                                                                  |
