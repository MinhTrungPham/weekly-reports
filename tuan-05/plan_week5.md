# Kế hoạch chi tiết Tuần 5 - Nâng cấp Toàn diện: Quản lý Dung lượng, Hàng hoàn trả, Nghiệp vụ Nông sản & Tối ưu Hệ thống

Tài liệu này kế thừa và phát triển từ **Tuần 4**, bổ sung đầy đủ chi tiết kỹ thuật, DTO Request/Response, tác động Database, hệ thống phân quyền (RBAC) và phân công nhiệm vụ cho **4 thành viên** (Nam Nguyen, Thuan Le, Trung Pham, Vy Tran) để chuẩn bị cho **DEMO TỔNG KẾT**.

---

## 1. Mục tiêu và Định hướng Trọng tâm Tuần 5

1. **Nâng cấp Luồng Nhập kho (Multi-destination Inbound):** Phá vỡ giới hạn 1 dòng nhập chỉ vào 1 ô; 1 dòng nhập có thể phân bổ ra nhiều ô khác nhau (Ô nhận, Ô lưu trữ, Ô hư hỏng/cách ly).
2. **Kiểm soát Dung lượng & Thể tích theo Cấp bậc (Hierarchical Capacity Control):** Quản lý tải trọng (`maxWeight`) và thể tích (`maxVolume`) từ cấp Kho tổng → Khu (Zone) → Dãy (Aisle) → Kệ (Rack) → Ô lưu trữ (Bin). Chặn nhập nếu vượt quá sức chứa.
3. **Module Hàng hoàn trả (Returns / RMA):** Xây dựng luồng tiếp nhận hàng trả tương tự quy trình Inbound: Lập phiếu → Phân công Receiver → Cân đối chiếu & Nhận vào khu cách ly → Kiểm định chất lượng (Nhập lại bán hoặc tiêu hủy).
4. **Độ tin cậy & Trải nghiệm Vận hành:** 
   - Tự động sinh mã vạch SKU-UOM tại Backend.
   - Cảnh báo cận date trực quan trong bảng Tồn kho.
   - Sơ đồ kho hỗ trợ lọc cả ô `ACTIVE` và `INACTIVE`.
   - Trang Tổng quan kho (Dashboard) cá nhân hóa chi tiết theo từng Role.
   - API Reset Password cho Admin.

---

## 2. Cập nhật Hệ thống Phân quyền (RBAC Matrix & Enums)

### 2.1. Mã Quyền mới bổ sung vào Codebase (`permission.enum.ts`)
```typescript
// Module Hàng hoàn trả (Returns / RMA)
RETURN_READ = 'RETURN.READ',
RETURN_CREATE = 'RETURN.CREATE',
RETURN_UPDATE = 'RETURN.UPDATE',
RETURN_CANCEL = 'RETURN.CANCEL',
RETURN_ASSIGN = 'RETURN.ASSIGN',
RETURN_RECEIVE = 'RETURN.RECEIVE',
RETURN_INSPECT = 'RETURN.INSPECT',

// Dashboard
DASHBOARD_READ = 'DASHBOARD.READ',

// Quản lý User bổ sung
USER_RESET_PASSWORD = 'USER.RESET_PASSWORD',
```

### 2.2. Ma trận gán quyền cho các Role (`permission-defaults.ts` & Patch DB)
| Nhóm quyền | Mã quyền | Vai trò được cấp (ngoài ADMIN) | Giải thích nghiệp vụ |
| :--- | :--- | :--- | :--- |
| **RETURN** | `RETURN.READ` | `WH_MANAGER`, `SUPERVISOR`, `RECEIVER`, `INSPECTOR`, `VIEWER` | Xem danh sách và chi tiết phiếu trả hàng |
| | `RETURN.CREATE`, `UPDATE`, `CANCEL` | `WH_MANAGER`, `SUPERVISOR` | Tạo, sửa lý do và hủy phiếu hoàn trả |
| | `RETURN.ASSIGN` | `SUPERVISOR` | Phân công nhân viên nhận hàng trả |
| | `RETURN.RECEIVE` | `RECEIVER` | Thực hiện cân thực tế và nhận vào khu cách ly |
| | `RETURN.INSPECT` | `INSPECTOR`, `WH_MANAGER` | Đánh giá chất lượng hàng trả (nhập lại hay hủy) |
| **DASHBOARD** | `DASHBOARD_READ` | `WH_MANAGER`, `SUPERVISOR`, `RECEIVER`, `PICKER`, `INSPECTOR`, `VIEWER` | Xem dashboard tổng quan theo phân quyền cá nhân |
| **USER** | `USER_RESET_PASSWORD` | *(Chỉ ADMIN)* | Cấp lại mật khẩu cho tài khoản người dùng |

