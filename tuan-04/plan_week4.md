# Kế hoạch chi tiết Tuần 4 - Chặng cuối: Xuất kho, Chuyển kho & Bút toán đảo

Đây là **tuần nặng nhất** trong toàn bộ quá trình xây dựng hệ thống. Đòi hỏi huy động tối đa nhân lực của team vì chúng ta sẽ giải quyết bài toán phức tạp của WMS: Soạn hàng xuất kho thủ công (Pick), Xử lý ngoại lệ (thiếu hàng), Quy trình chuyển kho (Transfer) giữa 2 Manager, và Bút toán đảo có phê duyệt.

---

## 1. Mục tiêu và Định hướng Tuần 4

- **Trọng tâm 1:** Xây dựng luồng Xuất kho (Outbound). Việc soạn hàng để khoá (reserve) hàng sẽ làm **thủ công**. Picker sẽ lấy hàng và điền số lượng thực tế. Nếu thiếu hàng, phiếu rơi vào trạng thái "Đã xuất nhưng còn thiếu".
- **Trọng tâm 2:** Quản lý quy trình Chuyển kho liên trạm (Transit). Phối hợp tạo và duyệt giữa Quản lý Kho nguồn và Quản lý Kho đích.
- **Trọng tâm 3:** Lập phiếu yêu cầu Bút toán đảo (Reversal Request) và Admin duyệt.

---

## 2. Kịch bản Nghiệp vụ Chi tiết (Dùng cho DEMO 2)

**Kịch bản 1: Xuất kho thủ công & Xử lý Thiếu hàng (Bắt buộc cho DEMO 2)**

*(Mỗi team sẽ setup data và demo luồng này với một đơn hàng 5 dòng, thiếu 1 dòng)*

1. **SUPERVISOR**: Lập một Phiếu xuất kho (`Shipment`) gồm **5 dòng hàng** khác nhau và phân công cho `PICKER`. Việc chọn lô hàng/tồn kho (`sourceInventoryId`) để xuất sẽ được thực hiện thủ công.
2. **PICKER**: Đi nhặt hàng. Nhặt thành công và điền đủ số lượng thực tế cho 4 dòng đầu.
3. **PICKER (Gặp lỗi thiếu hàng)**: Đến dòng thứ 5, số lượng yêu cầu là 10, nhưng thực tế trên kệ chỉ lấy được 8 cái. Picker điền số lượng thực tế là 8.
4. **Hệ thống/Đóng gói (Dispatch)**: Sau khi qua khâu đóng gói & cân thực tế, tiến hành xác nhận Xuất kho (Dispatch). Phiếu xuất kho chuyển sang trạng thái **PARTIAL_SHIPPED** (Đã xuất mà còn thiếu). Số lượng xuất thực tế và phần còn thiếu được hệ thống đối soát, dòng dữ liệu xuất được ghi vào bảng `shipment_dispatch_lines`.

**Kịch bản 2: Chuyển kho liên trạm (Transfer)**

1. **WH_MANAGER (Kho A - Nguồn)**: Lập phiếu Chuyển kho (`Transfer`). Khai báo hàng hoá cần chuyển và cung cấp thông tin nhân viên phụ trách xuất ở kho mình.
2. **WH_MANAGER (Kho B - Đích)**: Đăng nhập, xem thông tin phiếu Transfer và bấm **Duyệt (Approve)**. Khi duyệt, Manager B điền tiếp thông tin nhân viên nhận hàng (`receiverId`) của kho mình.
3. **PICKER/RECEIVER (Kho B)**: Khi hàng tới, nhân viên nhận hàng của Kho B sẽ thực hiện nhập hàng và **tự điền thông tin vị trí lưu trữ** (`targetLocationId`) để cất hàng lên kệ.

**Kịch bản 3: Yêu cầu & Phê duyệt Bút toán đảo (Reversal)**

