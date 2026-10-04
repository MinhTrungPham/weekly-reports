# Bảng permission mặc định cho Mini-WMS

Ngày: 01/10/2026. Trạng thái: **đề xuất để nhóm thống nhất**, chưa phải toàn bộ quyền đã được triển khai.

## 1. Hiện trạng và quy ước

- Seed hiện tại tạo 7 role và gán `USER.MANAGE` cho `ADMIN`.
- Guard Domain A hiện cho ADMIN global hoặc role global có `USER.MANAGE` quản lý user và xem role. Gán role yêu cầu ADMIN global.
- Các permission khác trong tài liệu cần được seed và kiểm tra tại endpoint/service tương ứng mới có hiệu lực.
- `ADMIN` được cấp toàn bộ permission được liệt kê. Dấu `—` trong bảng nghĩa là chỉ ADMIN được cấp mặc định.

| Ký hiệu | Role code | Vai trò |
| --- | --- | --- |
| M | `WH_MANAGER` | Quản lý kho |
| S | `SUPERVISOR` | Giám sát ca |
| R | `RECEIVER` | Nhân viên nhận hàng |
| P | `PICKER` | Nhân viên soạn hàng |
| I | `INSPECTOR` | Nhân viên kiểm kê/kiểm tra |
| V | `VIEWER` | Người chỉ xem |

## 2. Danh mục permission và role được cấp mặc định

