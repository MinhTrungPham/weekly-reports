# Kế hoạch chi tiết Tuần 4 - Chặng cuối: Xuất kho, Chuyển kho & Bút toán đảo

Đây là **tuần nặng nhất** trong toàn bộ quá trình xây dựng hệ thống. Tài liệu này đã được rà soát và hợp nhất toàn bộ các yêu cầu về API, logic phân quyền, luồng STAGING/TRANSIT và các giới hạn nghiệp vụ khắt khe nhất để chuẩn bị cho **DEMO 2**.

---

## 1. Mục tiêu và Định hướng Tuần 4

- **Trọng tâm 1 (Xuất kho - Shipment):** Tách bạch rõ 2 bước: **Reserve (Giữ chỗ)** và **Pick (Soạn hàng vào STAGING)**. Giao hàng thiếu sẽ dẫn tới trạng thái `PARTIALLY_SHIPPED`.
- **Trọng tâm 2 (Chuyển kho - Transfer):** Phối hợp 2 Manager (Nguồn/Đích). Hàng đi qua trạng thái trung gian `TRANSIT` để tránh thất thoát. Quản lý xử lý ngoại lệ nếu nhận thiếu.
- **Trọng tâm 3 (Reversal & Adjustment):** Yêu cầu Bút toán đảo do Manager tạo (chỉ áp dụng cho chứng từ 1 vế, không có movement phát sinh sau đó) và Admin duyệt. Quick Adjustment được tạo ngay từ giao diện tồn kho (chỉ sinh Draft chờ duyệt).

---

## 2. Kịch bản Nghiệp vụ Chi tiết 

**Kịch bản 1: Xuất kho (Shipment) & Xử lý Thiếu hàng**

1. **SUPERVISOR**: Lập Phiếu xuất (`Shipment`), tự phân bổ thủ công (Reserve) và giao cho Picker.
2. **PICKER**: đi nhặt hàng.
   - Với 4 dòng đầu: Lấy đủ số lượng, hàng được chuyển tạm vào khu `STAGING`.
   - Với dòng số 5 (Yêu cầu 10): Chỉ lấy được 8, báo thiếu.
3. **DISPATCHER**: Tại khu đóng gói, kiểm tra hàng từ STAGING và xác nhận Dispatch.
   - Hệ thống trừ tồn kho thực tế. Phiếu chuyển thành `PARTIALLY_SHIPPED` (vì 8 < 10). Ghi nhận `dispatch_lines`.

**Kịch bản 2: Chuyển kho liên trạm (Transfer)**

1. **WH_MANAGER (Kho Nguồn)**: Lập phiếu `Transfer`, gán người đi nhặt (`pickerId`).
2. **WH_MANAGER (Kho Đích)**: Xem thông tin và **Duyệt**, gán người nhận (`receiverId`). (Phiếu chưa duyệt thì không được gửi đi).
3. **PICKER (Nguồn)**: Pick hàng xuất sang trạng thái `TRANSIT`. (Ví dụ xuất 10).
4. **RECEIVER (Đích)**: Khi hàng đến, tự điền vị trí cất kệ (`targetLocationId`). Nếu chỉ nhận được 8 -> Trạng thái phiếu là `DISCREPANCY`, 2 món còn lơ lửng ở `TRANSIT`. Nhận đủ 10 -> `COMPLETED`.

**Kịch bản 3: Bút toán đảo (Reversal) & Điều chỉnh nhanh**

1. **Bút toán đảo**: Manager phát hiện 1 giao dịch sai (ví dụ Phiếu điều chỉnh cũ), nhấn **Tạo Yêu cầu Đảo**.
   - Hệ thống kiểm tra: Không được đảo các chứng từ nhiều vế (Pick/Putaway/Transfer). Không được đảo nếu đã có giao dịch mới đè lên.
   - Yêu cầu ở trạng thái `PENDING`. Người tạo có thể Cancel.
   - **ADMIN** duyệt -> Sinh `stock_ledger` ngược dấu, không xóa dòng cũ.
