# Bảng Phân Quyền (Permissions) & Đề Xuất Bảng Nghiệp Vụ (Schema)

## 1. Danh sách Roles & Nhiệm vụ cụ thể

Dựa trên yêu cầu thực tế, hệ thống có 7 role với luồng nhiệm vụ như sau:

1. **ADMIN**: Toàn quyền. Quản lý user, phân quyền, maintain hệ thống.
2. **MANAGER (Quản lý kho)**: Quản lý toàn bộ nghiệp vụ kho (tạo/sửa kho, vị trí, master data...). Có quyền duyệt các phiếu điều chỉnh số lượng. (Có tất cả quyền **trừ** quản lý User & Phân quyền).
3. **SUPERVISOR (Giám sát ca)**: Điều phối task (giao việc), tạo đợt kiểm duyệt, phiên kiểm kê. Được thao tác với các danh mục (SKU, UOM, UOM_conversion, Inventory, Barcodes).
4. **RECEIVER (Nhân viên nhận hàng)**: Nhận hàng từ nhà cung cấp, cất hàng (Putaway). Được xem các thông tin liên quan (Inventory, UOM, UOM_conversion, SKU, Locations, Barcodes).
5. **PICKER (Nhân viên soạn hàng)**: Lấy hàng theo chỉ định (Pick task). Được xem các thông tin liên quan (Inventory, UOM, UOM_conversion, SKU, Locations, Barcodes).
6. **INSPECTOR (Nhân viên kiểm kê)**: Rà soát chất lượng, khối lượng hàng trong kho. Đề xuất phiếu điều chỉnh số lượng hàng tồn kho.
7. **VIEWER (Kế toán, Sale...)**: Mở màn hình tồn kho check xem còn số lượng không để báo khách lên đơn. Chỉ có quyền **Xem (Read-only)**.

---

## 2. Bảng Phân Quyền Chi Tiết (Permissions Matrix - Đã Phân Nhỏ)

*(Lưu ý: **ADMIN** mặc định có toàn bộ quyền nên không liệt kê lại vào cột "Role được cấp" dưới đây. Viewer chỉ có các quyền READ)*

