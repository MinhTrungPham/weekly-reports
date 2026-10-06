# Kế hoạch chi tiết Tuần 3 - Vận hành Luồng nghiệp vụ Kho (Operations) & Chuẩn bị Demo

Dựa trên nền tảng (Master Data, Phân quyền, Database) đã xây dựng thành công ở Tuần 2, trọng tâm của Tuần 3 sẽ là đưa hệ thống vào vận hành các nghiệp vụ thực tế, tập trung vào tính chính xác của dữ liệu tồn kho.

---

## 1. Mục tiêu và Định hướng Tuần 3

- **Tính linh hoạt:** Tuần này không ép buộc phải hoàn thành toàn bộ khối lượng nghiệp vụ. Team **tự do chọn thứ tự ưu tiên** triển khai các tính năng (tùy vào tốc độ của team):
  - Nhập hàng (Inbound / Receipt)
  - Cất hàng (Putaway)
  - Điều chỉnh tồn kho có phê duyệt (Inventory Adjustment)
  - Kiểm kê (Cycle Count)
  - Sinh và quản lý mã QR (QR Code)
- **Chất lượng hơn Số lượng:** Ưu tiên luồng **Nhập hàng & Cất hàng** để hoàn thành mục tiêu Demo 1. Đảm bảo logic kế toán kho (Stock Ledger) hoạt động không sai sót.

---

## 2. Kịch bản Nghiệp vụ Chi tiết (Dùng cho DEMO 1)

Mỗi cá nhân / nhóm nhỏ trong team sẽ demo luồng nghiệp vụ tương tác thực tế giữa các Role.

**Kịch bản 1: Nhập hàng (Inbound / Putaway) - *Bắt buộc***

1. **SUPERVISOR**: Đăng nhập, tiến hành tạo Phiếu nhập hàng (Receipt) với thông tin thực tế (Kho, nhà cung cấp, SKU, số lượng) và **phân công (assign)** cho một `RECEIVER` cụ thể.
2. **RECEIVER**: Đăng nhập, xem danh sách phiếu nhập được giao. Xác nhận nhận hàng và tiến hành **lưu trữ hàng (cất hàng/putaway)** vào một Location (Bin) cụ thể trong kho.
3. **Nghiệm thu**: Tồn kho (`inventory`) của SKU tại Location đó tăng chính xác. Sổ cái (`stock_ledger`) lưu vết giao dịch.

**Kịch bản 2: Kiểm kê & Điều chỉnh (Cycle Count & Adjustment) - *Tự chọn***

1. **SUPERVISOR**: Tạo Phiếu/Đợt kiểm kê hàng (chỉ định đếm kho nào, Location nào, hoặc SKU nào) và **giao cho** một `INSPECTOR`.
2. **INSPECTOR**: Nhận việc, xuống kho kiểm tra số lượng thực tế.
3. **INSPECTOR**: Nếu số thực tế lệch so với hệ thống -> Tiến hành tạo **Phiếu đề xuất điều chỉnh tồn kho (Adjustment Proposal)**.
4. **WH_MANAGER (Admin kho)**: Xem phiếu đề xuất, kiểm tra nguyên nhân và bấm **Duyệt (Approve)** hoặc **Từ chối (Reject)**.
5. **Nghiệm thu**: Nếu duyệt, hệ thống tự động gọi `InventoryLedgerService` để điều chỉnh (+/-) tồn kho thực tế và ghi vết Sổ cái.

---

## 3. Danh sách UI

- **Màn hình Nhập hàng**:
  - Giao diện Supervisor: Tạo phiếu nhập, phân công người nhận.
  - Giao diện Receiver: Nhận việc, điền số lượng nhận, chọn Location cất hàng. **Bắt buộc nhập Lô (Lot No) và Ngày hết hạn (Expiry Date)** nếu sản phẩm yêu cầu quản lý lô.
- **Màn hình Kiểm kê & Điều chỉnh:**
  - **Giao diện Supervisor: Khởi tạo đợt kiểm kê, giao việc.**
  - **Giao diện Inspector: Màn hình nhập số lượng đếm, nút "Tạo đề xuất điều chỉnh".**
  - **Giao diện Manager: Xem danh sách đề xuất, nút Duyệt / Từ chối.**
- **Màn hình Tồn kho & Sổ cái: View số lượng (Inventory) và Sổ cái (Stock Ledger) để đối soát.**
- **Màn hình Quản lý Nhà cung cấp:**
  - **Giao diện Admin/Manager: Thêm, sửa, xóa, tìm kiếm Nhà cung cấp (Suppliers).**
  - **Giao diện chi tiết: Danh sách các Sku của nhà cung cấp.**