2. **Điều chỉnh nhanh**: Manager từ màn hình Inventory ấn "Điều chỉnh". Hệ thống sinh Draft (`PENDING_APPROVAL`). Một Manager khác hoặc Admin sẽ duyệt (Snapshot version check tránh 409).

---

## 3. Danh sách UI Cần chuẩn bị

- **Giao diện Chung**: Cần có Dropdown chọn Role và Warehouse cho các thao tác mượn quyền/đổi kho.
- **Màn hình Xuất kho (Shipment)**:
  - Giao diện Supervisor: Chọn reserve, assign.
  - Giao diện Picker: List lấy hàng.
  - Giao diện STAGING/Dispatch: Giao diện chốt xuất hàng cuối cùng.
- **Màn hình Chuyển kho (Transfer)**:
  - Tab Chuyển đi và Nhận về. Hai đầu đều có luồng duyệt và pick/receive.
- **Màn hình Quản lý Tồn kho**:
  - Nút "Điều chỉnh (Quick Adjust)". Form popup hiển thị `qtyOnHand`, `qtyReserved`, `qtyAvailable`.
- **Màn hình Bút toán đảo**:
  - Tạo yêu cầu từ bảng Stock Ledger. Danh sách chờ Admin duyệt.

---

## 4. Danh sách chi tiết API, Phân quyền & DTO (Phục hồi 100% Chi tiết & Tác động DB)

*Lưu ý chung: BIGINT → String, Decimal → String. Audit fields (createdBy, updatedBy) lấy từ JWT token. Phân trang mặc định 1/20.*

### 4.1. Xuất kho (Shipment)
**Quyền:** `SHIPMENT.READ/CREATE/UPDATE/ASSIGN/PICK/CANCEL/DISPATCH`, `INVENTORY.RESERVE`

---

**a. Tạo Phiếu Xuất (`POST /api/shipments`)**

* **Tác động DB:**
  * **`shipments`**: Thêm mới 1 dòng (Trạng thái mặc định: `NEW`). Lưu `customerInfo`, `assignedTo`.
  * **`shipment_lines`**: Thêm các dòng cấu thành tương ứng, tính toán và lưu `requestedBaseQty` dựa trên `factorToBase` từ `sku_uom_conversions`.
* **Request (`CreateShipmentDto`)**:
```json
{
  "warehouseId": "1",
  "customerInfo": "Khách hàng A - 0987654321 - 123 Nguyễn Văn Linh",
  "assignedTo": "5",
  "lines": [
    {
      "skuId": "1",
      "uomId": "1",
      "sourceLocationId": "10",
      "requestedQty": "10.0000"
    }
  ]
}
```
*(Ghi chú: `sourceLocationId` là vị trí kệ mà Supervisor dự kiến lấy hàng. Backend tự tính `factorToBase` từ `sku_uom_conversions` và snapshot vào `requestedBaseQty`)*
* **Response**:
```json
{
  "statusCode": 201,
  "data": {
    "id": "1",
    "code": "SHP-001",
    "warehouseId": "1",
    "customerInfo": "Khách hàng A - 0987654321 - 123 Nguyễn Văn Linh",
    "assignedTo": "5",
    "assignedToName": "Nguyễn Văn Picker",
    "status": "NEW",
    "lines": [
      {
        "id": "1",
        "skuId": "1",
        "skuCode": "SKU-001",
        "skuName": "Sữa TH True Milk 1L",
        "uomId": "1",
        "uomName": "Thùng",
        "factorToBase": "12.0000",
        "sourceLocationId": "10",
        "sourceLocationCode": "BIN-A1",
        "requestedQty": "10.0000",
        "requestedBaseQty": "120.0000",
        "reservedBaseQty": "0",
        "pickedQty": "0",
        "pickedBaseQty": "0",
        "shippedBaseQty": "0"
      }
    ],
    "createdAt": "2026-10-07T00:00:00.000Z"
  }
}
```

