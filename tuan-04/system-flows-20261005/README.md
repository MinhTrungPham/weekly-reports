# BPMN toàn ứng dụng WMS — 05/10/2026

Mở **[index.html](index.html)** trên trình duyệt để xem ảnh, phóng to và tải source.
Mở file `.bpmn` bằng Camunda Modeler hoặc công cụ hỗ trợ BPMN 2.0 để chỉnh sửa.
PNG dùng chèn báo cáo; SVG giữ nét khi phóng lớn. DFD bổ sung có source `.drawio`.

## Các sơ đồ

| File | Nội dung |
|---|---|
| [wms_overview.bpmn](wms_overview.bpmn) | Tổng quan: đăng nhập, chọn chức năng, thực hiện, quay lại hoặc rời ứng dụng |
| [access_rbac.bpmn](access_rbac.bpmn) | Login, access/refresh, kiểm tra user, permission và phạm vi kho |
| [master_data.bpmn](master_data.bpmn) | User/RBAC, kho/vị trí, SKU/UOM/conversion/barcode, supplier |
| [inbound_putaway.bpmn](inbound_putaway.bpmn) | Nhận vào RECEIVING và cất sang STORAGE; validation, transaction, rollback và thử lại |
| [outbound_shipping.bpmn](outbound_shipping.bpmn) | Giữ chỗ, phân công, Pick chuyển sang STAGING, Ship trừ tồn STAGING |
| [warehouse_transfer.bpmn](warehouse_transfer.bpmn) | Điều chuyển hai kho; nêu rõ quyết định chưa chốt về in-transit |
| [cycle_count_inspection.bpmn](cycle_count_inspection.bpmn) | Giao kiểm kê, snapshot, đếm, đối chiếu và chuyển đề xuất sang Adjustment |
| [adjustment_approval.bpmn](adjustment_approval.bpmn) | DRAFT → submit → approve/reject; snapshot stale, reserved, audit và transaction |
| [lookup_reporting.bpmn](lookup_reporting.bpmn) | Tra cứu danh mục/tồn/ledger, tổng khả dụng và tem QR SKU/UOM |
| [ledger_reversal.bpmn](ledger_reversal.bpmn) | Đảo ledger gốc bằng dòng mới; giữ lịch sử, kiểm tra tồn và chống đảo trùng |

DFD bổ sung: [context](dfd_context.svg) và [level 1](dfd_level1.svg).
DFD chỉ thể hiện luồng **dữ liệu**, không phải luồng di chuyển hàng vật lý.

## Cách đọc

- Vòng tròn: bắt đầu/kết thúc; ô tác vụ: bước người dùng hoặc hệ thống; hình thoi X: lựa chọn một nhánh.
- Swimlane phân trách nhiệm giữa người dùng, backend và database. Đây là thiết kế, không phải cấu hình workflow engine để chạy trực tiếp.
- Tổng quan mô tả các chức năng độc lập. Không phải người dùng bắt buộc thực hiện Nhập → Xuất → Chuyển → Kiểm kê trong một chuỗi.
- Nhánh lỗi receive/putaway quay về xử lý hoặc tải lại phiếu. Một request lỗi không có nghĩa phiếu tự bị hủy.
- Các service task ghi rõ validation, scope, snapshot và transaction để thể hiện cách hệ thống hoạt động, thay vì chỉ kể thao tác nghiệp vụ.

## Nguồn và những điểm cần team thống nhất

Nguồn chính: thư mục `D:\LazTar\Tài Liệu\drive-download-20261005T041822Z-1-001`,
gồm `Bussiness_flow.puml`, `02_ERD/erd_all.puml`, bảng tổng Business Rules và
Business Rules Domain D/E, cùng báo cáo `00_Plan/Danh_sach_loi_va_Kiem_thu.md`.
Luồng Nhập/Cất và Adjustment đối chiếu thêm contract đã chốt trong `../week3/README.md`.

| Điểm khác biệt / thiếu trong tài liệu nguồn | Cách thể hiện ở sơ đồ |
|---|---|
| BR-D-04 và báo cáo tích hợp nêu identity chưa có serial | Dùng identity location/SKU/lot/serial của ERD và code hiện tại; NULL vẫn là cùng identity |
| BR-D-09 gắn expiry với is_lot_tracked; ERD tổng chưa có requires_expiry_date | Inbound dùng ba policy độc lập đã chốt tuần 3; nông sản yêu cầu lot và expiry |
| LEDGER.VIEW / INVENTORY.APPROVE / INBOUND.RECEIVE là tên cũ | Dùng catalog hiện tại STOCK_LEDGER.READ / ADJUSTMENT.APPROVE / RECEIPT.RECEIVE |
| Manager trong flow được tạo kho, nhưng BR-B-12 giới hạn ADMIN | Quản trị dùng permission cụ thể; tạo/ngưng kho theo ADMIN, không suy quyền từ tên role |
| Ví dụ “PICK/SHIP -30” không tách rõ thời điểm giảm tồn | Pick là OUT/IN sang STAGING, tổng kho không đổi; Ship trừ STAGING một lần |
| BR-D-11 đề xuất TRANSIT, Domain B chưa xác nhận | Transfer có design gate CHƯA CHỐT; không coi là contract đủ để implement |
| Cycle Count chưa rõ lot/serial và thời điểm snapshot | Sơ đồ chỉ ra yêu cầu nhận diện đúng dòng inventory và chốt thời điểm snapshot |
| Viewer có được đọc ledger không còn khác nhau giữa bảng quyền | Tra cứu dựa trên permission catalog team chốt; không mặc định theo tên role |
| QR và ảnh Cloudinary | QR là render mã SKU/UOM; không mặc định ảnh SKU/chứng từ hoặc upload ảnh là yêu cầu nghiệp vụ |

Đây là **bộ thiết kế tổng**, không phải xác nhận mọi endpoint đã có trong code.
Outbound, Transfer và các nhánh nghiệp vụ chưa chốt phải được hoàn thiện contract trước khi triển khai.
Sơ đồ giữ luồng chính và exception quan trọng; không liệt kê toàn bộ lỗi HTTP hoặc mọi biến thể partial/cancel.

## Kiểm tra file

Đã kiểm tra XML, ID duy nhất và các tham chiếu sequence flow/DI của source BPMN;
node/edge của manifest không có tham chiếu thiếu. Có ảnh PNG/SVG và đã xem ảnh đại diện.
Chưa chạy workflow engine hoặc kiểm chứng semantics bằng simulator BPMN.
Source tài liệu gốc và code ứng dụng không bị sửa bởi việc tạo bộ sơ đồ này.