- **Giao diện Hiển thị & In mã QR (Dành cho Hàng hóa)**:
  - Tại Màn hình Chi tiết SKU hoặc Nhận hàng, cạnh mỗi dòng đơn vị tính (trừ `base_uom`), ví dụ như Hộp, Thùng, bố trí một nút icon 🖨️ hoặc 👁️ (View QR).
  - **Thiết kế dạng Popup/Modal**: Khi bấm vào icon, một Modal (Popup) sẽ hiện lên chứa hình ảnh QR to rõ nét kèm thông tin vắn tắt (Tên SKU, UOM, và Số lượng quy đổi ra base UOM).
  - Dưới ảnh QR là nút "In tem nhãn" để nhân viên kho có thể in và dán lên thùng/hộp sản phẩm.

---

## 4. Danh sách chi tiết API & DTO đề xuất (Cho các luồng tự chọn)

Dựa trên thứ tự tự chọn, dưới đây là thiết kế API cho các Module kèm theo **chi tiết tác động CSDL (DB Tables)** và **định dạng Request/Response**:

### 4.1. Phân hệ Nhập hàng & Cất hàng (Inbound / Putaway)

**a. Tạo Phiếu nhập hàng (Create Receipt)**

* **Endpoint:** `POST /api/receipts`
* **Tác động DB:**
  * Thêm 1 dòng mới vào bảng `receipts` (Trạng thái mặc định: `NEW` hoặc `ASSIGNED`).
  * Thêm nhiều dòng vào bảng `receipt_lines` chứa thông tin hàng hóa, số lượng dự kiến (`expected_qty`).
* **Request (`CreateReceiptRequest`):**

```json
{
  "warehouseId": "1",
  "supplierId": "2",
  "assignedTo": "3", 
  "expectedDate": "2026-10-10T00:00:00Z",
  "lines": [
    {
      "skuId": "1",
      "uomId": "1",
      "supplierSkuCode": "SUP-ITEM-001",
      "expectedQty": 100
    }
  ]
}
```

* **Response:**

```json
{
  "statusCode": 201,
  "message": "Receipt created successfully",
  "data": {
    "id": "1",
    "code": "RC-20261010-001",
    "status": "ASSIGNED"
  }
}
```

**b. Xác nhận nhận hàng / Cất hàng (Receive & Putaway)**

* **Endpoint:** `POST /api/receipts/{id}/receive`
* **Tác động DB (Bắt buộc dùng Transaction):**
  * **`receipts`**: Cập nhật trạng thái (`status`) thành `COMPLETED`.
  * **`receipt_lines`**: Cập nhật số lượng nhận thực tế (`received_qty`) và vị trí cất hàng (`target_location_id`).
  * **`inventory`**: Lấy tồn kho hiện tại lên cộng thêm `received_qty` dựa trên **Unique Key: (`location_id`, `sku_id`, `lot_no`, `serial_no`)**. Nếu chưa có dòng tồn kho thì tạo mới (`INSERT`) và lưu kèm `expiry_date`.
  * **`stock_ledger`**: Thêm mới 1 dòng ghi vết lịch sử giao dịch (loại RECEIPT).
  * `sku_barcodes`: Kiểm tra mã barcode, nếu chưa có thì tạo mới.
  * `sku_suppliers`: Bổ sung mối quan hệ nếu là lần đầu.
  * **Kiểm tra lại khối lượng tối đa của Bin nếu có**
* **Request (`ReceiveReceiptRequest`):**

```json
{
  "lines": [
    {
      "receiptLineId": "1",
      "receivedQty": 100,
      "targetLocationId": "10",
      "lotNo": "LOT20261005",
      "serialNo": "SN-001",
      "expiryDate": "2027-10-05"
    }
  ]
}
```

*(Ghi chú: `lotNo`, `serialNo`, `expiryDate` là các trường tùy chọn, chỉ bắt buộc nếu bảng `skus` có `is_lot_tracked` hoặc `is_serial_tracked` = true).*

* **Response:**

```json
{
  "statusCode": 200,
  "message": "Receipt received and putaway successfully",
  "data": null
}
```

### 4.2. Phân hệ Điều chỉnh tồn kho có phê duyệt (Adjustment)

**a. Tạo đề xuất điều chỉnh (Create Adjustment Draft)**

* **Endpoint:** `POST /api/adjustments`
* **Tác động DB:**
  * Tạo mới phiếu ở bảng `adjustments` với trạng thái `PENDING_APPROVAL`.
  * Ghi chi tiết chênh lệch vào bảng `adjustment_lines`.