| Module                                      | Permission Code                                    | Ý nghĩa                                      | Role được cấp (Ngoài ADMIN)                                                 |
| :------------------------------------------ | :------------------------------------------------- | :--------------------------------------------- | :------------------------------------------------------------------------------- |
| **User & Role**                       | `USER.READ`                                      | Xem danh sách và chi tiết tài khoản       | *(Chỉ ADMIN)*                                                                 |
|                                             | `USER.CREATE` / `UPDATE` / `DEACTIVATE`      | Tạo, sửa, khóa tài khoản                  | *(Chỉ ADMIN)*                                                                 |
|                                             | `ROLE.READ`                                      | Xem danh sách role và phân quyền           | *(Chỉ ADMIN)*                                                                 |
|                                             | `ROLE.CREATE` / `UPDATE` / `DEACTIVATE`      | Tạo, sửa, khóa role                         | *(Chỉ ADMIN)*                                                                 |
| **System**                            | `SYSTEM.CONFIG.READ`                             | Xem cấu hình hệ thống                      | *(Chỉ ADMIN)*                                                                 |
|                                             | `SYSTEM.CONFIG.UPDATE`                           | Cập nhật cấu hình hệ thống               | *(Chỉ ADMIN)*                                                                 |
| **Warehouse**                         | `WAREHOUSE.READ`                                 | Xem danh sách và chi tiết kho               | `MANAGER`, `SUPERVISOR`, `RECEIVER`, `PICKER`, `INSPECTOR`, `VIEWER` |
|                                             | `WAREHOUSE.CREATE` / `UPDATE` / `DEACTIVATE` | Thêm, sửa, đóng kho                        | `MANAGER` (Được cấp UPDATE)                                                |
| **Location**                          | `LOCATION.READ`                                  | Xem sơ đồ, vị trí kho                     | `MANAGER`, `SUPERVISOR`, `RECEIVER`, `PICKER`, `INSPECTOR`, `VIEWER` |
|                                             | `LOCATION.CREATE` / `UPDATE` / `DEACTIVATE`  | Thêm, sửa, ngưng sử dụng vị trí         | `MANAGER`                                                                      |
| **Master Data**                       | `SKU.READ`                                       | Xem thông tin hàng hóa                      | Tất cả các Role                                                               |
|                                             | `SKU.CREATE` / `UPDATE` / `DEACTIVATE`       | Thêm, sửa, ngưng sử dụng hàng hóa       | `MANAGER`, `SUPERVISOR`                                                      |
|                                             | `UOM.READ`                                       | Xem danh sách Đơn vị tính                 | Tất cả các Role                                                               |
|                                             | `UOM.CREATE` / `UPDATE` / `DEACTIVATE`       | Quản lý Đơn vị tính                      | `MANAGER`, `SUPERVISOR`                                                      |
|                                             | `BARCODE.READ`                                   | Tra cứu mã vạch                             | Tất cả các Role                                                               |
|                                             | `BARCODE.CREATE` / `UPDATE` / `DELETE`       | Quản lý mã vạch                            | `MANAGER`, `SUPERVISOR`                                                      |
|                                             | `SUPPLIER.READ`                                  | Xem nhà cung cấp                             | Tất cả các Role                                                               |
|                                             | `SUPPLIER.CREATE` / `UPDATE` / `DEACTIVATE`  | Quản lý nhà cung cấp                       | `MANAGER`, `SUPERVISOR`                                                      |
| **Inventory**                         | `INVENTORY.READ`                                 | Xem tồn kho (thực tế, khả dụng)           | Tất cả các Role                                                               |
|                                             | `INVENTORY.RESERVE` / `RELEASE`                | Giữ chỗ / Hủy giữ chỗ (Luồng tự động) | `MANAGER`, `SUPERVISOR`                                                      |
| **Ledger**                            | `STOCK_LEDGER.READ`                              | Xem sổ cái / biến động                    | `MANAGER`, `SUPERVISOR`, `INSPECTOR`, `VIEWER`                           |
|                                             | `STOCK_LEDGER.REVERSE`                           | Tạo giao dịch đảo để sửa sai            | *(Chỉ ADMIN)*                                                                 |
| **Inbound** <br>*(Nhập hàng)*     | `RECEIPT.READ`                                   | Xem phiếu nhập                               | `MANAGER`, `SUPERVISOR`, `RECEIVER`                                        |
|                                             | `RECEIPT.CREATE` / `UPDATE` / `CANCEL`       | Tạo, sửa, hủy phiếu nhập                  | `MANAGER`, `SUPERVISOR`                                                      |
|                                             | `RECEIPT.ASSIGN`                                 | Phân công người nhận hàng                | `SUPERVISOR`                                                                   |
|                                             | `RECEIPT.RECEIVE`                                | Thực thi xác nhận nhận / cất hàng        | `RECEIVER`                                                                     |
| **Outbound** <br>*(Xuất hàng)*    | `SHIPMENT.READ`                                  | Xem phiếu xuất                               | `MANAGER`, `SUPERVISOR`, `PICKER`                                          |
|                                             | `SHIPMENT.CREATE` / `UPDATE` / `CANCEL`      | Tạo, sửa, hủy phiếu xuất                  | `MANAGER`, `SUPERVISOR`                                                      |
|                                             | `SHIPMENT.ASSIGN`                                | Phân công người đi nhặt hàng            | `SUPERVISOR`                                                                   |
|                                             | `SHIPMENT.PICK`                                  | Thực thi nhặt hàng theo phiếu xuất        | `PICKER`                                                                       |
| **Inspection**<br>*(Kiểm kê)*     | `CYCLE_COUNT.READ`                               | Xem đợt kiểm kê                            | `MANAGER`, `SUPERVISOR`, `INSPECTOR`                                       |
|                                             | `CYCLE_COUNT.CREATE` / `UPDATE` / `CANCEL`   | Tạo, sửa, hủy đợt kiểm kê               | `MANAGER`, `SUPERVISOR`                                                      |
|                                             | `CYCLE_COUNT.ASSIGN`                             | Phân công người đi đếm                  | `SUPERVISOR`                                                                   |
|                                             | `CYCLE_COUNT.COUNT`                              | Nhập số lượng thực tế đếm được      | `INSPECTOR`                                                                    |
| **Adjustment**<br>*(Điều chỉnh)* | `ADJUSTMENT.READ`                                | Xem phiếu đề xuất điều chỉnh            | `MANAGER`, `SUPERVISOR`, `INSPECTOR`                                       |
|                                             | `ADJUSTMENT.CREATE` / `UPDATE`                 | Tạo, sửa phiếu đề xuất (Draft)           | `INSPECTOR`                                                                    |
|                                             | `ADJUSTMENT.SUBMIT` / `CANCEL`                 | Gửi đề xuất đi duyệt / Hủy phiếu       | `INSPECTOR`                                                                    |
|                                             | `ADJUSTMENT.APPROVE` / `REJECT`                | Duyệt / Từ chối phiếu điều chỉnh        | `MANAGER`                                                                      |

