# Checklist API Tuần 4 — Shipment, Transfer, Reversal, Adjustment

Trình bày cập nhật 11/10/2026; hiện trạng code dựa trên lần đọc 09/10/2026, chưa xác minh lại ngày 11/10. Đọc cùng [plan_week4 (1).md](<plan_week4 (1).md>).
Đây là checklist triển khai/nghiệm thu, không phải thông báo tất cả API đã xong.
Lần cập nhật này chỉ đọc code và sửa tài liệu, không gọi HTTP hoặc ghi DB.

**Quy ước:** “Có route” là thấy controller, chưa chứng minh đạt nghiệp vụ. “Đề xuất”
chưa có API trong lần rà soát này. Ô `[ ]` chỉ đánh dấu `[x]` khi có kết quả test,
commit và bằng chứng tương ứng. Unit test hiện có không thay e2e DB.

## Cách dùng checklist

1. Owner triển khai và tự kiểm tra từng endpoint.
2. Reviewer đối chiếu quyền, scope và ca lỗi trước khi đánh dấu đạt.
3. Ghi ngày, commit, môi trường và kết quả thực tế ở mục 6.
4. Hạng mục còn mở giữ ô trống; không dùng test TODO làm bằng chứng đạt.

| Phân hệ          | Backend | Frontend  | Trạng thái tài liệu                               |
| ---------------- | ------- | --------- | ------------------------------------------------- |
| Shipment         | Nam     | Vy        | Contract đã thống nhất; cần bằng chứng nghiệm thu |
| Transfer         | Thuận   | Nhật Quân | Còn quyết định mở ở mục 8 của plan                |
| Reversal         | Trung   | Nhật Quân | Có route, còn lỗi cần sửa trước nghiệm thu        |
| Quick Adjustment | Trung   | Vy        | Tái sử dụng module hiện có                        |

## 1. Chung cho mọi endpoint

- [ ] Swagger đúng method/path/query/body/response và bearer `access-token`.
- [ ] ID BIGINT string dương/max; Decimal string không tính qua Number; DATE/UTC đúng kiểu.
- [ ] DTO whitelist, trim tên/lý do; không nhận actor/role/permission từ body.
- [ ] Tài khoản/role/assignment active; permission và warehouse cùng assignment.
- [ ] Kho của request theo ID đọc từ DB; list/count chung điều kiện scope.
- [ ] List 1/20, limit tối đa 100, offset an toàn, order ổn định.
- [ ] Không lộ hash, secret, toàn entity user hoặc dữ liệu kho khác.
- [ ] 400/401/403/404/409 rõ; lỗi server không che thành lỗi nghiệp vụ.
- [ ] Action ghi tồn có cùng transaction cho phiếu/tồn/ledger/audit; kiểm tra concurrent request.
- [ ] Không UPDATE/DELETE ledger hoặc history dispatch; không ghi trực tiếp qtyAvailable.
- [ ] Unit test, TypeScript/build, diff check đạt; e2e dùng DB riêng, không Neon ứng dụng.

## 2. Shipment — Nam Nguyen

Contract chi tiết giữ ở mục 4.1 của plan. Module đã có code; cần đối chiếu Swagger
và chạy lại các ca liên quan khi tích hợp, không đánh dấu đạt chỉ từ bảng endpoint.