* **Request (`CreateAdjustmentRequest`):**

```json
{
  "warehouseId": "1",
  "reason": "Mất hàng trong kho",
  "lines": [
    {
      "locationId": "10",
      "skuId": "1",
      "uomId": "1",
      "lotNo": "LOT20261005",
      "serialNo": "SN-001",
      "systemQty": 100,
      "actualQty": 98
    }
  ]
}
```

* **Response:**

```json
{
  "statusCode": 201,
  "message": "Adjustment draft created",
  "data": {
    "id": "1",
    "code": "ADJ-2026-001",
    "status": "PENDING_APPROVAL"
  }
}
```

**b. Duyệt phiếu điều chỉnh (Approve Adjustment)**

* **Endpoint:** `POST /api/adjustments/{id}/approve`
* **Tác động DB (Bắt buộc dùng Transaction):**
  * **`adjustments`**: Cập nhật trạng thái thành `APPROVED`.
  * **`inventory`**: Cập nhật cộng/trừ số lượng `qty_on_hand` theo đúng số `qty_change`.
  * **`stock_ledger`**: Ghi thêm 1 dòng lịch sử (ADJUST_IN hoặc ADJUST_OUT).
* **Request:** `(Empty Body - Chỉ cần truyền Path param id)`

```json
{}
```

* **Response:**

```json
{
  "statusCode": 200,
  "message": "Adjustment approved successfully, inventory updated",
  "data": null
}
```

### 4.3. Phân hệ Kiểm kê (Cycle Count)

**a. Khởi tạo phiên kiểm kê (Create Cycle Count)**

* **Endpoint:** `POST /api/cycle-counts`
* **Tác động DB:**
  * Tạo bảng ghi đợt kiểm kê ở `cycle_counts` (Trạng thái: `ASSIGNED`).
  * Quét danh sách các mã SKU trong vùng kiểm kê để tạo các dòng `cycle_count_lines`.
* **Request (`CreateCycleCountRequest`):**

```json
{
  "warehouseId": "1",
  "assignedTo": "4",
  "locationIds": ["10", "11"]
}
```

* **Response:**

```json
{
  "statusCode": 201,
  "message": "Cycle count session created",
  "data": {
    "id": "1",
    "code": "CC-2026-001"
  }
}
```

**b. Nộp kết quả kiểm đếm (Submit Count)**

* **Endpoint:** `POST /api/cycle-counts/{id}/count`
* **Tác động DB:**
  * **`cycle_count_lines`**: Cập nhật số lượng đếm được (`counted_qty`) và tính ra `difference_qty`.
  * **`cycle_counts`**: Cập nhật trạng thái thành `COMPLETED`.
* **Request (`SubmitCountRequest`):**

```json
{
  "lines": [
    {
      "locationId": "10",
      "skuId": "1",
      "lotNo": "LOT20261005",
      "serialNo": "SN-001",
      "countedQty": 98
    }
  ]
}
```

* **Response:**

```json
{
  "statusCode": 200,
  "message": "Cycle count submitted successfully",
  "data": null
}
```

### 4.4. Phân hệ Mã QR

**Get BarCode cho Hàng hóa (SKU & UOM)**