---

## 3. Đề xuất các Bảng Nghiệp Vụ (Operational Database Schema)

Đáp ứng yêu cầu tích hợp thông tin **phân công (assign)** và **phê duyệt (approve)** cho các luồng Nhập, Xuất, Kiểm kê và Đề xuất điều chỉnh, dưới đây là thiết kế chi tiết các bảng còn thiếu:

### 3.1. Nhóm Phiếu Đề Xuất Điều Chỉnh (Adjustments)

*Nghiệp vụ: Inspector phát hiện sai lệch -> Tạo phiếu đề xuất sửa -> Manager duyệt.*

* **`adjustments`** (Phiếu đề xuất điều chỉnh)
  * `id` (BIGINT, PK)
  * `warehouse_id` (BIGINT, FK)
  * `code` (VARCHAR) - Mã phiếu đề xuất (VD: `ADJ-001`).
  * `reason` (VARCHAR) - Lý do: Bể vỡ, Mất mát, Sai sót nhập liệu, ...
  * `status` (VARCHAR) - Trạng thái: `DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `REJECTED`.
  * `proposed_by` (BIGINT, FK) - Người tạo đề xuất (ID của `INSPECTOR`).
  * `approved_by` (BIGINT, FK) - Người duyệt (ID của `MANAGER`).
  * `approved_at` (TIMESTAMP) - Thời gian duyệt.
* **`adjustment_lines`** (Chi tiết dòng điều chỉnh)
  * `id` (BIGINT, PK)
  * `adjustment_id` (BIGINT, FK)
  * `location_id` (BIGINT, FK) - Vị trí phát hiện chênh lệch.
  * `sku_id` (BIGINT, FK)
  * `uom_id` (BIGINT, FK)
  * `system_qty` (DECIMAL) - Số lượng ghi nhận trên hệ thống lúc kiểm.
  * `actual_qty` (DECIMAL) - Số lượng thực tế.
  * `qty_change` (DECIMAL) - Số lượng điều chỉnh (+/-).

### 3.2. Nhóm Phiếu Nhập Hàng (Inbound / Receipts)

*Nghiệp vụ: Tạo phiếu nhập -> Phân công -> Receiver thực thi.*

* **`receipts`** (Phiếu nhập kho)
  * `id` (BIGINT, PK)
  * `warehouse_id` (BIGINT, FK)
  * `supplier_id` (BIGINT, FK) - Nhà cung cấp.
  * `code` (VARCHAR) - Mã phiếu nhập.
  * `status` (VARCHAR) - `NEW`, `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`.
  * `assigned_to` (BIGINT, FK) - Người được phân công nhận hàng (ID của `RECEIVER`).
  * `assigned_by` (BIGINT, FK) - Người phân công (ID của `SUPERVISOR`).
  * `expected_date` (TIMESTAMP) - Ngày dự kiến hàng đến.
* **`receipt_lines`** (Chi tiết hàng nhập)
  * `id` (BIGINT, PK)
  * `receipt_id` (BIGINT, FK)
  * `sku_id` (BIGINT, FK)
  * `uom_id` (BIGINT, FK)
  * `supplier_sku_code` (VARCHAR) - Mã hàng của nhà cung cấp/nhà phát hành (tùy chọn, lấy từ `sku_suppliers` hoặc nhập tay).
  * `expected_qty` (DECIMAL) - Số lượng dự kiến.
  * `received_qty` (DECIMAL) - Số lượng thực nhận.
  * `target_location_id` (BIGINT, FK) - Vị trí chỉ định cất hàng (Putaway).

### 3.3. Nhóm Phiếu Xuất Hàng (Outbound / Shipments)

*Nghiệp vụ: Tạo phiếu xuất -> Phân công -> Picker thực thi.*

* **`shipments`** (Phiếu xuất kho)
  * `id` (BIGINT, PK)
  * `warehouse_id` (BIGINT, FK)
  * `code` (VARCHAR) - Mã phiếu xuất.
  * `status` (VARCHAR) - `NEW`, `ASSIGNED`, `PICKING`, `STAGED`, `SHIPPED`.
  * `assigned_to` (BIGINT, FK) - Người được phân công đi lấy hàng (ID của `PICKER`).
  * `assigned_by` (BIGINT, FK) - Người phân công (ID của `SUPERVISOR`).
  * `customer_info` (VARCHAR) - Thông tin đơn hàng / Khách hàng.
* **`shipment_lines`** (Chi tiết hàng xuất)
  * `id` (BIGINT, PK)
  * `shipment_id` (BIGINT, FK)
  * `sku_id` (BIGINT, FK)
  * `uom_id` (BIGINT, FK)
  * `requested_qty` (DECIMAL) - Số lượng yêu cầu xuất.
  * `picked_qty` (DECIMAL) - Số lượng Picker thực tế nhặt được.
  * `source_location_id` (BIGINT, FK) - Vị trí chỉ định Picker đến lấy hàng.

### 3.4. Nhóm Kiểm Kê (Cycle Counts)

*Nghiệp vụ: Supervisor tạo đợt kiểm kê -> Phân công Inspector.*

* **`cycle_counts`** (Đợt kiểm kê)
  * `id` (BIGINT, PK)
  * `warehouse_id` (BIGINT, FK)
  * `code` (VARCHAR) - Mã đợt kiểm kê.
  * `status` (VARCHAR) - `NEW`, `ASSIGNED`, `COUNTING`, `REVIEWING`, `COMPLETED`.
  * `assigned_to` (BIGINT, FK) - Giao cho (ID của `INSPECTOR`).
  * `created_by` (BIGINT, FK) - Người tạo (ID của `SUPERVISOR`).
* **`cycle_count_lines`** (Chi tiết dòng kiểm kê)
  * `id` (BIGINT, PK)
  * `cycle_count_id` (BIGINT, FK)
  * `location_id` (BIGINT, FK)
  * `sku_id` (BIGINT, FK)
  * `system_qty` (DECIMAL)
  * `counted_qty` (DECIMAL)
  * `difference_qty` (DECIMAL) - Lượng chênh lệch (Làm cơ sở để sinh ra Phiếu Đề Xuất Điều Chỉnh).

---

## 4. Đề Xuất Hướng Tích Hợp Vào ERD (Domain F - Operations)

Để ghép nối các bảng vận hành ở trên vào tài liệu `02_ERD/erd_all.puml` hiện tại, ta định nghĩa thêm một **Domain F (Operations)** kết nối chặt chẽ với các Domain cũ.

Mã PlantUML để bổ sung vào ERD:

```plantuml
title Domain F — Operations (Inbound, Outbound, Count & Adjust)