| Đạt | Method / URL                              | Permission                         | Ca nghiệm thu chính                                               |
| --- | ----------------------------------------- | ---------------------------------- | ----------------------------------------------------------------- |
| [ ] | POST /api/shipments                       | SHIPMENT.CREATE (+ASSIGN khi giao) | Snapshot UOM, assignee đúng role/kho, BIGINT/Decimal              |
| [ ] | GET /api/shipments                        | SHIPMENT.READ                      | Scope/Picker chỉ phiếu mình, keyword/status/phân trang/count      |
| [ ] | GET /api/shipments/{id}                   | SHIPMENT.READ                      | Chi tiết không lộ user, đúng scope                                |
| [ ] | PUT /api/shipments/{id}                   | SHIPMENT.UPDATE (+ASSIGN khi đổi)  | Chỉ NEW chưa vận hành; giữ assignee không cần ASSIGN              |
| [ ] | POST /api/shipments/{id}/assign           | SHIPMENT.ASSIGN                    | Picker active/kho, trước lần pick đầu                             |
| [ ] | GET /api/shipments/{id}/fefo-suggestions  | SHIPMENT.READ                      | Không gợi ý tồn hết hạn hoặc scope khác                           |
| [ ] | POST /api/shipments/{id}/reserve          | INVENTORY.RESERVE                  | Mức mong muốn, release 0, version/audit, không ledger             |
| [ ] | POST /api/shipments/{id}/pick             | SHIPMENT.PICK                      | Tổng tích lũy, delta OUT/IN STAGING cùng tx, replay không ghi lại |
| [ ] | POST /api/shipments/{id}/dispatch         | SHIPMENT.DISPATCH                  | Không vượt pick; requestId đúng/khác payload; immutable history   |
| [ ] | GET /api/shipments/{id}/dispatch-lines    | SHIPMENT.READ                      | Lịch sử/phân trang/actor, chỉ kho được phép                       |
| [ ] | POST /api/shipments/{id}/report-shortage  | SHIPMENT.PICK                      | Đúng assignee, actual là tồn đếm, giải phóng reservation/snapshot |
| [ ] | POST /api/shipments/{id}/resolve-shortage | SHIPMENT.UPDATE + Manager/Admin    | Không còn đề xuất mở; không tự reserve hoặc đổi yêu cầu           |
| [ ] | POST /api/shipments/{id}/cancel           | SHIPMENT.CANCEL                    | Chỉ trước pick, release đầy đủ, không xóa lịch sử                 |

- [ ] 100 → xuất 98 PARTIALLY_SHIPPED → xuất 2 SHIPPED; theo từng dòng SKU.
- [ ] DB đúng nhưng thiếu đơn không sinh Adjustment; lệch tồn thực đếm mới báo thiếu.
- [ ] Giữ PARTIALLY_SHIPPED khi tiếp tục bổ sung; PICK_EXCEPTION là ngoại lệ rõ.
- [ ] Rollback khi ledger/history lỗi; concurrency không xuất hoặc reserve hai lần.

## 3. Transfer — Thuan Le

Phần Transfer còn điểm mở ở mục 8 của plan. Tên quyền chưa có trong enum/seed
phải review và seed cùng implementation; không coi mọi tên dưới đây đã tồn tại.

| Đạt | Method / URL mục tiêu             | Quyền/actor                    | Ca nghiệm thu                                                 |
| --- | --------------------------------- | ------------------------------ | ------------------------------------------------------------- |
| [ ] | POST /api/transfers               | TRANSFER.CREATE, Manager nguồn | Hai kho khác nhau, một nguồn/line, snapshot BE                |
| [ ] | GET /api/transfers                | TRANSFER.READ                  | Chuyển đi/nhận về, scope, assignee, count                     |
| [ ] | GET /api/transfers/{id}           | TRANSFER.READ                  | Hai approval và requested/approved/sent/received riêng        |
| [ ] | PUT /api/transfers/{id}           | TRANSFER.UPDATE                | Giữ requested; sửa approved clear hai approval, DRAFT         |
| [ ] | POST /api/transfers/{id}/submit   | TRANSFER.SUBMIT                | DRAFT → PENDING_APPROVAL, dữ liệu/assignee đúng               |
| [ ] | POST /api/transfers/{id}/approve  | TRANSFER.APPROVE               | SOURCE/DESTINATION/BOTH theo quyền; một nút BOTH              |
| [ ] | POST /api/transfers/{id}/reject   | TRANSFER.REJECT                | Review note không đè reason người lập                         |
| [ ] | POST /api/transfers/{id}/assign   | TRANSFER.ASSIGN (đề xuất)      | Picker/Receiver đúng đầu, active và scope                     |
| [ ] | POST /api/transfers/{id}/reserve  | TRANSFER.RESERVE (đề xuất)     | Không vượt approved, đúng tồn khả dụng                        |
| [ ] | POST /api/transfers/{id}/pick     | TRANSFER.PICK (đề xuất)        | Đúng Picker, reservation, báo thiếu trước dispatch            |
| [ ] | POST /api/transfers/{id}/dispatch | TRANSFER.DISPATCH              | Không trừ nguồn hai lần, đủ ledger cho location đổi tồn       |
| [ ] | POST /api/transfers/{id}/receive  | TRANSFER.RECEIVE               | Đúng Receiver, quantity thực, identity/expiry, không vượt gửi |
| [ ] | POST /api/transfers/{id}/cancel   | TRANSFER.CANCEL                | Trước dispatch, release reservation                           |