---

## 3. Cập nhật Cơ sở Dữ liệu (Prisma Schema Changes)

```prisma
// 1. Bổ sung sức chứa tối đa cho Kho tổng
model Warehouse {
  id        BigInt   @id @default(autoincrement())
  code      String   @unique @db.VarChar(20)
  name      String   @db.VarChar(255)
  address   String?  @db.VarChar(255)
  status    String   @default("ACTIVE") @db.VarChar(20)

  // MỚI: Giới hạn tải trọng & thể tích toàn kho
  maxWeight Decimal? @map("max_weight") @db.Decimal(18, 4) // kg
  maxVolume Decimal? @map("max_volume") @db.Decimal(18, 4) // m3

  createdAt DateTime @default(now()) @map("created_at")
  createdBy BigInt?  @map("created_by")
  updatedAt DateTime @updatedAt @map("updated_at")
  updatedBy BigInt?  @map("updated_by")

  locations  Location[]
  userRoles  UserRole[]
  inventory  Inventory[]
  stockLedger StockLedger[]
  receipts   Receipt[] @relation("Receipt_warehouse")
  shipments  Shipment[] @relation("Shipment_warehouse")
  returns    ReturnOrder[] @relation("ReturnOrder_warehouse")

  @@map("warehouses")
}

// 2. Tạo bảng chi tiết nhận hàng đa vị trí (Multi-destination Receiving)
model ReceiptLineDetail {
  id            BigInt    @id @default(autoincrement())
  receiptLineId BigInt    @map("receipt_line_id")
  locationId    BigInt    @map("location_id") // Ô nhận, Ô lưu trữ hoặc Ô hư hỏng
  quantity      Decimal   @map("quantity") @db.Decimal(18, 4)
  qualityStatus String    @default("GOOD") @map("quality_status") @db.VarChar(20) // GOOD, DAMAGED, SUSPECT
  lotNo         String?   @map("lot_no") @db.VarChar(50)
  serialNo      String?   @map("serial_no") @db.VarChar(100)
  expiryDate    DateTime? @map("expiry_date") @db.Date
  note          String?   @db.VarChar(255)

  createdAt     DateTime  @default(now()) @map("created_at")
  createdBy     BigInt?   @map("created_by")

  receiptLine   ReceiptLine @relation(fields: [receiptLineId], references: [id], onDelete: Cascade)
  location      Location    @relation(fields: [locationId], references: [id], onDelete: Restrict)

  @@index([receiptLineId])
  @@index([locationId])
  @@map("receipt_line_details")
}

// 3. Module Hàng hoàn trả (Returns / RMA)
model ReturnOrder {
  id                 BigInt       @id @default(autoincrement())
  code               String       @unique @db.VarChar(50)
  warehouseId        BigInt       @map("warehouse_id")
  originalShipmentId BigInt?      @map("original_shipment_id")
  customerInfo       String?      @map("customer_info") @db.VarChar(255)
  status             String       @default("NEW") @db.VarChar(20) // NEW, ASSIGNED, RECEIVED, COMPLETED, CANCELLED
  reason             String?      @db.VarChar(500)
  assignedTo         BigInt?      @map("assigned_to")
  assignedBy         BigInt?      @map("assigned_by")

  createdAt          DateTime     @default(now()) @map("created_at")
  createdBy          BigInt?      @map("created_by")
  updatedAt          DateTime     @updatedAt @map("updated_at")
  updatedBy          BigInt?      @map("updated_by")

  warehouse          Warehouse    @relation("ReturnOrder_warehouse", fields: [warehouseId], references: [id])
  originalShipment   Shipment?    @relation(fields: [originalShipmentId], references: [id])
  assignee           User?        @relation("ReturnOrder_assignee", fields: [assignedTo], references: [id])
  assigner           User?        @relation("ReturnOrder_assigner", fields: [assignedBy], references: [id])
  lines              ReturnLine[]

  @@map("return_orders")
}

model ReturnLine {
  id               BigInt      @id @default(autoincrement())
  returnOrderId    BigInt      @map("return_order_id")
  skuId            BigInt      @map("sku_id")
  uomId            BigInt      @map("uom_id")
  expectedQty      Decimal     @map("expected_qty") @db.Decimal(18, 4)
  receivedQty      Decimal     @default(0) @map("received_qty") @db.Decimal(18, 4)
  targetLocationId BigInt?     @map("target_location_id") // Vị trí cách ly nhận hàng
  qualityStatus    String      @default("SUSPECT") @map("quality_status") @db.VarChar(20) // GOOD, DAMAGED, EXPIRED
  disposition      String?     @db.VarChar(20) // RESTOCK, SCRAP, RETURN_TO_VENDOR
  lotNo            String?     @map("lot_no") @db.VarChar(50)
  expiryDate       DateTime?   @map("expiry_date") @db.Date
  note             String?     @db.VarChar(255)

  returnOrder      ReturnOrder @relation(fields: [returnOrderId], references: [id], onDelete: Cascade)
  sku              Sku         @relation(fields: [skuId], references: [id])
  uom              Uom         @relation(fields: [uomId], references: [id])
  targetLocation   Location?   @relation(fields: [targetLocationId], references: [id])

  @@map("return_lines")
}
```