' 1. INBOUND
entity receipts {
    * id : BIGINT <<PK>>
    --
    * warehouse_id : BIGINT <<FK (domain B)>>
    supplier_id : BIGINT <<FK (domain C)>>
    * code : VARCHAR(50) <<UK>>
    * status : VARCHAR(20)
    expected_date : DATE
    --
    assigned_to : BIGINT <<FK (domain A)>>
    assigned_by : BIGINT <<FK (domain A)>>
    * created_at : TIMESTAMP
    * created_by : BIGINT
    * updated_at : TIMESTAMP
    * updated_by : BIGINT
}

entity receipt_lines {
    * id : BIGINT <<PK>>
    --
    * receipt_id : BIGINT <<FK>>
    * sku_id : BIGINT <<FK (domain C)>>
    * uom_id : BIGINT <<FK (domain C)>>
    supplier_sku_code : VARCHAR(100)
    target_location_id : BIGINT <<FK (domain B)>>
    * expected_qty : DECIMAL(18,4)
    received_qty : DECIMAL(18,4)
}

' 2. OUTBOUND
entity shipments {
    * id : BIGINT <<PK>>
    --
    * warehouse_id : BIGINT <<FK (domain B)>>
    * code : VARCHAR(50) <<UK>>
    * status : VARCHAR(20)
    customer_info : VARCHAR(255)
    --
    assigned_to : BIGINT <<FK (domain A)>>
    assigned_by : BIGINT <<FK (domain A)>>
    * created_at : TIMESTAMP
    * created_by : BIGINT
    * updated_at : TIMESTAMP
    * updated_by : BIGINT
}