- [ ] Chốt DISPATCHED thay IN_TRANSIT; PENDING_APPROVAL thay PENDING.
- [ ] Chốt pick/dispatch, receive một/nhiều lần, delta/cumulative và idempotency.
- [ ] Thiếu trước gửi: Picker báo → đối soát → Manager duyệt Adjustment → sửa approved → duyệt lại.
- [ ] Nhận thiếu sau dispatch: DISCREPANCY, lượng còn TRANSIT; chưa dùng Adjustment kho để xóa transit.
- [ ] BOTH kiểm tra quyền cả hai kho và ghi cả hai quyết định cùng tx; vẫn cần Receiver xác nhận nhận.
- [ ] Nếu schema chưa lưu review note/nhận nhiều đợt, chốt phương án trước khi code; không âm thầm thêm bảng.

## 4. Reversal — Trung Pham BE / Nhật Quân FE

Đã có 7 route `/api/reversals/requests`, nhưng chưa đạt mục tiêu plan mới.
Không tạo bộ route khác tên song song. Quyền reverse không thay kiểm tra ADMIN global.

| Đạt | Method / URL                              | Hiện trạng khi đọc code                         | Việc còn phải làm                                                                              |
| --- | ----------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [ ] | POST /api/reversals/requests              | Có route/create, kiểm tra ledger và PENDING     | Manager + READ/REQUEST scope; whitelist chứng từ; P2002 → 409; actor không fallback            |
| [ ] | GET /api/reversals/requests               | Có list, page/limit parseInt, chưa truyền actor | Query DTO/filter, requester/scope/ADMIN, count/order đúng                                      |
| [ ] | GET /api/reversals/requests/{id}          | Có detail, chưa kiểm tra ownership/kho đầy đủ   | Profile nguồn/kết quả, scope và không lộ quan hệ nhạy cảm                                      |
| [ ] | PUT /api/reversals/requests/{id}          | Có kiểm tra requester/PENDING                   | Trim reason, scope hiện tại, cập nhật có điều kiện tránh race                                  |
| [ ] | POST /api/reversals/requests/{id}/cancel  | Có kiểm tra requester/PENDING                   | Actor/scope, đồng thời cancel/approve, không đổi tồn                                           |
| [ ] | POST /api/reversals/requests/{id}/approve | Có route; đường ghi ledger chưa đúng            | ADMIN global khác requester, reverseMovement external tx, locks/whitelist, INSERT reversalOfId |
| [ ] | POST /api/reversals/requests/{id}/reject  | Có route, reviewNote optional                   | ADMIN global khác requester, lý do bắt buộc, trạng thái có điều kiện, audit                    |

#### Các lỗi hiện hữu phải xử lý trước nghiệm thu

- [ ] Bỏ quantity âm/sign 0 đưa vào recordMovement; gọi reversal chuyên dụng đúng API nội bộ.
- [ ] Dùng reference REVERSAL đã seed, không dùng REVERSAL_REQ không tương thích.
- [ ] Không UPDATE ledger sau INSERT: reversalOfId phải được ghi ngay trong INSERT.
- [ ] Không fallback userId=1; thiếu actor xác thực trả 401.
- [ ] Chặn public `POST /api/stock-ledger/{id}/reverse`: target bỏ route, kiểm tra 404; FE đi qua request.
- [ ] Scope list/detail/create từ ledger trong DB; không tin warehouseId/query để mở quyền.
- [ ] Bổ sung note review bắt buộc; duplicate PENDING, terminal status/unique conflict trả 409.
- [ ] ReversalService không tự reopen phiếu gốc hoặc thay shipment dispatch history.

#### Ca test cụ thể