---

**b. Cập nhật Phiếu Xuất (`PUT /api/shipments/{id}`)**

* **Tác động DB**: Chỉ sửa bảng `shipments` hoặc `shipment_lines` (nếu thêm/xóa dòng). Chỉ cho phép khi `status = NEW`.
* **Request (`UpdateShipmentDto`)**:
```json
{
  "customerInfo": "Khách hàng B - Đổi địa chỉ",
  "assignedTo": "6",
  "lines": [
    {
      "skuId": "1",
      "uomId": "1",
      "sourceLocationId": "10",
      "requestedQty": "15.0000"
    }
  ]
}
```

---

**c. Đổi người Phân công (`POST /api/shipments/{id}/assign`)**

* **Tác động DB**: Update trường `assignedTo` trong bảng `shipments`.
* **Request (`AssignShipmentDto`)**:
```json
{ "assignedTo": "6" }
```

---

**d. Gợi ý FEFO (`GET /api/shipments/{id}/fefo-suggestions`)**

* **Tác động DB**: Không ghi DB. Chỉ Query `inventory` theo `skuId`, `ORDER BY expiry_date ASC`, điều kiện `qty_available > 0`.
* **Response**:
```json
{
  "statusCode": 200,
  "data": [
    {
      "shipmentLineId": "1",
      "skuId": "1",
      "skuCode": "SKU-001",
      "suggestedInventories": [
        {
          "inventoryId": "100",
          "locationId": "10",
          "locationCode": "BIN-A1",
          "lotNo": "LOT-2026-01",
          "serialNo": null,
          "expiryDate": "2026-12-01",
          "qtyOnHand": "50.0000",
          "qtyReserved": "0",
          "qtyAvailable": "50.0000"
        }
      ]
    }
  ]
}
```

---

**e. Khóa Tồn kho - Reserve (`POST /api/shipments/{id}/reserve`)**

* **Tác động DB (Bắt buộc dùng Transaction):**
  * **`shipment_lines`**: Cập nhật `sourceInventoryId`, `sourceLocationId` và `reservedBaseQty`.
  * **`inventory` (Gốc)**: Tăng cột `qty_reserved` lên tương ứng lượng khóa. Validate `qty_reserved <= qty_on_hand` để không văng lỗi DB Constraint.
* **Request (`ReserveShipmentDto`)**: 
```json
{
  "lines": [
    {
      "shipmentLineId": "1",
      "sourceInventoryId": "100",
      "sourceLocationId": "10",
      "reservedQty": "10.0000",
      "reservedBaseQty": "120.0000"
    }
  ]
}
```

---

**f. Pick sang STAGING (`POST /api/shipments/{id}/pick`)**

* **Tác động DB (Bắt buộc dùng Transaction):**
  * **`shipments`**: Đổi status -> `PICKING` hoặc `PICKED`.
  * **`shipment_lines`**: Ghi nhận `pickedQty`, `pickedBaseQty` và `stagingLocationId`.
  * **`inventory` (Gốc)**: Trừ `qty_on_hand` và `qty_reserved`.
  * **`inventory` (STAGING)**: Tăng `qty_on_hand` tại `stagingLocationId`.
  * **`stock_ledger`**: Ghi nhận 1 dòng luân chuyển (Từ Kệ gốc sang STAGING) hoặc 2 dòng (OUT gốc, IN staging).
* **Request (`PickShipmentDto`)**:
```json
{
  "lines": [
    {
      "shipmentLineId": "1",
      "pickedQty": "8.0000",
      "pickedBaseQty": "96.0000",
      "stagingLocationId": "99"
    }
  ]
}
```

---

**g. Xuất hàng - Dispatch (`POST /api/shipments/{id}/dispatch`)**