| Module | Permission | Ý nghĩa | Role khác được cấp |
| --- | --- | --- | --- |
| User | `USER.MANAGE` | Xem, tạo, sửa và khóa tài khoản | — |
| Role | `ROLE.READ` | Xem danh sách role | — |
| Role | `ROLE.MANAGE` | Tạo, sửa, bật/tắt role | — |
| Permission | `PERMISSION.READ` | Xem danh sách permission | — |
| Permission | `ROLE_PERMISSION.MANAGE` | Gán/gỡ permission của role | — |
| User role | `USER_ROLE.ASSIGN` | Gán/kích hoạt lại role cho user theo scope | — |
| User role | `USER_ROLE.REVOKE` | Vô hiệu hóa assignment của user | — |
| Cấu hình | `SYSTEM_CONFIG.READ` | Xem cấu hình hệ thống | — |
| Cấu hình | `SYSTEM_CONFIG.UPDATE` | Cập nhật cấu hình hệ thống | — |
| Kho | `WAREHOUSE.READ` | Xem kho được phép truy cập | M, S, R, P, I, V |
| Kho | `WAREHOUSE.CREATE` | Tạo kho | — |
| Kho | `WAREHOUSE.UPDATE` | Sửa thông tin kho | M |
| Kho | `WAREHOUSE.DEACTIVATE` | Ngừng hoạt động kho khi đủ điều kiện | — |
| Vị trí | `LOCATION.READ` | Xem cây vị trí kho | M, S, R, P, I, V |
| Vị trí | `LOCATION.CREATE` | Tạo vị trí | M |
| Vị trí | `LOCATION.UPDATE` | Sửa vị trí | M |
| Vị trí | `LOCATION.DEACTIVATE` | Ngừng sử dụng vị trí khi đủ điều kiện | M |
| SKU | `SKU.READ` | Xem hàng hóa | M, S, R, P, I, V |
| SKU | `SKU.CREATE` | Tạo hàng hóa | — |
| SKU | `SKU.UPDATE` | Sửa hàng hóa | — |
| SKU | `SKU.DEACTIVATE` | Ngừng sử dụng hàng hóa | — |
| UOM | `UOM.READ` | Xem đơn vị tính | M, S, R, P, I, V |
| UOM | `UOM.CREATE` | Tạo đơn vị tính | — |
| UOM | `UOM.UPDATE` | Sửa đơn vị tính | — |
| UOM | `UOM.DEACTIVATE` | Ngừng sử dụng đơn vị tính | — |
| Quy đổi | `SKU_CONVERSION.READ` | Xem quy đổi đơn vị của SKU | M, S, R, P, I |
| Quy đổi | `SKU_CONVERSION.MANAGE` | Thêm, sửa, gỡ quy đổi khi đủ điều kiện | — |
| Barcode | `SKU_BARCODE.READ` | Tra cứu barcode của SKU | M, S, R, P, I, V |
| Barcode | `SKU_BARCODE.MANAGE` | Thêm, sửa, gỡ barcode | — |
| Nhà cung cấp | `SUPPLIER.READ` | Xem nhà cung cấp | M, R |
| Nhà cung cấp | `SUPPLIER.CREATE` | Tạo nhà cung cấp | — |
| Nhà cung cấp | `SUPPLIER.UPDATE` | Sửa nhà cung cấp | — |
| Nhà cung cấp | `SUPPLIER.DEACTIVATE` | Ngừng sử dụng nhà cung cấp | — |
| SKU–NCC | `SKU_SUPPLIER.READ` | Xem nhà cung cấp của từng SKU | M, R |
| SKU–NCC | `SKU_SUPPLIER.MANAGE` | Quản lý liên kết SKU–nhà cung cấp | — |
| Tồn kho | `INVENTORY.READ` | Xem tồn thực tế, giữ chỗ và trạng thái tồn | M, S, R, I |
| Tồn khả dụng | `INVENTORY.AVAILABLE.READ` | Xem lượng tồn khả dụng | M, S, R, P, I, V |
| Giữ chỗ | `INVENTORY.RESERVE` | Giữ chỗ tồn cho nghiệp vụ xuất hàng | — |
| Giữ chỗ | `INVENTORY.RELEASE` | Hủy giữ chỗ theo nghiệp vụ | — |
| Sổ cái | `STOCK_LEDGER.READ` | Xem lịch sử biến động tồn | M, S, I |
| Sổ cái | `STOCK_LEDGER.REVERSE` | Tạo giao dịch đảo có lý do và tham chiếu | — |
| Nhập hàng | `RECEIPT.READ` | Xem phiếu nhập | M, S, R |
| Nhập hàng | `RECEIPT.CREATE` | Tạo phiếu nhập | — |
| Nhập hàng | `RECEIPT.UPDATE` | Sửa phiếu nhập trước khi xử lý | — |
| Nhập hàng | `RECEIPT.CANCEL` | Hủy phiếu nhập khi đủ điều kiện | — |
| Nhập hàng | `RECEIPT.RECEIVE` | Xác nhận nhận hàng | R |
| Nhập hàng | `RECEIPT.REPORT_DISCREPANCY` | Báo thiếu, thừa hoặc sai hàng | R |
| Putaway | `PUTAWAY.READ` | Xem công việc đưa hàng vào vị trí lưu trữ | M, S, R |
| Putaway | `PUTAWAY.CONFIRM` | Xác nhận putaway được giao | R |
| Xuất hàng | `SHIPMENT.READ` | Xem phiếu xuất | M, S |
| Xuất hàng | `SHIPMENT.CREATE` | Tạo phiếu xuất | — |
| Xuất hàng | `SHIPMENT.UPDATE` | Sửa phiếu xuất trước khi xử lý | — |
| Xuất hàng | `SHIPMENT.CANCEL` | Hủy phiếu xuất khi đủ điều kiện | — |
| Xuất hàng | `SHIPMENT.CONFIRM` | Xác nhận giao/xuất hàng | — |
| Task | `TASK.READ` | Xem công việc và tiến độ | M, S |
| Task | `TASK.CREATE` | Tạo công việc nghiệp vụ | S |
| Task | `TASK.ASSIGN` | Giao công việc | S |
| Task | `TASK.REASSIGN` | Đổi người thực hiện | S |
| Task | `TASK.CANCEL` | Hủy công việc chưa hoàn tất | S |
| Picking | `PICK_TASK.READ` | Xem công việc soạn hàng | M, S, P |
| Picking | `PICK_TASK.CONFIRM` | Xác nhận soạn hàng theo task được giao | P |
| Kiểm kê | `CYCLE_COUNT.READ` | Xem phiên kiểm kê | M, S, I |
| Kiểm kê | `CYCLE_COUNT.CREATE` | Tạo phiên kiểm kê | S |
| Kiểm kê | `CYCLE_COUNT.ASSIGN` | Giao người kiểm kê | S |
| Kiểm kê | `CYCLE_COUNT.COUNT` | Ghi nhận số lượng đếm | I |
| Kiểm kê | `CYCLE_COUNT.SUBMIT` | Nộp kết quả kiểm kê | I |
| Kiểm kê | `CYCLE_COUNT.REVIEW` | Rà soát kết quả kiểm kê | S |
| Kiểm kê | `CYCLE_COUNT.CANCEL` | Hủy phiên kiểm kê khi đủ điều kiện | S |
| Chất lượng | `QUALITY.READ` | Xem kết quả kiểm tra chất lượng | M, S, I |
| Chất lượng | `QUALITY.INSPECT` | Ghi nhận kết quả kiểm tra | I |
| Điều chỉnh | `ADJUSTMENT.READ` | Xem đề xuất điều chỉnh tồn | M, I |
| Điều chỉnh | `ADJUSTMENT.CREATE` | Tạo đề xuất điều chỉnh | I |
| Điều chỉnh | `ADJUSTMENT.UPDATE` | Sửa đề xuất của mình khi còn nháp | I |
| Điều chỉnh | `ADJUSTMENT.SUBMIT` | Gửi đề xuất để duyệt | I |
| Điều chỉnh | `ADJUSTMENT.APPROVE` | Duyệt đề xuất của người khác | M |
| Điều chỉnh | `ADJUSTMENT.REJECT` | Từ chối đề xuất của người khác | M |