| Đạt | Case                                                               | Kết quả mong muốn                                          |
| --- | ------------------------------------------------------------------ | ---------------------------------------------------------- |
| [ ] | Chọn ledger 99, ledger 100/101 identity khác                       | Chỉ đảo ledger 99; không cascade                           |
| [ ] | Identity giống và có movement sau ledger 99                        | 409, không ghi tồn/ledger/request APPROVED                 |
| [ ] | Ledger gốc +10, tồn hiện tại 50, đủ điều kiện                      | INSERT -10, tồn 40, reversalOfId đúng, ledger gốc bất biến |
| [ ] | Ledger gốc -2, đủ điều kiện                                        | INSERT +2, giữ tracking và kiểm tra STORAGE                |
| [ ] | PICK/PUTAWAY/TRANSFER hoặc Adjustment liên kết phiếu nhiều bước    | Bị chặn, không đảo một vế                                  |
| [ ] | Request cùng ledger PENDING hoặc approve đồng thời                 | Một request/kết quả; request còn lại 409                   |
| [ ] | Duyệt làm tồn dưới reserved/âm hoặc khôi phục SKU khác vào STORAGE | Bị chặn, rollback toàn bộ                                  |
| [ ] | Reject/cancel rồi request lại                                      | Không đổi tồn; tạo mới chỉ khi ledger vẫn đủ điều kiện     |
| [ ] | Requester tự approve, ADMIN scoped hoặc user kho khác              | 403                                                        |
| [ ] | Lỗi ghi review sau reversal                                        | Rollback tồn và ledger trong transaction thật              |
| [ ] | User đọc request người khác / filter requestedBy khác              | Không mở rộng scope; 403 hoặc list đã lọc                  |
| [ ] | ID lớn hơn Number, max BIGINT, zero/âm/chữ/overflow                | Giữ ID đúng; input sai 400                                 |

Unit test approve đang TODO, không tính là đạt. Unit mock không chứng minh trigger
append-only, unique và Serializable; cần e2e DB riêng rồi đối soát ledger/inventory.

## 5. Quick Adjustment — Trung BE / Vy FE

Giữ route và DTO đang triển khai; không tạo Quick Adjust API sửa tồn trực tiếp.

| Đạt | Method / URL                       | Ca kiểm tra                                                |
| --- | ---------------------------------- | ---------------------------------------------------------- |
| [ ] | POST /api/adjustments              | inventoryId/actualQty, server snapshot; DRAFT chưa đổi tồn |
| [ ] | GET /api/adjustments               | Scope/proposer/reviewer, phân trang                        |
| [ ] | GET /api/adjustments/{id}          | Đúng phiếu/kho, snapshot/identity                          |
| [ ] | PUT /api/adjustments/{id}          | Proposer, DRAFT, snapshot mới; không tin systemQty client  |
| [ ] | POST /api/adjustments/{id}/submit  | Proposer, snapshot còn đúng, PENDING_APPROVAL              |
| [ ] | POST /api/adjustments/{id}/cancel  | Proposer, DRAFT/PENDING, không đổi tồn                     |
| [ ] | POST /api/adjustments/{id}/approve | Khác proposer kể cả ADMIN; stale 409; không dưới reserved  |
| [ ] | POST /api/adjustments/{id}/reject  | Body reason; rejectionReason do server lưu; không đổi tồn  |

- [ ] Popup đọc tồn từ BE, không lấy số FE làm snapshot tin cậy.
- [ ] Không gửi locationId/skuId/uomId/systemQty/inventoryVersion trong create DTO.
- [ ] Thiếu hàng của đơn và lệch đếm được giải thích riêng trên UI.

## 6. Bằng chứng bàn giao

| Hạng mục                                  | Kết quả thực tế / link test / commit          |
| ----------------------------------------- | --------------------------------------------- |
| Reversal unit/e2e/concurrency/rollback    | Chưa chạy trong lần sửa tài liệu này          |
| Shipment/Transfer/Adjustment integration  | Chưa chạy lại trong lần sửa tài liệu này      |
| Swagger/FE integration                    | Chưa nghiệm thu theo plan cập nhật            |
| BPMN/Business Rules cập nhật theo scope   | Cần domain owner cập nhật khi chốt triển khai |
| API removal direct reverse thông báo team | Chỉ là target trong plan, code chưa đổi       |

Team ghi ngày/người kiểm tra, số ca đạt/fail, DB test dùng và commit tương ứng;
không đánh dấu đạt từ mô tả tài liệu hoặc test TODO.