* **Tác động DB (Bắt buộc dùng Transaction):**
  * **`shipment_dispatch_lines`**: Insert dòng ghi nhận lịch sử với `requestId` để chặn dội lệnh. Ghi ID người thực hiện vào `shippedBy`.
  * **`shipment_lines`**: Cộng dồn lượng đã xuất vào `shippedBaseQty`.
  * **`shipments`**: Nếu tổng `shippedBaseQty` < `requestedBaseQty` -> Cập nhật `status = PARTIALLY_SHIPPED`. Nếu đủ -> `SHIPPED`.
  * **`inventory` (STAGING)**: Trừ vĩnh viễn `qty_on_hand` tại khu vực STAGING.
  * **`stock_ledger`**: Thêm 1 dòng `SHIPMENT` ghi nhận hàng đi khỏi kho.
* **Request (`DispatchShipmentDto`)**:
```json
{
  "dispatchCode": "DSP-001",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "lines": [
    {
      "shipmentLineId": "1",
      "stagingInventoryId": "200",
      "shippedBaseQty": "96.0000"
    }
  ]
}
```
* **Response**:
```json
{
  "statusCode": 200,
  "data": {
    "shipmentId": "1",
    "status": "PARTIALLY_SHIPPED",
    "dispatchedLines": [
      {
        "shipmentLineId": "1",
        "shippedBaseQty": "96.0000",
        "remainingBaseQty": "24.0000",
        "stockLedgerId": "500"
      }
    ]
  }
}
```

---

**h. Xem lịch sử Dispatch (`GET /api/shipments/{id}/dispatch-lines`)**