1. **MANAGER**: Tại giao diện Lịch sử thay đổi tồn kho (`Stock Ledger`), Manager phát hiện 1 dòng giao dịch sai. Manager nhấn chọn dòng đó và bấm **Tạo phiếu Bút toán đảo** (`LedgerReversalRequest`). Manager điền lý do (`reason`) và tải lên minh chứng.
2. **ADMIN**: Đăng nhập, vào danh sách Yêu cầu Bút toán đảo. Xem xét lý do, minh chứng và bấm **Duyệt (Approve)**.
3. **Hệ thống**: Tự động sinh ra một record `stock_ledger` mới với loại `REVERSAL` để triệt tiêu số lượng của giao dịch gốc, đồng thời gắn `reversalLedgerId` vào phiếu yêu cầu.

---

## 3. Danh sách UI Cần chuẩn bị

- **Màn hình Xuất kho (Shipment)**:
  - Giao diện Supervisor: Tạo phiếu xuất, chỉ định thủ công tồn kho cần lấy.
  - Giao diện Picker: List công việc nhặt hàng, ô điền số lượng thực tế lấy được. Cảnh báo thiếu hàng.
  - Giao diện Dispatch: Màn hình quét mã đóng gói, cân thực tế và xác nhận Dispatch.
- **Màn hình Chuyển kho (Transfer)**:
  - Hai tab: Chuyển đi (Outbound) và Nhận về (Inbound). Cần UI để Manager Đích duyệt và điền người nhận, Picker Đích điền Location cất hàng.
- **Màn hình Bút toán đảo**:
  - Tại bảng `Stock Ledger`: Nút "Tạo yêu cầu đảo".
  - Bảng "Yêu cầu Bút toán đảo": Dành cho Admin xem lý do, minh chứng và nút "Duyệt".

---

## 4. Danh sách chi tiết API & DTO đề xuất

Dưới đây là chi tiết các Request / Response (định dạng JSON) đối chiếu sát với Schema hiện tại:

### 4.1. Phân hệ Xuất kho (Shipment) & Thiếu hàng

**a. Tạo phiếu xuất và chỉ định thủ công**
* **Endpoint:** `POST /api/shipments`
* **Request (`CreateShipmentDto`):**
```json
{
  "warehouseId": "1",
  "assignedTo": "3",
  "lines": [
    {
      "skuId": "1",
      "uomId": "1",
      "sourceLocationId": "10",
      "sourceInventoryId": "100",
      "requestedQty": 10
    }
  ]
}
```
* **Response:**
```json
{
  "statusCode": 201,
  "message": "Shipment created",
  "data": {
    "id": "1",
    "code": "SHP-2026-001",
    "status": "NEW"
  }
}
```

**b. Pick hàng thực tế**
* **Endpoint:** `POST /api/shipments/{id}/pick`
* **Request (`PickShipmentDto`):**
```json
{
  "lines": [
    {
      "shipmentLineId": "1",
      "pickedQty": 8
    }
  ]
}
```
* **Response:**
```json
{
  "statusCode": 200,
  "message": "Picked successfully",
  "data": null
}
```

**c. Xuất hàng / Đóng gói (Dispatch)**
* **Endpoint:** `POST /api/shipments/{id}/dispatch`
* **Request (`DispatchShipmentDto`):**
```json
{
  "lines": [
    {
      "shipmentLineId": "1",
      "stagingInventoryId": "100",
      "shippedBaseQty": 8
    }
  ]
}
```
* **Tác động DB (Transaction):**
  * Lưu vào bảng `shipment_dispatch_lines`.
  * Trừ `inventory` ở kho. Ghi `stock_ledger`.
  * Nếu tổng `shippedBaseQty` (8) < `requestedQty` (10), đổi trạng thái `Shipment` thành `PARTIAL_SHIPPED`.
* **Response:**
```json
{
  "statusCode": 200,
  "message": "Dispatched successfully",
  "data": {
    "status": "PARTIAL_SHIPPED"
  }
}
```

### 4.2. Phân hệ Chuyển kho (Transfer)

**a. Tạo phiếu (Kho Nguồn)**
* **Endpoint:** `POST /api/transfers`
* **Request (`CreateTransferDto`):**
```json
{
  "sourceWarehouseId": "1",
  "destinationWarehouseId": "2",
  "pickerId": "3",
  "lines": [
    {
      "skuId": "1",
      "uomId": "1",
      "sourceLocationId": "10",
      "sourceInventoryId": "100",
      "factorToBase": 1
    }
  ]
}
```
* **Response:**
```json
{
  "statusCode": 201,
  "message": "Transfer created",
  "data": { "id": "1", "code": "TRF-001", "status": "PENDING" }
}
```