---

## 4. Chi tiết API: Request, Response & Tác động Database

### 4.1. Nhập kho Đa vị trí & Kiểm tra Sức chứa
**Quyền:** `RECEIPT.RECEIVE`

* **API:** `POST /api/receipts/{id}/receive`
* **Mô tả:** Nhận hàng cho phép 1 dòng nhập chia thành nhiều ô (Lưu trữ `STORAGE`, Hàng hỏng `DAMAGED`, Ô nhận `RECEIVING`). Tự động kiểm tra sức chứa theo cấp bậc.
* **Tác động DB:**
  - Kiểm tra `Warehouse.maxWeight` và `Warehouse.maxVolume`. Nếu tổng tồn kho hiện tại + hàng mới nhập vượt quá → Ném `400 Bad Request`.
  - Kiểm tra `Location.maxWeight` và `Location.maxVolume` của từng ô đích.
  - Insert các dòng vào `receipt_line_details`.
  - Cập nhật `receivedQty` tại `receipt_lines`.
  - Ghi nhận `stock_ledger` riêng biệt cho từng ô thông qua `InventoryLedgerService.recordMovement`.
* **Request (`ReceiveReceiptMultiLocationDto`)**:
```json
{
  "lines": [
    {
      "receiptLineId": "101",
      "allocations": [
        {
          "locationId": "15",
          "receivedQty": "70.0000",
          "qualityStatus": "GOOD",
          "lotNo": "LOT-CACHUA-01",
          "expiryDate": "2026-10-25"
        },
        {
          "locationId": "99",
          "receivedQty": "30.0000",
          "qualityStatus": "DAMAGED",
          "lotNo": "LOT-CACHUA-01",
          "expiryDate": "2026-10-25",
          "note": "Dập nát 30% thùng khi bốc dỡ"
        }
      ]
    }
  ]
}
```
* **Response (200 OK)**:
```json
{
  "statusCode": 200,
  "message": "Nhận hàng đa vị trí thành công",
  "data": {
    "receiptId": "1",
    "status": "RECEIVED",
    "totalAllocatedQty": "100.0000",
    "details": [
      {
        "id": "1",
        "receiptLineId": "101",
        "locationCode": "A1-R01-B01",
        "quantity": "70.0000",
        "qualityStatus": "GOOD"
      },
      {
        "id": "2",
        "receiptLineId": "101",
        "locationCode": "DMG-ZONE-01",
        "quantity": "30.0000",
        "qualityStatus": "DAMAGED"
      }
    ]
  }
}
```

---

### 4.2. Module Hàng Hoàn Trả (Returns / RMA) Chi tiết