### Lựa chọn mặc định trong bảng

- `INVENTORY.RESERVE/RELEASE` chỉ cấp ADMIN mặc định. Backend có thể thực hiện giữ/hủy giữ chỗ trong luồng shipment sau khi xác thực quyền và kiểm tra nghiệp vụ; Picker không cần quyền gọi trực tiếp API reserve/release.
- `SHIPMENT.CONFIRM` chỉ cấp ADMIN mặc định theo phạm vi role đã bàn. Nhóm cần bổ sung người phụ trách giao hàng khi triển khai luồng xuất.
- `TASK` là lớp nghiệp vụ điều phối chung; picking và putaway có quyền xác nhận riêng. Schema task cụ thể cần được thiết kế khi triển khai.
- Login, refresh và xem hồ sơ của chính mình dùng cơ chế xác thực, không yêu cầu permission riêng trong bảng này.
- Bảng bao phủ các module đã bàn; chưa định nghĩa quyền cho nghiệp vụ chuyển kho, trả hàng hoặc báo cáo chưa được chốt.

## 3. Quy tắc scope và kiểm tra nghiệp vụ

### Phân quyền

1. User phải có trạng thái ACTIVE. Assignment và role đều phải active.
2. Permission và scope phải được kiểm tra trên cùng assignment; không ghép permission từ role ở kho A với scope của role ở kho B.
3. `user_roles.warehouse_id = null` nghĩa là các permission của assignment áp dụng toàn hệ thống; không tự biến role đó thành ADMIN.
4. Các assignment nghiệp vụ mặc định của Manager, Supervisor, Receiver, Picker, Inspector và Viewer gắn với kho cụ thể.
5. API thao tác bản ghi kho phải đối chiếu kho của bản ghi thực tế. Không chỉ tin `warehouseId` gửi từ client. API danh sách phải lọc dữ liệu theo scope được phép.
6. Gán/gỡ role và thay đổi RBAC yêu cầu ADMIN toàn hệ thống. ADMIN riêng một kho không được sử dụng quyền quản trị toàn hệ thống.
7. SKU, UOM, conversion, barcode và supplier hiện là danh mục chung; quyền đọc các danh mục này không giới hạn theo kho vì schema chưa có liên kết sở hữu theo kho.
8. Việc gán `USER.MANAGE` cho role khác là tùy chỉnh sau này; chỉ assignment global có quyền đó mới qua được policy quản lý user hiện tại.