* **Response**:
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "1",
      "shipmentLineId": "1",
      "dispatchCode": "DSP-001",
      "requestId": "550e8400-e29b-41d4-a716-446655440000",
      "stagingInventoryId": "200",
      "shippedBaseQty": "96.0000",
      "stockLedgerId": "500",
      "shippedBy": "5",
      "shipperName": "Nguyễn Văn Picker",
      "shippedAt": "2026-10-07T08:30:00.000Z"
    }
  ]
}
```

---

### 4.2. Chuyển kho (Transfer)
**Quyền:** `TRANSFER.READ/CREATE/UPDATE/SUBMIT/ASSIGN/APPROVE/REJECT/RESERVE/PICK/DISPATCH/RECEIVE/CANCEL`

---

**a. Tạo Draft (Kho Nguồn: `POST /api/transfers`)**

* **Tác động DB:**
  * **`transfers`**: Insert 1 dòng (Trạng thái `DRAFT`). Lưu `sourceWarehouseId`, `destinationWarehouseId`, `pickerId`, `reason`.
  * **`transfer_lines`**: Insert chi tiết sản phẩm và `requestedBaseQty`.
* **Request (`CreateTransferDto`)**:
```json
{
  "sourceWarehouseId": "1",
  "destinationWarehouseId": "2",
  "pickerId": "8",
  "reason": "Điều chuyển nội bộ do tràn kho",
  "lines": [
    {
      "skuId": "1",
      "uomId": "1",
      "factorToBase": "12.0000",
      "sourceLocationId": "10",
      "sourceInventoryId": "100",
      "lotNo": "LOT-2026-01",
      "requestedBaseQty": "120.0000"
    }
  ]
}
```
* **Response**:
```json
{
  "statusCode": 201,
  "data": {
    "id": "1",
    "code": "TRF-001",
    "sourceWarehouseId": "1",
    "destinationWarehouseId": "2",
    "pickerId": "8",
    "status": "DRAFT",
    "lines": [
      {
        "id": "1",
        "skuId": "1",
        "uomId": "1",
        "factorToBase": "12.0000",
        "sourceLocationId": "10",
        "sourceInventoryId": "100",
        "lotNo": "LOT-2026-01",
        "requestedBaseQty": "120.0000",
        "approvedBaseQty": "0",
        "sentBaseQty": "0",
        "receivedBaseQty": "0"
      }
    ],
    "createdAt": "2026-10-07T00:00:00.000Z"
  }
}
```

---

**b. Cập nhật Draft (`PUT /api/transfers/{id}`)**

* **Tác động DB**: Update `transfers` hoặc `transfer_lines`. Chỉ áp dụng khi status `DRAFT` hoặc `PENDING`.
* **Request (`UpdateTransferDto`)**:
```json
{
  "pickerId": "9",
  "reason": "Cập nhật lý do chuyển",
  "lines": [
    {
      "skuId": "1",
      "uomId": "1",
      "factorToBase": "12.0000",
      "requestedBaseQty": "60.0000"
    }
  ]
}
```

---

**c. Gửi duyệt (`POST /api/transfers/{id}/submit`)**

* **Tác động DB**: Cập nhật status `DRAFT` -> `PENDING_APPROVAL`. (Body rỗng).

---

**d. Duyệt Phiếu (Kho Đích: `POST /api/transfers/{id}/approve`)**

* **Tác động DB**:
  * **`transfers`**: Cập nhật `status = APPROVED`. Ghi người duyệt (`destinationApprovedBy`), thời gian duyệt (`destinationApprovedAt`), và chỉ định nhân viên nhận hàng (`receiverId`).
* **Request (`ApproveTransferDto`)**:
```json
{ "receiverId": "6" }
```

---

**e. Từ chối (`POST /api/transfers/{id}/reject`)**

* **Tác động DB**: Cập nhật status `REJECTED`, lưu lý do từ chối mà không đè lên `reason` gốc.
* **Request (`RejectTransferDto`)**:
```json
{ "reviewNote": "Kho đích hiện không đủ diện tích chứa" }
```

---

**f. Gửi đi - Dispatch (`POST /api/transfers/{id}/dispatch`)**

* **Tác động DB (Bắt buộc dùng Transaction):**
  * **`transfers`**: Chuyển status sang `IN_TRANSIT`. Ghi `dispatchedBy`, `dispatchedAt`.
  * **`transfer_lines`**: Ghi số lượng đã gửi thực tế vào `sentBaseQty`.
  * **`inventory` (Kho nguồn)**: Trừ lượng tồn kho ở kệ kho đi.
  * **`inventory` (Transit)**: Cộng lượng hàng vào kho ảo `transitLocationId`.
  * **`stock_ledger`**: Ghi 1 dòng loại `TRANSFER_OUT` ở kho nguồn.
* **Request (`DispatchTransferDto`)**:
```json
{
  "transitLocationId": "200",
  "lines": [
    {
      "transferLineId": "1",
      "sentBaseQty": "120.0000"
    }
  ]
}
```

---

**g. Nhận hàng (Kho Đích: `POST /api/transfers/{id}/receive`)**

* **Tác động DB (Bắt buộc dùng Transaction):**
  * **`transfer_lines`**: Ghi `receivedBaseQty`, bến nhận `receivingLocationId`, và kệ cất cuối `targetLocationId`.
  * **`transfers`**: Đổi status `COMPLETED` (nếu nhận đủ) hoặc `DISCREPANCY` (nếu thiếu). Ghi `receivedBy`, `receivedAt`.
  * **`inventory` (Transit)**: Trừ tồn kho tại kho ảo transit.
  * **`inventory` (Kho đích)**: Cộng tồn kho vào kệ thực tế `targetLocationId`.
  * **`stock_ledger`**: Sinh 1 dòng loại `TRANSFER_IN` ở kho đích.
* **Request (`ReceiveTransferDto`)**:
```json
{
  "lines": [
    {
      "transferLineId": "1",
      "receivingLocationId": "55",
      "targetLocationId": "60",
      "receivedBaseQty": "100.0000"
    }
  ]
}
```

---

### 4.3. Bút toán đảo (Reversal Request)

---

**a. Tạo Yêu cầu (`POST /api/reversals/requests`)**

* **Tác động DB**:
  * **`ledger_reversal_requests`**: Tạo 1 dòng `status = PENDING`. Lưu ID của dòng sổ cái bị sai vào `originalLedgerId`. Lưu ID người xin đảo vào `requestedBy`.
* **Request (`CreateReversalRequestDto`)**:
```json
{
  "originalLedgerId": "999",
  "reason": "Điều chỉnh nhầm số lượng kiểm kê, biên bản BB-01"
}
```
* **Response**:
```json
{
  "statusCode": 201,
  "data": {
    "id": "1",
    "originalLedgerId": "999",
    "reason": "Điều chỉnh nhầm số lượng kiểm kê, biên bản BB-01",
    "requestedBy": "3",
    "status": "PENDING",
    "createdAt": "2026-10-07T00:00:00.000Z"
  }
}
```

---

**b. Cập nhật Yêu cầu (`PUT /api/reversals/requests/{id}`)**

* **Tác động DB**: Chỉ cho phép update `reason` khi `status = PENDING` và thực hiện bởi chính `requestedBy`.
* **Request (`UpdateReversalRequestDto`)**:
```json
{ "reason": "Bổ sung thêm biên bản giám đốc ký duyệt BB-02" }
```

---

**c. Admin Duyệt (`POST /api/reversals/requests/{id}/approve`)**

* **Tác động DB (Bắt buộc dùng Transaction):**
  * **`ledger_reversal_requests`**: Đổi status `APPROVED`, ghi `reviewedBy`, `reviewNote`.
  * **`stock_ledger`**: Insert dòng mới (loại `REVERSAL`), `qtyChange` ngược dấu với dòng gốc, `reversalOfId` trỏ về dòng gốc. Không được xóa/sửa dòng gốc.
  * **`inventory`**: Dựa theo `qtyChange` ngược dấu, cộng hoặc trừ để trả lại tồn kho ban đầu.
* **Request (`ApproveReversalRequestDto`)**:
```json
{ "reviewNote": "Đã đối soát biên bản hợp lệ, duyệt đảo." }
```
* **Response**:
```json
{
  "statusCode": 200,
  "data": {
    "id": "1",
    "status": "APPROVED",
    "reversalLedgerId": "1000"
  }
}
```

---

**d. Admin Từ chối (`POST /api/reversals/requests/{id}/reject`)**

* **Tác động DB**: Chuyển status `REJECTED`, lưu `reviewNote`. (Không đảo tồn kho).
* **Request (`RejectReversalRequestDto`)**:
```json
{ "reviewNote": "Chưa đính kèm biên bản đền bù." }
```

---

### 4.4. Điều chỉnh Tồn kho (Quick Adjustment)

---

**a. Tạo Draft từ UI Tồn kho (`POST /api/adjustments`)**

* **Tác động DB**:
  * **`adjustments`**: Tạo 1 phiếu trạng thái `DRAFT`, lưu `proposedBy`.
  * **`adjustment_lines`**: Ghi `systemQty`, `actualQty` và `qtyChange`.
* **Request (`CreateAdjustmentDto`)**:
```json
{
  "warehouseId": "1",
  "reason": "Kiểm kê đột xuất phát hiện kho bị chuột cắn",
  "lines": [
    {
      "inventoryId": "100",
      "locationId": "10",
      "skuId": "1",
      "uomId": "1",
      "lotNo": "LOT-2026-01",
      "systemQty": "50.0000",
      "actualQty": "48.0000",
      "inventoryVersion": 2
    }
  ]
}
```
*(Lưu ý: `inventoryVersion` dùng để bắt Snapshot 409)*
* **Response**:
```json
{
  "statusCode": 201,
  "data": {
    "id": "1",
    "code": "ADJ-001",
    "status": "DRAFT",
    "proposedBy": "3",
    "lines": [
      {
        "id": "1",
        "inventoryId": "100",
        "locationId": "10",
        "skuId": "1",
        "uomId": "1",
        "systemQty": "50.0000",
        "actualQty": "48.0000",
        "qtyChange": "-2.0000",
        "inventoryVersion": 2
      }
    ]
  }
}
```

---

**b. Gửi duyệt (`POST /api/adjustments/{id}/submit`)**

* **Tác động DB**: Đổi status `DRAFT` -> `PENDING_APPROVAL`.

---

**c. Duyệt (`POST /api/adjustments/{id}/approve`)**

* **Tác động DB (Bắt buộc dùng Transaction):**
  * **`adjustments`**: Đổi status `APPROVED`, lưu `approvedBy` (phải khác `proposedBy`).
  * **`inventory`**: Update `qty_on_hand` theo `qtyChange`. Tăng `version + 1`. Nếu sai version lúc duyệt -> 409 Conflict.
  * **`stock_ledger`**: Ghi 1 dòng loại `ADJUST_IN` hoặc `ADJUST_OUT`.

---

**d. Từ chối (`POST /api/adjustments/{id}/reject`)**

* **Request (`RejectAdjustmentDto`)**:
```json
{ "rejectionReason": "Lệch số lượng quá lớn so với định mức." }
```

---

**a. Tạo Phiếu Xuất (`POST /api/shipments`)**

* **Tác động DB:**
  * **`shipments`**: Thêm mới 1 dòng (Trạng thái mặc định: `NEW`). Lưu `customerInfo`, `assignedTo`.
  * **`shipment_lines`**: Thêm các dòng cấu thành tương ứng, tính toán và lưu `requestedBaseQty` dựa trên `factorToBase` từ `sku_uom_conversions`.
* **Request (`CreateShipmentDto`)**:
```json
{
  "warehouseId": "1",
  "customerInfo": "Khách hàng A - 0987654321 - 123 Nguyễn Văn Linh",
  "assignedTo": "5",
  "lines": [
    {
      "skuId": "1",
      "uomId": "1",
      "sourceLocationId": "10",
      "requestedQty": "10.0000"
    }
  ]
}
```

---

**b. Cập nhật Phiếu Xuất (`PUT /api/shipments/{id}`)**

* **Tác động DB**: Sửa thông tin `shipments` hoặc thêm/bớt `shipment_lines` (Chỉ cho phép khi `status = NEW`).

---

**c. Đổi người Phân công (`POST /api/shipments/{id}/assign`)**

* **Tác động DB**: Sửa cột `assignedTo` trong `shipments`.

---

**d. Gợi ý FEFO (`GET /api/shipments/{id}/fefo-suggestions`)**

* **Tác động DB**: Không ghi DB. SELECT từ bảng `inventory` lọc theo `skuId` của phiếu, `ORDER BY expiry_date ASC`, điều kiện `qty_available > 0`.

---

**e. Khóa Tồn kho - Reserve (`POST /api/shipments/{id}/reserve`)**

* **Tác động DB (Bắt buộc dùng Transaction):**
  * **`shipment_lines`**: Cập nhật `sourceInventoryId`, `sourceLocationId` và `reservedBaseQty`.
  * **`inventory` (Gốc)**: Tăng cột `qty_reserved` lên tương ứng với lượng hàng được khóa. (Cần check điều kiện `qty_reserved <= qty_on_hand` để không bị DB văng lỗi Check Constraint).
* **Request (`ReserveShipmentDto`)**: 
```json
{
  "lines": [
    {
      "shipmentLineId": "1",
      "sourceInventoryId": "100",
      "sourceLocationId": "10",
      "reservedQty": "10.0000",
      "reservedBaseQty": "120.0000"
    }
  ]
}
```

---

**f. Pick sang STAGING (`POST /api/shipments/{id}/pick`)**

* **Tác động DB (Bắt buộc dùng Transaction):**
  * **`shipments`**: Cập nhật trạng thái thành `PICKING` hoặc `PICKED`.
  * **`shipment_lines`**: Ghi nhận `pickedQty`, `pickedBaseQty` và lưu `stagingLocationId`.
  * **`inventory` (Gốc)**: Giảm `qty_on_hand` và giảm `qty_reserved` vì hàng đã được bốc khỏi kệ.
  * **`inventory` (STAGING)**: Tăng `qty_on_hand` tại `stagingLocationId` (Nơi đặt hàng tạm chuẩn bị xuất).
  * **`stock_ledger`**: Ghi nhận 1 dòng luân chuyển (Từ Kệ gốc sang STAGING).
* **Request (`PickShipmentDto`)**:
```json
{
  "lines": [
    {
      "shipmentLineId": "1",
      "pickedQty": "8.0000",
      "pickedBaseQty": "96.0000",
      "stagingLocationId": "99"
    }
  ]
}
```

---

**g. Xuất hàng - Dispatch (`POST /api/shipments/{id}/dispatch`)**

* **Tác động DB (Bắt buộc dùng Transaction):**
  * **`shipment_dispatch_lines`**: Insert 1 dòng ghi nhận phiên dispatch này (Dùng `requestId` để chặn Spam click / Idempotency). Lưu ID người thao tác vào `shippedBy`.
  * **`shipment_lines`**: Cộng dồn số lượng vào `shippedBaseQty`.
  * **`shipments`**: Nếu tổng số `shippedBaseQty` nhỏ hơn `requestedBaseQty` -> Cập nhật `status = PARTIALLY_SHIPPED`. Nếu bằng -> `SHIPPED`.
  * **`inventory` (STAGING)**: Trừ vĩnh viễn `qty_on_hand` tại khu STAGING.
  * **`stock_ledger`**: Thêm mới 1 dòng ghi vết lịch sử giao dịch (loại `SHIPMENT`), nối `stock_ledger_id` vào bảng dispatch.
* **Request (`DispatchShipmentDto`)**:
```json
{
  "dispatchCode": "DSP-001",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "lines": [
    {
      "shipmentLineId": "1",
      "stagingInventoryId": "200",
      "shippedBaseQty": "96.0000"
    }
  ]
}
```

---

**h. Xem lịch sử Dispatch (`GET /api/shipments/{id}/dispatch-lines`)**

* Trả về danh sách `shipment_dispatch_lines` kèm thông tin `shipper`.

---

## 5. Lưu ý kỹ thuật sống còn cho Backend

1. **Transaction & Snapshot (409)**: `inventoryVersion` phải được validate. Nếu có người khác đổi tồn kho trong lúc đang thao tác -> Trả 409 Conflict.
2. **Bút toán đảo an toàn**: Chỉ cho phép đảo chứng từ 1 vế. Nếu đã có movement tiếp theo đè lên dòng tồn kho đó -> Chặn không cho đảo. Không được xóa/sửa dòng ledger cũ. Không được âm tồn kho/dưới mức reserved sau khi đảo.
3. **Quyền & Scope (403)**: Picker/Receiver chỉ thao tác được phiếu đã assign cho mình. Manager thao tác phải thuộc đúng Warehouse. (Trừ Admin). Không trả về Password Hash trong mọi res.

## 6. Phân công Nhiệm vụ DEMO 2

| Thành viên         | Trách nhiệm cốt lõi                                                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Nam Nguyen** | Luồng Shipment: Reserve / Pick sang STAGING / Dispatch / Giao bù. Lưu History/Status. Xử lý logic Pick 2 vế.                      |
| **Thuan Le**   | Luồng Transfer: SOURCE/DESTINATION/BOTH, Gửi đi, Nhận về, trạng thái TRANSIT. Tích hợp chặn ngoại lệ trước khi gửi.      |
| **Trung Pham** | Bút toán đảo (Reversal): API Request List/Detail/Reject/Cancel/Approve. Chặn route bypass. Giới hạn chỉ đảo chứng từ 1 vế. |
| **Vy Tran**    | UI/UX                                                                                                                                   |