**b. Duyệt phiếu (Kho Đích)**
* **Endpoint:** `POST /api/transfers/{id}/approve`
* **Request (`ApproveTransferDto`):**
```json
{
  "receiverId": "4"
}
```
* **Tác động DB:** Cập nhật `destinationApprovedBy` = Admin/Manager, `receiverId` = 4 và chuyển trạng thái `APPROVED`.
* **Response:**
```json
{
  "statusCode": 200,
  "message": "Transfer approved by destination"
}
```

**c. Nhận hàng tại Kho Đích**
* **Endpoint:** `POST /api/transfers/{id}/receive`
* **Request (`ReceiveTransferDto`):**
```json
{
  "lines": [
    {
      "transferLineId": "1",
      "targetLocationId": "50"
    }
  ]
}
```
* **Response:**
```json
{
  "statusCode": 200,
  "message": "Received at destination successfully"
}
```

### 4.3. Phân hệ Yêu cầu Bút toán đảo (Reversal Request)

**a. Tạo Yêu cầu (Manager)**
* **Endpoint:** `POST /api/reversals/requests`
* **Request (`CreateReversalRequestDto`):**
```json
{
  "originalLedgerId": "999",
  "reason": "Điều chỉnh nhầm số lượng kiểm kê, đính kèm biên bản BB-01"
}
```
* **Tác động DB:** Tạo dòng `ledger_reversal_requests` trạng thái `PENDING`.
* **Response:**
```json
{
  "statusCode": 201,
  "message": "Reversal request created",
  "data": { "id": "1" }
}
```

**b. Duyệt Yêu cầu (Admin)**
* **Endpoint:** `POST /api/reversals/requests/{id}/approve`
* **Request (`ApproveReversalRequestDto`):**
```json
{
  "reviewNote": "Đã xem xét biên bản thực tế, đồng ý đảo giao dịch."
}
```
* **Tác động DB (Transaction):**
  * Tạo dòng `stock_ledger` mới với loại `REVERSAL`. Cập nhật lại `inventory`.
  * Cập nhật `reversalLedgerId`, `reviewedBy` và `reviewNote` vào `ledger_reversal_requests`.
* **Response:**
```json
{
  "statusCode": 200,
  "message": "Reversal approved and stock updated"
}
```

---

## 5. Lưu ý kỹ thuật sống còn cho Backend

1. **Shipment Dispatch:** Dữ liệu số lượng còn thiếu sẽ không nằm ở một cột "thiếu" mà được tính toán bằng cách đối chiếu `shippedBaseQty` trong `shipment_dispatch_lines` với `requestedQty` của `shipment_lines`.
2. **Transfer Flow:** Phải rào kỹ quyền truy cập API. Chỉ Manager Kho Nguồn mới được tạo, chỉ Manager Kho Đích mới được duyệt `approve`.
3. **Reversal Flow:** Kiểm tra chặt chẽ `originalLedgerId` đã bị đảo trước đó chưa (bảng `ledger_reversal_requests` có Unique Index). Chỉ Admin mới được phép gọi API `approve`.

---

## 6. Phân công nhiệm vụ (Gợi ý)

| Thành viên | Trách nhiệm | Phân hệ phụ trách |
| :--- | :--- | :--- |
| **Vy Tran** | **Frontend (UI/UX)** | Build toàn bộ màn hình Xuất kho (có nhập số cân, thiếu hàng), màn hình Transit 2 cấp duyệt, và giao diện Phê duyệt Bút toán đảo. |
| **Nam Nguyen** | **Backend (API)** | Module Xuất kho (Shipment). Viết luồng Pick thủ công, Dispatch lưu vào `shipment_dispatch_lines`, xử lý trạng thái `PARTIAL_SHIPPED`. |
| **Thuan Le** | **Backend (API)** | Module Chuyển kho (Transfer). Xử lý việc link giữa Kho Nguồn tạo và Kho Đích duyệt (điền receiverId, targetLocationId). |
| **Trung Pham** | **Backend (API)** | Module Bút toán đảo (Reversal). Lưu vào `ledger_reversal_requests` chờ duyệt và xử lý Transaction sinh `stock_ledger` mới. |