### Task, chứng từ và tồn kho

- Picker chỉ READ/CONFIRM pick task được giao cho mình. Manager/Supervisor được đọc để điều phối trong kho được gán.
- Receiver chỉ xác nhận công việc nhận hàng/putaway được giao. Có permission vẫn phải kiểm tra người thực hiện và trạng thái chứng từ.
- Inspector chỉ COUNT/SUBMIT phiên kiểm kê được giao và chỉ sửa proposal của mình khi còn nháp.
- Người tạo hoặc gửi adjustment không được tự duyệt, kể cả khi có cả role Manager và Inspector hoặc là ADMIN.
- Review kết quả kiểm kê không đồng nghĩa với quyền approve adjustment.
- Xác nhận nhận hàng, putaway, picking, shipment hoặc duyệt adjustment phải gọi `InventoryLedgerService` khi cần thay đổi tồn.
- Không cấp quyền ghi trực tiếp `inventory` hay update/delete `stock_ledger`. ADMIN vẫn tuân thủ constraint và nguyên tắc append-only; sửa lịch sử thông qua giao dịch đảo hợp lệ.
- Mỗi nghiệp vụ phải kiểm tra trạng thái và chống ghi nhận trùng để request lặp lại không cập nhật tồn hai lần.

## 4. Có cần thêm bảng nghiệp vụ ngay không?

**Chưa cần thêm tất cả bảng ngay.** Domain A hiện đã có đủ các bảng nền tảng:

```text
users
roles
permissions
role_permissions
user_roles
```

Có thể seed danh mục permission đã được nhóm chốt mà không cần tạo bảng nghiệp vụ tương ứng. Seed chỉ tạo dữ liệu quyền; endpoint/service phải kiểm tra quyền mới thực thi được.

ERD/schema hiện tại có warehouse, location, SKU, UOM, conversion, barcode, supplier, inventory và stock ledger. Task, receipt, shipment, cycle count, quality và adjustment workflow chưa có bảng nghiệp vụ riêng.

| Khi bắt đầu triển khai | Nhóm bảng cần thiết |
| --- | --- |
| Nhập hàng | Phiếu nhập và các dòng hàng |
| Điều phối/picking/putaway | Task và dữ liệu chi tiết của từng loại task |
| Xuất hàng | Phiếu xuất và các dòng hàng |
| Kiểm kê | Phiên kiểm kê và kết quả đếm |
| Điều chỉnh có duyệt | Đề xuất điều chỉnh, dòng điều chỉnh và thông tin duyệt |
| Kiểm tra chất lượng | Hồ sơ kiểm tra và kết quả |

Nếu triển khai `ADJUSTMENT.CREATE/SUBMIT/APPROVE` thì phải thêm bảng adjustment cùng đợt. Stock ledger lưu giao dịch đã ghi nhận, không thay thế dữ liệu đề xuất nháp, chờ duyệt và quyết định duyệt.

## 5. Lưu ý khi tích hợp với code hiện tại

- Giữ tên role `WH_MANAGER` thay vì tạo thêm role `MANAGER`.
- Mã permission dùng trong seed, decorator và service phải giống nhau hoàn toàn. `INVENTORY.AVAILABLE.READ` có thể được lưu với module `INVENTORY.AVAILABLE` và action `READ`.
- `ROLE.READ`, `USER_ROLE.ASSIGN` và các mã RBAC mới là thiết kế mở rộng. Code hiện vẫn dùng policy `USER.MANAGE` cho GET roles và policy ADMIN global cho gán role; cần cập nhật đồng bộ khi áp dụng bảng này.
- ADMIN nên được gán từng permission trong danh mục, không seed permission giả `*` khi guard chưa hỗ trợ wildcard. Khi bổ sung permission mới, cập nhật seed cho ADMIN.
- Permission là danh mục do ứng dụng định nghĩa. Thêm một mã bất kỳ trong DB không tự tạo API hoặc chức năng mới.
- Bảng này chưa tự thay đổi DB, guard hay API. Việc triển khai cần được thống nhất với thành viên phụ trách từng domain.