entity shipment_lines {
    * id : BIGINT <<PK>>
    --
    * shipment_id : BIGINT <<FK>>
    * sku_id : BIGINT <<FK (domain C)>>
    * uom_id : BIGINT <<FK (domain C)>>
    source_location_id : BIGINT <<FK (domain B)>>
    * requested_qty : DECIMAL(18,4)
    picked_qty : DECIMAL(18,4)
}

' 3. CYCLE COUNT
entity cycle_counts {
    * id : BIGINT <<PK>>
    --
    * warehouse_id : BIGINT <<FK (domain B)>>
    * code : VARCHAR(50) <<UK>>
    * status : VARCHAR(20)
    --
    assigned_to : BIGINT <<FK (domain A)>>
    * created_at : TIMESTAMP
    * created_by : BIGINT
    * updated_at : TIMESTAMP
    * updated_by : BIGINT
}

entity cycle_count_lines {
    * id : BIGINT <<PK>>
    --
    * cycle_count_id : BIGINT <<FK>>
    * location_id : BIGINT <<FK (domain B)>>
    * sku_id : BIGINT <<FK (domain C)>>
    * system_qty : DECIMAL(18,4)
    counted_qty : DECIMAL(18,4)
    difference_qty : DECIMAL(18,4)
}

' 4. ADJUSTMENTS
entity adjustments {
    * id : BIGINT <<PK>>
    --
    * warehouse_id : BIGINT <<FK (domain B)>>
    * code : VARCHAR(50) <<UK>>
    * status : VARCHAR(20)
    reason : VARCHAR(255)
    --
    proposed_by : BIGINT <<FK (domain A)>>
    approved_by : BIGINT <<FK (domain A)>>
    approved_at : TIMESTAMP
    * created_at : TIMESTAMP
    * created_by : BIGINT
    * updated_at : TIMESTAMP
    * updated_by : BIGINT
}

entity adjustment_lines {
    * id : BIGINT <<PK>>
    --
    * adjustment_id : BIGINT <<FK>>
    * location_id : BIGINT <<FK (domain B)>>
    * sku_id : BIGINT <<FK (domain C)>>
    * uom_id : BIGINT <<FK (domain C)>>
    * system_qty : DECIMAL(18,4)
    * actual_qty : DECIMAL(18,4)
    * qty_change : DECIMAL(18,4)
}

' =========================================================
' CROSS-DOMAIN RELATIONSHIPS (Domain F)
' =========================================================

' Lines to Headers
receipts ||--o{ receipt_lines : "receipt_id"
shipments ||--o{ shipment_lines : "shipment_id"
cycle_counts ||--o{ cycle_count_lines : "cycle_count_id"
adjustments ||--o{ adjustment_lines : "adjustment_id"

' Domain F -> Domain B (Warehouse / Location)
warehouses ||--o{ receipts : "warehouse_id"
warehouses ||--o{ shipments : "warehouse_id"
warehouses ||--o{ cycle_counts : "warehouse_id"
warehouses ||--o{ adjustments : "warehouse_id"
locations ||--o{ receipt_lines : "target_location_id"
locations ||--o{ shipment_lines : "source_location_id"
locations ||--o{ cycle_count_lines : "location_id"
locations ||--o{ adjustment_lines : "location_id"

' Domain F -> Domain C (SKU / UOM / Supplier)
suppliers ||--o{ receipts : "supplier_id"
skus ||--o{ receipt_lines : "sku_id"
uoms ||--o{ receipt_lines : "uom_id"
skus ||--o{ shipment_lines : "sku_id"
uoms ||--o{ shipment_lines : "uom_id"
skus ||--o{ cycle_count_lines : "sku_id"
skus ||--o{ adjustment_lines : "sku_id"
uoms ||--o{ adjustment_lines : "uom_id"

' Domain F -> Domain A (Users / RBAC)
users ||--o{ receipts : "assigned_to/assigned_by"
users ||--o{ shipments : "assigned_to/assigned_by"
users ||--o{ cycle_counts : "assigned_to"
users ||--o{ adjustments : "proposed_by/approved_by"
```
