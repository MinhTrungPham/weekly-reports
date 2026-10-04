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

## 3. Danh sách UI cần có để phục vụ Demo

- **Màn hình Nhập hàng**:
  - Giao diện Supervisor: Tạo phiếu nhập, phân công người nhận.
  - Giao diện Receiver: Nhận việc, điền số lượng nhận, chọn Location cất hàng.
- **Màn hình Kiểm kê & Điều chỉnh**:
  - Giao diện Supervisor: Khởi tạo đợt kiểm kê, giao việc.
  - Giao diện Inspector: Màn hình nhập số lượng đếm, nút "Tạo đề xuất điều chỉnh".
  - Giao diện Manager: Xem danh sách đề xuất, nút Duyệt / Từ chối.
- **Màn hình Tồn kho & Sổ cái**: View số lượng (Inventory) và Sổ cái (Stock Ledger) để đối soát.
- **Màn hình Quản lý Nhà cung cấp**:
  - Giao diện Admin/Manager: Thêm, sửa, xóa, tìm kiếm Nhà cung cấp (Suppliers).
  - Giao diện chi tiết: Danh sách các Sku của nhà cung cấp.

---

## 4. Danh sách chi tiết API & DTO đề xuất (Cho các luồng tự chọn)

Dựa trên thứ tự tự chọn, dưới đây là thiết kế API cho các Module kèm theo **chi tiết tác động CSDL (DB Tables)**:

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

**b. Xác nhận nhận hàng / Cất hàng (Receive & Putaway)**

* **Endpoint:** `POST /api/receipts/{id}/receive`
* **Tác động DB (Bắt buộc dùng Transaction):**
  * **`receipts`**: Cập nhật trạng thái (`status`) thành `COMPLETED`.
  * **`receipt_lines`**: Cập nhật số lượng nhận thực tế (`received_qty`) và vị trí cất hàng (`target_location_id`).
  * **`inventory`**: Lấy tồn kho hiện tại lên cộng thêm `received_qty` (`UPDATE qty_on_hand = qty_on_hand + X`). Nếu chưa có dòng tồn kho cho SKU/Location này thì tạo mới (`INSERT`).
  * **`stock_ledger`**: Thêm mới 1 dòng ghi vết lịch sử giao dịch (loại RECEIPT, số lượng `qty_change` > 0).
* **Request (`ReceiveReceiptRequest`):**

```json
{
  "lines": [
    {
      "receiptLineId": "1",
      "receivedQty": 100,
      "targetLocationId": "10"
    }
  ]
}
```

### 4.2. Phân hệ Điều chỉnh tồn kho có phê duyệt (Adjustment)

**a. Tạo đề xuất điều chỉnh (Create Adjustment Draft)**

* **Endpoint:** `POST /api/adjustments`
* **Tác động DB:**
  * Tạo mới phiếu ở bảng `adjustments` với trạng thái `PENDING_APPROVAL`.
  * Ghi chi tiết chênh lệch vào bảng `adjustment_lines` gồm số lượng trên hệ thống (`system_qty`), số thực tế (`actual_qty`), độ lệch (`qty_change`).
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
      "systemQty": 100,
      "actualQty": 98
    }
  ]
}
```

**b. Duyệt phiếu điều chỉnh (Approve Adjustment)**

* **Endpoint:** `POST /api/adjustments/{id}/approve`
* **Tác động DB (Bắt buộc dùng Transaction):**
  * **`adjustments`**: Cập nhật trạng thái thành `APPROVED`, điền người duyệt (`approved_by`) và thời gian duyệt.
  * **`inventory`**: Cập nhật cộng/trừ số lượng `qty_on_hand` theo đúng số `qty_change`.
  * **`stock_ledger`**: Ghi thêm 1 dòng lịch sử (loại hình ADJUST_IN nếu tăng hoặc ADJUST_OUT nếu giảm).

### 4.3. Phân hệ Kiểm kê (Cycle Count)

**a. Khởi tạo phiên kiểm kê (Create Cycle Count)**

* **Endpoint:** `POST /api/cycle-counts`
* **Tác động DB:**
  * Tạo bảng ghi đợt kiểm kê ở `cycle_counts` (Trạng thái: `ASSIGNED`).
  * Quét danh sách các mã SKU trong vùng kiểm kê để tạo các dòng `cycle_count_lines` chứa số liệu `system_qty` đang có tại thời điểm bắt đầu đếm.
* **Request (`CreateCycleCountRequest`):**

```json
{
  "warehouseId": "1",
  "assignedTo": "4",
  "locationIds": ["10", "11"]
}
```

**b. Nộp kết quả kiểm đếm (Submit Count)**

* **Endpoint:** `POST /api/cycle-counts/{id}/count`
* **Tác động DB:**
  * **`cycle_count_lines`**: Cập nhật số lượng đếm được (`counted_qty`) và tự động tính ra `difference_qty`.
  * **`cycle_counts`**: Cập nhật trạng thái đợt đếm thành `COMPLETED` (hoặc `REVIEWING`).
  * *(Hệ thống có thể tự động sinh ra một bản ghi trong `adjustments` dựa trên chênh lệch này để chờ Manager duyệt).*
* **Request (`SubmitCountRequest`):**

```json
{
  "lines": [
    {
      "locationId": "10",
      "skuId": "1",
      "countedQty": 98
    }
  ]
}
```

### 4.4. Phân hệ Mã QR 

**a. Render / Generate QR Code**

* **Endpoint:** `GET /api/qrcodes/location/{locationId}` hoặc `GET /api/qrcodes/sku/{skuId}`
* **Tác động DB:** Chỉ Query bảng `locations` hoặc `skus` để lấy thông tin. Không tác động thay đổi DB.
* **Response:** Trả về file định dạng Image/PNG hoặc chuỗi Base64.

### 4.5. Phân hệ Quản lý Nhà cung cấp & Đối tác (Suppliers)

**a. Quản lý Danh sách Nhà cung cấp (CRUD Suppliers)**

* **Endpoint:**
  * `GET /api/suppliers` (Lấy danh sách, phân trang, tìm kiếm)
  * `POST /api/suppliers` (Tạo nhà cung cấp mới)
  * `GET /api/suppliers/{id}` (Xem chi tiết)
  * `PUT /api/suppliers/{id}` (Cập nhật thông tin)
* **Tác động DB:** Tương tác trực tiếp (Thêm/Sửa/Đọc) bảng `suppliers`.

**b. Quản lý mã SKU của Nhà cung cấp (SKU Suppliers)**

* **Endpoint:**
  * `GET /api/suppliers/{id}/skus` (Lấy các mặt hàng nhà cung cấp này phân phối)
* **Tác động DB:** Tương tác trực tiếp bảng `sku_suppliers`.

---

## 5. Lưu ý kỹ thuật cho Team Backend

1. **Transaction & Rollback:** Tại bước `POST /api/receipts/{id}/receive` và API duyệt Adjustment, đây là những API tác động trực tiếp lên tiền tài/hàng hóa, bắt buộc phải dùng **DB Transaction**. Nếu lỗi ở bước ghi `stock_ledger`, `inventory` không được phép tăng.
2. **Tránh ghi đè/Dữ liệu rác:** Phiếu nhập trạng thái `COMPLETED` thì không được phép bấm Nhận hàng nữa. Các hàm validate nghiệp vụ (Check status) phải đặt lên hàng đầu.
3. **Kế thừa API:** Các API tra cứu dữ liệu (Warehouse, Location, SKU) đã xong ở Tuần 2 nên tận dụng triệt để để thiết kế các Combo-box, Dropdown cho màn hình tạo Phiếu tuần này.