#### a. Tạo Phiếu Yêu cầu Trả hàng (`POST /api/returns`)
* **Quyền:** `RETURN.CREATE`
* **Tác động DB:**
  - Thêm mới 1 dòng vào `return_orders` (`status = 'NEW'`).
  - Thêm các dòng dự kiến vào `return_lines`.
* **Request (`CreateReturnOrderDto`)**:
```json
{
  "warehouseId": "1",
  "originalShipmentId": "50",
  "customerInfo": "Khách hàng Minh Tuấn - 0901234567",
  "reason": "Hàng không đạt cam kết độ tươi, bị dập nát",
  "lines": [
    {
      "skuId": "2",
      "uomId": "1",
      "expectedQty": "10.0000"
    }
  ]
}
```
* **Response (201 Created)**:
```json
{
  "statusCode": 201,
  "data": {
    "id": "1",
    "code": "RET-20261012-001",
    "status": "NEW",
    "warehouseId": "1",
    "customerInfo": "Khách hàng Minh Tuấn - 0901234567",
    "lines": [
      {
        "id": "1",
        "skuId": "2",
        "expectedQty": "10.0000",
        "receivedQty": "0.0000"
      }
    ]
  }
}
```

#### b. Phân công Nhân viên Nhận hàng (`POST /api/returns/{id}/assign`)
* **Quyền:** `RETURN.ASSIGN`
* **Tác động DB:** Cập nhật `assignedTo`, `assignedBy`, đổi `status = 'ASSIGNED'`.
* **Request (`AssignReturnDto`)**:
```json
{
  "assignedTo": "8"
}
```
* **Response (200 OK)**:
```json
{
  "statusCode": 200,
  "message": "Phân công người nhận hàng thành công",
  "data": {
    "id": "1",
    "status": "ASSIGNED",
    "assignedTo": "8",
    "assigneeName": "Nguyễn Văn Receiver"
  }
}
```

#### c. Thực hiện Cân & Nhận hàng vào Khu cách ly (`POST /api/returns/{id}/receive`)
* **Quyền:** `RETURN.RECEIVE`
* **Tác động DB:**
  - Bắt buộc kiểm tra `targetLocation` phải có `purpose = 'QC'` hoặc `'DAMAGED'`.
  - Cập nhật `receivedQty`, `lotNo`, `expiryDate` vào `return_lines`.
  - Đổi trạng thái phiếu sang `RECEIVED`.
  - Ghi nhận `stock_ledger` loại `RETURN` vào khu cách ly (Tồn kho này **không nằm trong** `qtyAvailable` để bán).
* **Request (`ReceiveReturnDto`)**:
```json
{
  "lines": [
    {
      "returnLineId": "1",
      "receivedQty": "9.6000",
      "targetLocationId": "99",
      "qualityStatus": "SUSPECT",
      "lotNo": "LOT-AGRI-02",
      "expiryDate": "2026-10-18",
      "note": "Cân thực tế được 9.6 kg, hao hụt 0.4 kg so với đơn gốc"
    }
  ]
}
```
* **Response (200 OK)**:
```json
{
  "statusCode": 200,
  "message": "Tiếp nhận hàng trả vào khu cách ly thành công",
  "data": {
    "id": "1",
    "status": "RECEIVED",
    "receivedLines": [
      {
        "id": "1",
        "skuCode": "DEMO-AGRI3",
        "receivedQty": "9.6000",
        "quarantineLocationCode": "QC-HOLD-01"
      }
    ]
  }
}
```

#### d. Kiểm định Chất lượng & Xử lý Sau Trả (`POST /api/returns/{id}/inspect`)
* **Quyền:** `RETURN.INSPECT`
* **Tác động DB:**
  - Cập nhật `disposition`:
    - `RESTOCK` (Nhập lại kho bán): Gọi ledger chuyển hàng từ ô `QC` sang ô `STORAGE`.
    - `SCRAP` (Tiêu hủy): Gọi ledger trừ tiêu hủy từ ô `QC` / `DAMAGED`.
  - Đổi trạng thái phiếu sang `COMPLETED`.