* **Endpoint:** `GET /api/qrcodes/sku/{skuId}/uom/{uomId}` (hoặc truyền qua Query Params)
* **Tác động DB:** Query bảng `sku_barcodes` để lấy chuỗi barcode gốc, đồng thời join với bảng `skus` và `uoms` để lấy thông tin chi tiết phục vụ hiển thị lên UI Modal. Không thay đổi DB.
* **Request:** `(Truyền qua Path Params, không có Body)`
* **Response:**

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "barcode": "8935244876541",
    "skuCode": "SKU-001",
    "skuName": "Dế Mèn Phiêu Lưu Ký",
    "uomName": "Hộp",
    "baseUomName": "Cuốn",
    "factorToBase": 10
  }
}
```

### 4.5. Phân hệ Quản lý Nhà cung cấp & Đối tác (Suppliers)

**a. Quản lý Danh sách Nhà cung cấp (CRUD Suppliers)**

* **Tạo nhà cung cấp mới**

  * **Endpoint:** `POST /api/suppliers`
  * **Request:**

  ```json
  {
    "code": "SUP-001",
    "name": "Nhà xuất bản Kim Đồng",
    "taxCode": "0101234567",
    "contact": "contact@kimdong.com.vn"
  }
  ```

  * **Response:**

  ```json
  {
    "statusCode": 201,
    "message": "Supplier created",
    "data": { "id": "1" }
  }
  ```
* **Lấy danh sách nhà cung cấp**

  * **Endpoint:** `GET /api/suppliers?page=1&limit=10&search=kim`
  * **Request:** `(Query Params)`
  * **Response:**

  ```json
  {
    "statusCode": 200,
    "data": [
      {
        "id": "1",
        "code": "SUP-001",
        "name": "Nhà xuất bản Kim Đồng",
        "taxCode": "0101234567",
        "contact": "contact@kimdong.com.vn",
        "status": "ACTIVE"
      }
    ],
    "meta": { "total": 1, "page": 1, "limit": 10 }
  }
  ```
* **Xem chi tiết nhà cung cấp**

  * **Endpoint:** `GET /api/suppliers/{id}`
  * **Request:** `(Path Param)`
  * **Response:**

  ```json
  {
    "statusCode": 200,
    "data": {
      "id": "1",
      "code": "SUP-001",
      "name": "Nhà xuất bản Kim Đồng",
      "taxCode": "0101234567",
      "contact": "contact@kimdong.com.vn",
      "status": "ACTIVE"
    }
  }
  ```
* **Cập nhật nhà cung cấp**

  * **Endpoint:** `PUT /api/suppliers/{id}`
  * **Request:**

  ```json
  {
    "name": "NXB Kim Đồng (Updated)",
    "taxCode": "0101234568",
    "contact": "new-contact@kimdong.com.vn",
    "status": "INACTIVE"
  }
  ```

  * **Response:**

  ```json
  {
    "statusCode": 200,
    "message": "Supplier updated",
    "data": null
  }
  ```

**b. Quản lý mã SKU của Nhà cung cấp (SKU Suppliers)**

* **Lấy các mặt hàng nhà cung cấp phân phối**

  * **Endpoint:** `GET /api/suppliers/{id}/skus`
  * **Request:** `(Path Param)`
  * **Response:**

  ```json
  {
    "statusCode": 200,
    "data": [
      {
        "skuId": "1",
        "skuCode": "SKU-001",
        "skuName": "Dế Mèn Phiêu Lưu Ký",
        "supplierSkuCode": "KD-001",
        "baseUomName": "Cuốn",
        "isPreferred": true
      }
    ]
  }
  ```

---

## 5. Lưu ý kỹ thuật cho Team Backend

1. **Transaction & Rollback:** Tại bước `POST /api/receipts/{id}/receive` và API duyệt Adjustment, đây là những API tác động trực tiếp lên tiền tài/hàng hóa, bắt buộc phải dùng **DB Transaction**. Nếu lỗi ở bước ghi `stock_ledger`, `inventory` không được phép tăng.
2. **Tránh ghi đè/Dữ liệu rác:** Phiếu nhập trạng thái `COMPLETED` thì không được phép bấm Nhận hàng nữa. Các hàm validate nghiệp vụ (Check status) phải đặt lên hàng đầu.
3. **Kế thừa API:** Các API tra cứu dữ liệu (Warehouse, Location, SKU) đã xong ở Tuần 2 nên tận dụng triệt để để thiết kế các Combo-box, Dropdown cho màn hình tạo Phiếu tuần này.

---

## 6. Phân công nhiệm vụ Tuần 3

Để đảm bảo tiến độ cho buổi Demo, công việc tuần này được chia như sau:

| Thành viên         | Trách nhiệm              | Phân hệ phụ trách           | Chi tiết công việc                                                                                                                                                                                  |
| :------------------- | :------------------------- | :------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vy Tran**    | **Frontend (UI/UX)** | **Toàn bộ UI (Mục 3)** | Xây dựng tất cả các màn hình giao diện: Nhập hàng, Kiểm kê, Điều chỉnh, Sổ cái, Quản lý Nhà cung cấp và Modal in mã QR. Tích hợp gọi API từ Backend.                        |
| **Nam Nguyen** | **Backend (API)**    | **Mục 4.1 & 4.2**        | Viết API luồng **Nhập hàng & Cất hàng** (/api/receipts) và **Điều chỉnh tồn kho** (/api/adjustments). Lưu ý xử lý chặt chẽ DB Transaction cho inventory và stock_ledger. |
| **Thuan Le**   | **Backend (API)**    | **Mục 4.3 & 4.4**        | Viết API luồng **Kiểm kê** (/api/cycle-counts) và API xuất dữ liệu phục vụ render **Mã QR** (/api/qrcodes).                                                                     |
| **Trung Pham** | **Backend (API)**    | **Mục 4.5**              | Viết toàn bộ API CRUD cho **Nhà cung cấp & Đối tác** (/api/suppliers), bao gồm cả API map mã SKU với nhà cung cấp.                                                                 |