* **Request (`InspectReturnDto`)**:
```json
{
  "lines": [
    {
      "returnLineId": "1",
      "disposition": "SCRAP",
      "finalLocationId": "99",
      "inspectionNote": "Hàng dập thối toàn bộ, không đủ điều kiện nhập lại. Đưa đi tiêu hủy."
    }
  ]
}
```
* **Response (200 OK)**:
```json
{
  "statusCode": 200,
  "message": "Hoàn tất kiểm định và xử lý hàng trả",
  "data": {
    "id": "1",
    "status": "COMPLETED",
    "disposition": "SCRAP"
  }
}
```

---

### 4.3. Chi tiết Trang Tổng quan Kho (Dashboard) theo từng Role

#### Giao diện & Thống kê theo Role:
1. **WH_MANAGER (Quản lý kho):**
   * **Giao diện:** Thanh tiến trình dung lượng kho (Tải trọng % & Thể tích %), Biểu đồ donut cơ cấu hàng hóa, Danh sách việc cần duyệt gấp (Adjustment, Transfer, Reversal), Bảng cảnh báo hàng cận date.
   * **API:** `GET /api/dashboard/manager?warehouseId=1`
2. **SUPERVISOR (Giám sát ca):**
   * **Giao diện:** Thanh trạng thái tiến độ ca trực (Tiến độ Nhập kho, Tiến độ Soạn hàng, Tiến độ Kiểm kê), Danh sách phiếu chưa gán người (`Unassigned Tasks`), Danh sách nhân viên đang trong ca.
   * **API:** `GET /api/dashboard/supervisor?warehouseId=1`
3. **RECEIVER / PICKER (Nhân viên vận hành):**
   * **Giao diện (Mobile-First):** Danh sách "Nhiệm vụ của tôi" (My Assigned Tasks) hiển thị dạng thẻ card to rõ, đếm số lượng kg/thùng đã hoàn thành trong ngày, cảnh báo phiếu trễ deadline.
   * **API:** `GET /api/dashboard/operator`
4. **INSPECTOR (Nhân viên kiểm kê & KCS):**
   * **Giao diện:** Thống kê đợt kiểm kê đang mở, Danh sách phiếu hàng hoàn trả đang chờ kiểm định tại khu `QC`, Danh sách mặt hàng có chênh lệch tồn lớn.
   * **API:** `GET /api/dashboard/inspector?warehouseId=1`
5. **ADMIN (Quản trị viên):**
   * **Giao diện:** Thẻ trạng thái hệ thống (Uptime, Database connections), Thống kê số lượng User/Role, Nút tắt mở Reset Password nhanh.
   * **API:** `GET /api/dashboard/admin`

* **Cấu trúc Response mẫu cho `WH_MANAGER` (`GET /api/dashboard/manager`)**:
```json
{
  "statusCode": 200,
  "data": {
    "warehouse": {
      "id": "1",
      "code": "WH-HCM-01",
      "name": "Kho Tổng Nông Sản HCM"
    },
    "capacity": {
      "maxWeight": "10000.0000",
      "currentWeight": "6540.0000",
      "weightUsagePercent": 65.4,
      "maxVolume": "500.0000",
      "currentVolume": "310.0000",
      "volumeUsagePercent": 62.0
    },
    "alerts": {
      "expiredCount": 2,
      "nearExpiryCount": 8,
      "damagedStockQty": "45.0000"
    },
    "pendingApprovals": {
      "adjustments": 3,
      "transfers": 1,
      "reversals": 2
    },
    "todayThroughput": {
      "receivedBaseQty": "1200.0000",
      "shippedBaseQty": "950.0000"
    }
  }
}
```

---

### 4.4. Các API Hỗ trợ Kỹ thuật & Quản trị

#### a. Reset Password cho Admin (`POST /api/users/{id}/reset-password`)
* **Quyền:** `USER.RESET_PASSWORD` (Chỉ Admin)
* **Request (`ResetPasswordDto`)**:
```json
{
  "newPassword": "TemporaryPassword123!"
}
```
* **Response (200 OK)**:
```json
{
  "statusCode": 200,
  "message": "Đặt lại mật khẩu thành công. Các phiên đăng nhập cũ đã bị vô hiệu hóa.",
  "data": {
    "userId": "15",
    "username": "picker_nam",
    "updatedAt": "2026-10-12T10:30:00.000Z"
  }
}
```

#### b. Sơ đồ Vị trí Kho: Lọc Active/Inactive & Sơ đồ Cây
* **API Danh sách:** `GET /api/warehouses/{id}/locations?status=ALL&locationType=BIN`
  - Tham số `status`: `'ACTIVE' | 'INACTIVE' | 'ALL'`.
* **API Sơ đồ Cây:** `GET /api/warehouses/{id}/locations/tree`
* **Response (200 OK)**:
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "1",
      "code": "ZONE-A",
      "name": "Khu Bảo Quản Lạnh",
      "locationType": "ZONE",
      "isActive": true,
      "children": [
        {
          "id": "10",
          "code": "A1-R01",
          "name": "Kệ Rau Củ 01",
          "locationType": "RACK",
          "isActive": true,
          "children": [
            {
              "id": "101",
              "code": "A1-R01-B01",
              "locationType": "BIN",
              "purpose": "STORAGE",
              "isActive": true,
              "maxWeight": "500.0000",
              "currentWeight": "350.0000"
            },
            {
              "id": "102",
              "code": "A1-R01-B02",
              "locationType": "BIN",
              "purpose": "STORAGE",
              "isActive": false,
              "note": "Đang bảo trì thanh ray"
            }
          ]
        }
      ]
    }
  ]
}
```

#### c. Tự động sinh Mã vạch cho SKU - UOM
* **Trigger:** Khi gọi `POST /api/skus/{id}/uom-conversions`.
* **Response trả về có thêm thông tin barcode:**
```json
{
  "statusCode": 201,
  "data": {
    "skuId": "1",
    "uomId": "2",
    "factorToBase": "12.0000",
    "barcode": {
      "barcode": "BAR-CACHUA-THUNG12",
      "barcodeType": "CODE128",
      "isPrimary": true
    }
  }
}
```

---

## 5. Phân công Nhiệm vụ DEMO Tổng kết Tuần 5 (Đội ngũ 4 thành viên)

Vì **Nhật Quân đã rời nhóm**, khối lượng công việc được tái cấu trúc lại rõ ràng, cân bằng và bám sát thế mạnh chuyên môn của **4 thành viên** (3 Backend + 1 Frontend). Để giảm tải cho Frontend duy nhất (Vy Tran), các thành viên Backend sẽ chủ động viết đầy đủ Swagger, chuẩn hóa DTO và trực tiếp hỗ trợ ghép nối API vào giao diện của module mình phụ trách.

---

### 5.1. Chi tiết Trách nhiệm Từng Thành viên

#### 1. Nam Nguyen - Phụ trách: Module Hàng hoàn trả (Returns) & Tự động sinh Mã vạch
*   **Trọng tâm:** Xây dựng trọn vẹn vòng đời hàng trả về từ khách và tự động hóa sinh Barcode SKU-UOM.
*   **Nhiệm vụ Backend chi tiết:**
    - Tạo 2 model Prisma mới: `ReturnOrder` và `ReturnLine`.
    - Viết API Tạo phiếu trả hàng (`POST /api/returns`), liên kết với đơn xuất gốc `originalShipmentId`.
    - Viết API Phân công nhân viên nhận hàng (`POST /api/returns/{id}/assign`) cấp quyền cho `SUPERVISOR`.
    - Viết API Tiếp nhận cân thực tế tại cửa kho (`POST /api/returns/{id}/receive`): Bắt buộc nhận vào ô có `purpose = 'QC'` hoặc `'DAMAGED'`, ghi nhận sổ cái `stock_ledger` loại `RETURN` cách ly (không cộng vào tồn bán được).
    - Viết API Kiểm định chất lượng (`POST /api/returns/{id}/inspect`): Xử lý 2 nhánh `RESTOCK` (chuyển sang ô bán) hoặc `SCRAP` (tiêu hủy).
    - Tự động sinh mã vạch `BAR-{skuCode}-{uomCode}` vào bảng `sku_barcodes` khi gọi tạo `SkuUomConversion`.
*   **Hỗ trợ Frontend:** Phối hợp cùng Vy Tran kiểm thử luồng form tiếp nhận hàng trả và in tem mã vạch.
*   **Tiêu chí hoàn thành (DoD):** Chạy thông suốt luồng tạo phiếu → gán việc → cân nhận vào QC → duyệt tiêu hủy/nhập lại; test E2E 0 lỗi.

---

#### 2. Thuan Le - Phụ trách: Nhập kho Đa vị trí & Kiểm soát Sức chứa Kho theo Cấp bậc
*   **Trọng tâm:** Giải quyết các bài toán vận hành cốt lõi về vị trí lưu trữ và sức chứa vật lý của hệ thống kho.
*   **Nhiệm vụ Backend chi tiết:**
    - Thêm trường `maxWeight` và `maxVolume` vào model `Warehouse`. Tạo model `ReceiptLineDetail`.
    - Nâng cấp API Nhập kho (`POST /api/receipts/{id}/receive`): Cho phép 1 dòng nhập chia thành nhiều dòng phân bổ (`allocations`), gỡ bỏ hoàn toàn logic ép cứng ô nhận, hỗ trợ nhận thẳng vào ô lưu trữ (`STORAGE`) hoặc ô hàng hỏng (`DAMAGED`).
    - Cài đặt thuật toán kiểm soát dung lượng & thể tích theo hình tháp: Tổng Ô (Bin) ≤ Kệ (Rack) ≤ Dãy (Aisle) ≤ Kho tổng. Chặn ném lỗi `400` nếu hàng nhập làm vượt quá sức chứa.
*   **Hỗ trợ Frontend:** Chuẩn bị payload mẫu và phối hợp cùng Vy Tran ráp giao diện chia ô nhận hàng & hiển thị giới hạn tải trọng/thể tích.
*   **Tiêu chí hoàn thành (DoD):** Nhập 1 dòng tách được nhiều ô (ô lưu trữ + ô hàng hỏng/cách ly); test chặn thành công khi nhập vượt quá tải trọng hoặc thể tích kho.

---

#### 3. Trung Pham - Phụ trách: Lõi Hệ thống, Bảo mật, Sổ cái & Dashboard Analytics
*   **Trọng tâm:** Đảm bảo an toàn dữ liệu sổ cái, phân quyền RBAC toàn hệ thống, quản trị tài khoản và xây dựng trung tâm chỉ huy (Dashboard).
*   **Nhiệm vụ Backend chi tiết:**
    - Cập nhật file Enum `permission.enum.ts`, cấu hình `permission-defaults.ts` và chạy Script Patch trực tiếp vào Database cho các quyền mới (`RETURN.*`, `DASHBOARD_READ`, `USER_RESET_PASSWORD`).
    - Tách luồng Bút toán đảo trong `InventoryLedgerService`: Đóng gói thành hàm chuyên biệt `executeReversal(...)`, kiểm tra chặt chẽ điều kiện (chỉ đảo chứng từ 1 vế, không có movement mới hơn đè lên, chống âm kho) trước khi sinh ledger đảo dấu.
    - Viết API Reset Password cho Admin (`POST /api/users/{id}/reset-password`): Hash bcrypt mật khẩu mới, cập nhật DB và hủy toàn bộ refresh token cũ.
    - Nâng cấp `GET /api/inventory`: Bổ sung tính toán động `daysUntilExpiry` và gắn cờ cảnh báo `expiryAlert` (`CRITICAL`, `WARNING`, `NORMAL`).
    - Nâng cấp API Sơ đồ vị trí kho: Hỗ trợ lọc `status = 'ALL' | 'ACTIVE' | 'INACTIVE'` và API lấy sơ đồ cây phân cấp `GET /warehouses/{id}/locations/tree`.
    - Xây dựng bộ API Dashboard tổng quan phân nhánh theo 5 Role:
      + `GET /api/dashboard/manager`: Thống kê dung lượng kho (% Weight, % Volume), số lô cận date, số việc chờ duyệt.
      + `GET /api/dashboard/supervisor`: Tiến độ ca trực, danh sách việc chưa gán người.
      + `GET /api/dashboard/operator`: Danh sách việc cá nhân (My Tasks) cho Picker/Receiver.
      + `GET /api/dashboard/inspector`: Đợt kiểm kê mở, lô hàng trả chờ kiểm định.
      + `GET /api/dashboard/admin`: Trạng thái hệ thống, thống kê người dùng.
*   **Hỗ trợ Frontend:** Đảm bảo API Dashboard trả về đúng định dạng biểu đồ cho Vy Tran gắn lên UI.
*   **Tiêu chí hoàn thành (DoD):** DB nhận đủ permission mới; API Reset Password hoạt động chuẩn; Dashboard trả đủ data cho 5 Role; Ledger Reversal an toàn tuyệt đối.

---

#### 4. Vy Tran - Phụ trách: Frontend Lead (Toàn bộ Giao diện Vận hành & Quản trị)
*   **Trọng tâm:** Xây dựng trải nghiệm người dùng (UX/UI) trực quan, hiện đại, tối ưu cho cả Desktop lẫn màn hình cảm ứng di động trong kho.
*   **Nhiệm vụ Frontend chi tiết:**
    1. **Màn hình Nhập kho Đa vị trí:** Nâng cấp trang Receipt Detail, cho phép nhân viên bấm "+ Thêm vị trí nhận", chọn loại ô (Lưu trữ / Hàng hỏng) và nhập số lượng phân bổ.
    2. **Màn hình Module Hàng hoàn trả (Returns):** Xây dựng trang danh sách phiếu trả hàng, Form tiếp nhận cân thực tế tại cửa kho và Giao diện cho Inspector duyệt kiểm định chất lượng (Restock / Scrap).
    3. **Sơ đồ Kho & Cảnh báo Cận date:**
       - Bổ sung bộ lọc trạng thái (Active / Inactive / Tất cả) và chế độ xem Sơ đồ cây (Tree View) trong Quản lý Vị trí kho.
       - Gắn Badge màu sắc cảnh báo hạn dùng (Đỏ = Quá hạn, Vàng = Cận hạn ≤ 7 ngày) trong bảng Tồn kho; thêm nút bấm nhanh "Điều chỉnh".
    4. **Trang Dashboard Tổng quan:** Xây dựng màn hình Dashboard tự động đổi layout theo Role đăng nhập (Biểu đồ thanh dung lượng cho Manager, Thẻ công việc cần làm cho Picker/Receiver, Thẻ tiến độ ca cho Supervisor).
    5. **Modal Reset Password:** Thêm nút "Cấp lại mật khẩu" trong trang Quản lý Người dùng của Admin.
*   **Tiêu chí hoàn thành (DoD):** Mọi màn hình kết nối API mượt mà, có xử lý trạng thái Loading/Error/Disable nút bấm chống spam, responsive thân thiện trên thiết bị di động.

---

### 5.2. Bảng Ma trận Phân công Tổng hợp

| Hạng mục công việc | Phụ trách Backend | Phụ trách Frontend | Trạng thái mục tiêu |
| :--- | :---: | :---: | :---: |
| **1. Nhập kho Đa vị trí (`ReceiptLineDetail`)** | Thuan Le | Vy Tran | Hoàn thành trước Demo |
| **2. Kiểm soát Sức chứa Kho/Kệ theo Cấp bậc** | Thuan Le | Vy Tran | Hoàn thành trước Demo |
| **3. Module Hàng hoàn trả (Returns / RMA)** | Nam Nguyen | Vy Tran | Hoàn thành trước Demo |
| **4. Tự động sinh Mã vạch SKU-UOM** | Nam Nguyen | *(Tự động qua API)* | Hoàn thành trước Demo |
| **5. Chuẩn hóa Luồng Bút toán đảo trong Ledger** | Trung Pham | Vy Tran | Hoàn thành trước Demo |
| **6. Phân quyền Enum, Seed RBAC & DB Patch** | Trung Pham | *(Áp dụng toàn hệ thống)* | Hoàn thành trước Demo |
| **7. Cảnh báo Cận date trong Tồn kho** | Trung Pham | Vy Tran | Hoàn thành trước Demo |
| **8. Sơ đồ Vị trí Kho (Filter Active/Inactive & Tree)** | Trung Pham | Vy Tran | Hoàn thành trước Demo |
| **9. API Reset Password cho Admin** | Trung Pham | Vy Tran | Hoàn thành trước Demo |
| **10. Trang Dashboard Tổng quan theo 5 Role** | Trung Pham | Vy Tran | Hoàn thành trước Demo |
