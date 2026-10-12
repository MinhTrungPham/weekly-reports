# WMS — Kế hoạch triển khai Tuần 4

**DEMO 2 · Xuất kho · Chuyển kho · Bút toán đảo**

| Thông tin            | Nội dung                                                             |
| -------------------- | -------------------------------------------------------------------- |
| Phiên bản tài liệu   | 1.2 — cập nhật ngày 11/10/2026                                       |
| Đối tượng đọc        | Thành viên Backend, Frontend và người nghiệm thu                     |
| Phạm vi              | Hoàn thiện luồng kho; hoàn thiện kế hoạch reversal và điều chỉnh tồn |
| Tài liệu đi kèm      | [Checklist API Tuần 4](WEEK4_API_CHECKLIST.md)                       |
| Cơ sở đối chiếu code | Rà soát ngày 09/10/2026; chưa xác minh lại code hoặc DB ngày 11/10   |

> **Cách đọc:** Shipment giữ contract đã thống nhất. Reversal là mục tiêu hoàn
> thiện trên module hiện có. Transfer còn điểm cần team chốt. Nội dung tài liệu không thay thế kết quả kiểm thử.

## Mục lục

1. [Mục tiêu và ưu tiên](#1-muc-tieu)
2. [Kịch bản demo](#2-demo)
3. [Màn hình cần chuẩn bị](#3-ui)
4. [Contract API và quy tắc nghiệp vụ](#4-api)
   - [Shipment](#shipment) · [Transfer](#transfer) · [Reversal](#reversal)
   - [Quick Adjustment](#adjustment)
5. [Nguyên tắc kỹ thuật](#5-ky-thuat)
6. [Phân công hiện có](#6-phan-cong)
7. [Công việc bổ sung và bàn giao](#7-ban-giao)
8. [Các quyết định Transfer còn mở](#8-diem-mo)
9. [Checklist API](#9-checklist)

---

<a id="1-muc-tieu"></a>

## 1. Mục tiêu và thứ tự ưu tiên

- **Trọng tâm 1 (Xuất kho - Shipment):** Tách bạch rõ 2 bước: **Reserve (Giữ chỗ)** và **Pick (Soạn hàng vào STAGING)**. Giao hàng thiếu sẽ dẫn tới trạng thái `PARTIALLY_SHIPPED`.
- **Trọng tâm 2 (Chuyển kho - Transfer):** Phối hợp 2 Manager (Nguồn/Đích). Hàng đi qua trạng thái trung gian `TRANSIT` để tránh thất thoát. Quản lý xử lý ngoại lệ nếu nhận thiếu.
- **Trọng tâm 3 (Reversal & Adjustment):** Nhân viên báo sai → Manager đối soát/lập request → ADMIN toàn hệ thống khác requester duyệt. Chỉ đảo đúng ledger đủ điều kiện, không cascade. Quick Adjustment tạo DRAFT rồi submit riêng.

| Ưu tiên | Hạng mục                            | Điều kiện bàn giao                                          |
| ------- | ----------------------------------- | ----------------------------------------------------------- |
| P0      | Shipment và nghiệp vụ tồn liên quan | Giao từng phần đúng, không ghi tồn/ledger trùng             |
| P0      | Reversal và Quick Adjustment        | Quyền/snapshot/transaction đúng; đường bypass được xử lý    |
| P0      | Transfer                            | Chốt mục 8 trước triển khai; duyệt hai đầu và đối soát đúng |

Các hạng mục P0 là ưu tiên đề xuất cho team, không phải deadline đã cam kết.

---

<a id="2-demo"></a>

## 2. Kịch bản demo và tiêu chí hoàn thành

### 2.1. Xuất từng phần và giao bổ sung

| Bước | Người thực hiện                       | Thao tác                                         | Kết quả hệ thống                                      |
| ---- | ------------------------------------- | ------------------------------------------------ | ----------------------------------------------------- |
| 1    | Supervisor                            | Tạo Shipment yêu cầu 100, giao Picker            | Giữ yêu cầu gốc theo từng dòng SKU                    |
| 2    | Người có INVENTORY.RESERVE đúng kho   | Khi DB thực có 98, reserve 98                    | Không sinh Adjustment vì tồn DB không sai             |
| 3    | Picker được giao                      | Pick 98 từ STORAGE sang STAGING                  | Ledger OUT/IN cùng transaction; toàn kho chưa giảm    |
| 4    | Người có SHIPMENT.DISPATCH đúng scope | Dispatch 98                                      | Tồn STAGING giảm; PARTIALLY_SHIPPED; lưu lịch sử xuất |
| 5    | Nhân viên theo nhiệm vụ được giao     | Sau khi có hàng bổ sung, reserve/pick/dispatch 2 | Cùng Shipment chuyển SHIPPED; giữ lịch sử cả hai lần  |

**Ngoại lệ khác:** nếu DB ghi 100 nhưng đếm được 98, Picker dùng report-shortage.
Hệ thống tạo đề xuất chênh lệch và PICK_EXCEPTION; Manager khác proposer duyệt
Adjustment. Không coi thiếu tồn thực đếm và thiếu hàng đáp ứng đơn là một việc.

### 2.2. Chuyển kho và duyệt hai đầu

| Bước | Người thực hiện                                 | Thao tác                                 | Điểm cần kiểm tra                                      |
| ---- | ----------------------------------------------- | ---------------------------------------- | ------------------------------------------------------ |
| 1    | Manager nguồn                                   | Lập Transfer, xác định hàng và Picker    | Kho nguồn khác kho đích, snapshot nguồn hợp lệ         |
| 2    | Manager từng kho                                | Duyệt SOURCE và DESTINATION              | Chỉ APPROVED khi có đủ hai quyết định                  |
| 3    | Manager có quyền cả hai kho, nếu cùng một người | Dùng một nút BOTH                        | Ghi hai quyết định trong một transaction               |
| 4    | Picker/người gửi có quyền                       | Pick và dispatch theo contract được chốt | Không trừ nguồn hai lần; theo dõi hàng tại BIN TRANSIT |
| 5    | Receiver kho đích                               | Xác nhận lượng thực nhận và vị trí       | Đúng người được giao; không vượt lượng gửi             |
| 6    | Hệ thống                                        | Đối soát gửi 10, nhận 8                  | DISCREPANCY, còn 2 tại TRANSIT; chưa tự xóa chênh lệch |

Nhận đủ và xử lý đầy đủ các bước được chốt thì COMPLETED. **Chi tiết pick/dispatch,
nhận một hay nhiều đợt và giải quyết thiếu sau dispatch còn phải chốt tại mục 8.**

### 2.3. Báo sai và yêu cầu đảo bút toán

| Bước | Người thực hiện                    | Thao tác                                                                 | Kết quả                                       |
| ---- | ---------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------- |
| 1    | Nhân viên                          | Báo ledger ID, chứng từ, số sai và lý do cho Supervisor/Manager          | Chưa đổi tồn; dùng kênh nội bộ hiện có        |
| 2    | Manager                            | Đối soát và tạo request chính thức                                       | PENDING, gắn đúng originalLedgerId            |
| 3    | ADMIN toàn hệ thống khác requester | Kiểm tra và approve/reject                                               | Kiểm tra lại scope, whitelist, lịch sử và tồn |
| 4    | Backend                            | Nếu đủ điều kiện, INSERT ledger ngược dấu và lưu review cùng transaction | APPROVED; giữ nguyên ledger gốc               |

Nếu reject/cancel: không đổi tồn. Nếu có movement mới trên cùng identity hoặc
chứng từ nhiều vế: chặn đảo lẻ và hướng dẫn đối soát theo quy trình Adjustment.
Không tự đảo toàn bộ ledger hoặc các dòng 100/101 khi người dùng chọn dòng 99.

### 2.4. Điều chỉnh nhanh từ Inventory

Manager mở popup theo inventoryId → nhập actualQty/reason → tạo DRAFT → submit
PENDING_APPROVAL → reviewer có quyền, khác proposer, approve/reject. Snapshot
do BE đọc; stale trả 409. Không có bước sửa tồn trực tiếp từ popup.

<a id="3-ui"></a>

## 3. Danh sách UI Cần chuẩn bị

- **Giao diện Chung**: Có bộ chọn Warehouse trong scope được gán. Role hiển thị quyền hiện có, không cho mượn quyền hoặc tự đổi role để vượt RBAC; BE kiểm tra mọi request.
- **Màn hình Xuất kho (Shipment)**:
  - Giao diện Supervisor: Chọn reserve, assign.
  - Giao diện Picker: List lấy hàng.
  - Giao diện STAGING/Dispatch: Giao diện chốt xuất hàng cuối cùng.
- **Màn hình Chuyển kho (Transfer)**:
  - Tab Chuyển đi và Nhận về. Hai đầu đều có luồng duyệt và pick/receive.
- **Màn hình Quản lý Tồn kho**:
  - Nút "Điều chỉnh (Quick Adjust)". Form popup hiển thị `qtyOnHand`, `qtyReserved`, `qtyAvailable`.
- **Màn hình Bút toán đảo**:
  - Manager tạo/theo dõi yêu cầu; ADMIN xem hàng chờ, đối soát và review.

---

<a id="4-api"></a>

## 4. API, phân quyền, DTO và tác động DB — contract triển khai và điểm cần chốt

_Lưu ý chung: BIGINT → String, Decimal → String. Audit fields lấy từ user đã xác thực. DATE YYYY-MM-DD, timestamp ISO UTC. Phân trang mặc định 1/20, tối đa 100; whitelist DTO, offset an toàn; Swagger bearer access-token. Quyền đề xuất hoặc ca chưa kiểm thử không coi là đã hoàn tất._

<a id="shipment"></a>

### 4.1. Xuất kho (Shipment) — cập nhật 2026-10-08

Backend/Swagger của Nam: giữ yêu cầu gốc, xuất từng phần và bổ sung sau. SHIPPED là đã xuất khỏi kho, chưa triển khai theo dõi giao hàng ngoài kho. Contract dưới đây thay phần Shipment cũ; các phân hệ khác giữ kế hoạch riêng.

#### Contract đã thống nhất

Response `{ statusCode, message, data }`; list thêm `meta`.
ID BIGINT và quantity là string. DATE `YYYY-MM-DD`, timestamp ISO UTC.
Không gửi actor/audit trong body. Chỉ lấy tồn của đúng inventory nguồn;
mỗi dòng một nguồn tại một thời điểm. Nhiều nguồn đồng thời phải tách dòng.
Swagger dùng bearer `access-token`, không thêm chữ Bearer khi Authorize.

| Method | URL dưới `/api/shipments` | Permission                                  |
| ------ | ------------------------- | ------------------------------------------- |
| POST   | `/`                       | SHIPMENT.CREATE; thêm ASSIGN nếu gán ngay   |
| GET    | `/`                       | SHIPMENT.READ, lọc scope/người được giao    |
| GET    | `/{id}`                   | SHIPMENT.READ                               |
| PUT    | `/{id}`                   | SHIPMENT.UPDATE; đổi/bỏ assignee cần ASSIGN |
| POST   | `/{id}/assign`            | SHIPMENT.ASSIGN                             |
| GET    | `/{id}/fefo-suggestions`  | SHIPMENT.READ                               |
| POST   | `/{id}/reserve`           | INVENTORY.RESERVE                           |
| POST   | `/{id}/pick`              | SHIPMENT.PICK, đúng Picker được giao        |
| POST   | `/{id}/dispatch`          | SHIPMENT.DISPATCH                           |
| GET    | `/{id}/dispatch-lines`    | SHIPMENT.READ                               |
| POST   | `/{id}/report-shortage`   | SHIPMENT.PICK, đúng Picker được giao        |
| POST   | `/{id}/resolve-shortage`  | SHIPMENT.UPDATE, Manager/Admin              |
| POST   | `/{id}/cancel`            | SHIPMENT.CANCEL                             |

POST tạo/report trả 201; các action khác trả 200. Empty action body `{}`.
Picker chỉ đọc/thực hiện phiếu của mình, ADMIN global được thực hiện thay.
Supervisor/Manager/Admin được dispatch theo scope; không tạo role DISPATCHER.
Kho, role và assignment phải active; service lấy kho từ phiếu, không tin body
cho request theo ID. List lọc warehouseId/status/assignedTo/keyword/page/limit,
mặc định 1/20, tối đa 100, createdAt DESC/id DESC; history shippedAt DESC/id DESC.

#### 4.1.1. Tạo, sửa và giao Picker

```json
{
  "warehouseId": "1",
  "customerInfo": "Khách hàng A",
  "assignedTo": "5",
  "lines": [
    {
      "skuId": "1",
      "uomId": "2",
      "sourceLocationId": "10",
      "requestedQty": "10"
    }
  ]
}
```

PUT cùng nội dung nhưng không có warehouseId, thay toàn bộ nội dung.
Chỉ sửa NEW chưa reserve/pick. Assignee phải ACTIVE có role PICKER active
ở kho hoặc global. Assign `{ "assignedTo": "5" }`, chỉ trước lần pick đầu.
SKU/UOM active; factor snapshot từ conversion, base UOM dùng factor 1.
Không làm tròn quy đổi; quantity tối đa DECIMAL(18,4). Serial dùng base UOM,
requestedQty 1. Response có `lines`, không lộ toàn bộ quan hệ/user entity.
Snapshot legacy NULL chỉ đọc được; không suy lịch sử xuất từ pickedQty.

#### 4.1.2. Reserve — mức còn giữ mong muốn

```json
{
  "lines": [
    { "shipmentLineId": "1", "sourceInventoryId": "100", "reservedQty": "8" }
  ]
}
```

Server quy đổi reservedQty theo factor snapshot. Gửi 0 để giải phóng.
Không nhận sourceLocationId/reservedBaseQty từ client. Nguồn phải đúng SKU,
kho, STORAGE active/pickable, chưa hết hạn. Không vượt yêu cầu chưa pick hoặc
tồn khả dụng; thiếu tồn trả 409, người gọi gửi lượng thấp hơn nếu muốn giao phần.
Reservation đổi version/audit nhưng không ghi ledger. Đổi nguồn tuần tự chỉ
khi reservation cũ bằng 0 và pickedBaseQty = shippedBaseQty.

#### 4.1.3. Pick — tổng tích lũy theo UOM dòng phiếu

```json
{
  "lines": [
    { "shipmentLineId": "1", "pickedQty": "8", "stagingLocationId": "99" }
  ]
}
```

Server tính delta từ tổng cũ, giảm reservation rồi ghi PICK_OUT nguồn và
PICK_IN STAGING trong một transaction. Giữ lot/serial/expiry. Không giảm
tổng pick, không vượt reservation/yêu cầu. Gửi lại cùng tổng và BIN không ghi
lần hai. Gửi tổng 10 sau tổng 8 nghĩa là pick bổ sung 2, không phải thêm 10.
STAGING active cùng kho. Chỉ đổi STAGING khi đợt cũ đã xuất hết.

#### 4.1.4. Dispatch — số lượng xuất trong lần này

```json
{
  "dispatchCode": "DSP-001",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "lines": [
    {
      "shipmentLineId": "1",
      "stagingInventoryId": "200",
      "shippedBaseQty": "96"
    }
  ]
}
```

Không vượt phần đã pick chưa xuất/yêu cầu còn lại. Inventory phải đúng identity
STAGING của dòng, không hết hạn. Ghi SHIP_OUT, immutable dispatch history,
tổng xuất và status cùng transaction. requestId cùng nội dung trả lịch sử đã
lưu, không ghi lại; khác nội dung/tập dòng trả 409. Status trả theo trạng thái
phiếu hiện tại. Đối chiếu hoàn tất từng dòng, không cộng quantity nhiều SKU.

| Điều kiện                                     | Status            |
| --------------------------------------------- | ----------------- |
| Tạo mới                                       | NEW               |
| Có reservation và Picker, chưa pick           | ASSIGNED          |
| Chờ hàng, chưa xuất/pick và không còn reserve | WAITING_STOCK     |
| Đã pick một phần chưa dispatch                | PARTIALLY_PICKED  |
| Tất cả dòng pick đủ chưa dispatch             | STAGED            |
| Đã xuất một phần                              | PARTIALLY_SHIPPED |
| Tất cả dòng xuất đủ                           | SHIPPED           |
| Báo lệch tồn chưa xử lý                       | PICK_EXCEPTION    |
| Hủy trước pick, giải phóng reservation        | CANCELLED         |

Giữ PICKING cho dữ liệu cũ; không sinh PICKED. Sau khi xuất một phần,
giữ PARTIALLY_SHIPPED trong lúc bổ sung, ngoại trừ PICK_EXCEPTION.
Ví dụ 10 BOX × 12: xuất 96 → PARTIALLY_SHIPPED; bổ sung 24 → SHIPPED.

#### 4.1.5. Báo thiếu — phân biệt hai nghiệp vụ

- DB có đúng 98, đơn cần 100: reserve/pick/dispatch 98 và chờ 2; không Adjustment.
- DB ghi 100, đếm thực tế 98: báo chênh lệch tồn, chờ Manager duyệt Adjustment.

```json
{
  "reason": "Kiểm đếm thiếu hàng",
  "lines": [{ "shipmentLineId": "1", "actualQty": "98" }]
}
```

actualQty là tổng tồn thực đếm ở inventory nguồn theo base UOM, không phải
lượng còn thiếu của đơn. Giải phóng reservation của dòng đang báo, snapshot
version sau giải phóng, tạo PENDING_APPROVAL và đưa phiếu vào PICK_EXCEPTION.
Chưa thay đổi on-hand. Manager duyệt/reject qua Adjustment hiện có; không tự
duyệt. Nếu actual thấp hơn reserved của phiếu khác, phải xử lý reservation
liên quan trước khi duyệt. Version thay đổi trả 409, không tự tính lại.

Manager/Admin gọi resolve-shortage `{}` khi không còn đề xuất DRAFT/PENDING.
Không tự khôi phục reservation hoặc đổi yêu cầu gốc. Sau đó reserve lại phần
còn thiếu. Đề xuất stale: Manager reject hoặc proposer có quyền cancel; resolve
rồi kiểm đếm/lập lại. Picker không được cấp quyền Adjustment tổng quát.
Các đề xuất CANCELLED cũng là trạng thái đã đóng để tránh phiếu bị kẹt.
Không có bước Supervisor duyệt riêng trong phiên bản này.

<a id="transfer"></a>

### 4.2. Chuyển kho (Transfer)

> Phần dưới giữ mô tả gốc của Thuận để đối chiếu. Các điểm cần chốt tại mục 8
> chưa được coi là contract đã nghiệm thu; đặc biệt PENDING/IN_TRANSIT, duyệt
> SOURCE/DESTINATION/BOTH và ledger hai vế cho TRANSIT. Không code theo ví dụ
> chưa chốt rồi bỏ qua schema hiện có.
> **Quyền:** `TRANSFER.READ/CREATE/UPDATE/SUBMIT/ASSIGN/APPROVE/REJECT/RESERVE/PICK/DISPATCH/RECEIVE/CANCEL`

---

**a. Tạo Draft (Kho Nguồn: `POST /api/transfers`)**

- **Tác động DB:**
  - **`transfers`**: Insert 1 dòng (Trạng thái `DRAFT`). Lưu `sourceWarehouseId`, `destinationWarehouseId`, `pickerId`, `reason`.
  - **`transfer_lines`**: Insert chi tiết sản phẩm và `requestedBaseQty`.
- **Request (`CreateTransferDto`)**:

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

- **Response**:

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

- **Tác động DB**: Update `transfers` hoặc `transfer_lines`. Chỉ áp dụng khi status `DRAFT` hoặc `PENDING`.
- **Request (`UpdateTransferDto`)**:

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

- **Tác động DB**: Cập nhật status `DRAFT` -> `PENDING_APPROVAL`. (Body rỗng).

---

**d. Duyệt Phiếu (Kho Đích: `POST /api/transfers/{id}/approve`)**

- **Tác động DB**:
  - **`transfers`**: Cập nhật `status = APPROVED`. Ghi người duyệt (`destinationApprovedBy`), thời gian duyệt (`destinationApprovedAt`), và chỉ định nhân viên nhận hàng (`receiverId`).
- **Request (`ApproveTransferDto`)**:

```json
{ "receiverId": "6" }
```

---

**e. Từ chối (`POST /api/transfers/{id}/reject`)**

- **Tác động DB**: Cập nhật status `REJECTED`, lưu lý do từ chối mà không đè lên `reason` gốc.
- **Request (`RejectTransferDto`)**:

```json
{ "reviewNote": "Kho đích hiện không đủ diện tích chứa" }
```

---

**f. Gửi đi - Dispatch (`POST /api/transfers/{id}/dispatch`)**

- **Tác động DB (Bắt buộc dùng Transaction):**
  - **`transfers`**: Chuyển status sang `IN_TRANSIT`. Ghi `dispatchedBy`, `dispatchedAt`.
  - **`transfer_lines`**: Ghi số lượng đã gửi thực tế vào `sentBaseQty`.
  - **`inventory` (Kho nguồn)**: Trừ lượng tồn kho ở kệ kho đi.
  - **`inventory` (Transit)**: Cộng lượng hàng vào kho ảo `transitLocationId`.
  - **`stock_ledger`**: Ghi 1 dòng loại `TRANSFER_OUT` ở kho nguồn.
- **Request (`DispatchTransferDto`)**:

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

- **Tác động DB (Bắt buộc dùng Transaction):**
  - **`transfer_lines`**: Ghi `receivedBaseQty`, bến nhận `receivingLocationId`, và kệ cất cuối `targetLocationId`.
  - **`transfers`**: Đổi status `COMPLETED` (nếu nhận đủ) hoặc `DISCREPANCY` (nếu thiếu). Ghi `receivedBy`, `receivedAt`.
  - **`inventory` (Transit)**: Trừ tồn kho tại kho ảo transit.
  - **`inventory` (Kho đích)**: Cộng tồn kho vào kệ thực tế `targetLocationId`.
  - **`stock_ledger`**: Sinh 1 dòng loại `TRANSFER_IN` ở kho đích.
- **Request (`ReceiveTransferDto`)**:

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

<a id="reversal"></a>

### 4.3. Bút toán đảo — luồng yêu cầu, kiểm tra và duyệt

**Phạm vi:** sửa giao dịch đã ghi sai bằng một ledger mới ngược dấu. Không sửa/xóa
ledger gốc, không phục hồi toàn DB về một thời điểm cũ và không đảo tự động các dòng khác.
Module đã có route và bảng `ledger_reversal_requests`; chưa coi luồng approve hiện tại
là hoàn chỉnh. Contract dưới đây là mục tiêu cần hoàn thiện và nghiệm thu.

#### A. Ai phát hiện sai và ai xử lý?

| Người                               | Việc cần làm                                                                                     | Giới hạn                                                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Nhân viên Receiver/Picker/Inspector | Khi phát hiện sai, báo Manager/Supervisor mã phiếu, ledger ID, SKU/lô/serial, số sai và lý do    | Không tự đảo hoặc sửa ledger. Bản đầu báo qua kênh nội bộ đang dùng; chưa thêm bảng ticket hoặc gửi email |
| Supervisor                          | Kiểm tra chứng từ, đối chiếu thực tế, chuyển thông tin cho Manager                               | Không có bước duyệt reversal riêng hoặc trạng thái Supervisor review trong DB hiện tại                    |
| WH_MANAGER                          | Đối soát, tạo yêu cầu từ màn Sổ cái trong đúng kho; theo dõi/sửa lý do/hủy yêu cầu của mình      | Cần STOCK_LEDGER.READ và STOCK_LEDGER.REVERSE_REQUEST trong cùng assignment phù hợp                       |
| ADMIN toàn hệ thống                 | Xem danh sách chờ, kiểm tra, duyệt hoặc từ chối; ghi nhận xét                                    | Cần STOCK_LEDGER.REVERSE. Không coi ADMIN gắn riêng một kho là ADMIN toàn hệ thống                        |
| Backend                             | Kiểm tra lại nghiệp vụ tại thời điểm duyệt, ghi reversal và kết quả review trong một transaction | Không tin quyền/actor hoặc số lượng do FE gửi                                                             |

Giữ cách phân công gốc: Manager là người tạo request chính thức, nhân viên báo sai
cho Manager. Nếu team muốn nhân viên tự tạo request ngay trong app thì đó là mở rộng
RBAC cần chốt riêng; không tự cấp STOCK_LEDGER.REVERSE_REQUEST cho mọi nhân viên.
ADMIN biết có việc qua màn **Yêu cầu đảo đang chờ** và API lọc `status=PENDING`.

#### B. Trạng thái và quyền xem

`PENDING → APPROVED | REJECTED | CANCELLED`. Ba trạng thái sau là cuối.

- Requester được đọc/sửa lý do/hủy yêu cầu của mình khi PENDING, trong kho còn được cấp quyền.
- ADMIN toàn hệ thống được xem mọi yêu cầu và approve/reject; không tự duyệt request của chính mình.
- User khác không đọc được yêu cầu chỉ vì có STOCK_LEDGER.READ ở một kho khác.
- REJECTED/CANCELLED không đổi tồn; có thể lập request mới nếu ledger vẫn đủ điều kiện.
- APPROVED hiển thị ledger gốc và ledger đảo để đối soát. Không có DELETE request hoặc ledger.
- Trạng thái request không thay thế trạng thái Receipt/Adjustment/Shipment.

#### C. Bảng và ràng buộc đang có

| Trường ledger_reversal_requests    | Ý nghĩa                                             |
| ---------------------------------- | --------------------------------------------------- |
| id, originalLedgerId               | ID request và ledger được báo sai; BIGINT string    |
| reason                             | Lý do, bắt buộc sau trim, tối đa 500 ký tự          |
| requestedBy, createdAt             | User từ token và thời điểm tạo UTC                  |
| status                             | PENDING / APPROVED / REJECTED / CANCELLED           |
| reviewedBy, reviewedAt, reviewNote | Người review, thời gian UTC, nhận xét/lý do từ chối |
| reversalLedgerId                   | Ledger mới được tạo khi approve; unique             |
| updatedAt, updatedBy               | Audit thay đổi request                              |

Giữ partial unique một request PENDING trên mỗi originalLedgerId, FK RESTRICT và
trigger ledger bất biến. APPROVED phải đủ reviewer/time/reversal ID; REJECTED phải
có reviewer/time/lý do. Không thêm bảng reversal mới trong đợt này.

#### D. Endpoint và contract mục tiêu

Dùng route hiện có **`/api/reversals/requests`**, không tạo route song song
`/api/ledger-reversal-requests`. Swagger bearer `access-token`.

| Method | Endpoint                               | Quyền và hành vi                                                          |
| ------ | -------------------------------------- | ------------------------------------------------------------------------- |
| POST   | `/api/reversals/requests`              | Manager có STOCK_LEDGER.REVERSE_REQUEST + READ đúng kho; tạo PENDING      |
| GET    | `/api/reversals/requests`              | ADMIN toàn hệ thống hoặc requester trong scope; list/count cùng điều kiện |
| GET    | `/api/reversals/requests/{id}`         | ADMIN toàn hệ thống hoặc requester còn scope kho                          |
| PUT    | `/api/reversals/requests/{id}`         | Requester; chỉ reason, chỉ PENDING                                        |
| POST   | `/api/reversals/requests/{id}/cancel`  | Requester; PENDING → CANCELLED, body `{}`                                 |
| POST   | `/api/reversals/requests/{id}/approve` | ADMIN toàn hệ thống khác requester; tạo reversal đúng dòng được chọn      |
| POST   | `/api/reversals/requests/{id}/reject`  | ADMIN toàn hệ thống khác requester; nhận lý do, không đổi tồn             |

List query: `status?`, `warehouseId?`, `requestedBy?`, `originalLedgerId?`,
`page=1`, `limit=20` tối đa 100; order `createdAt DESC, id DESC`. User không được
dùng requestedBy/warehouseId để mở rộng phạm vi. Kho lấy từ ledger gốc trong DB.

Create:

```json
{
  "originalLedgerId": "999",
  "reason": "Đã nhập nhầm chênh lệch kiểm kê, đối soát BB-01"
}
```

Update: `{ "reason": "Bổ sung thông tin đối soát BB-02" }`.
Approve/reject: `{ "reviewNote": "Đã đối soát / lý do từ chối cụ thể" }`.
Trong contract mới, reviewNote bắt buộc sau trim, tối đa 500 ký tự; DTO hiện tại
đang optional nên phải cập nhật khi triển khai. Không nhận qtyChange/actor từ body.

Response thống nhất `{ statusCode, message, data }`; list thêm `meta`.
POST tạo trả 201; action/GET/PUT trả 200. Detail có request/audit và ledger gốc,
ledger đảo (nếu có), số trước/biến động/sau, SKU/location/lot/serial, chứng từ
tham chiếu. Chọn rõ trường, không trả toàn bộ entity User hoặc password hash.

Approve thành công:

```json
{
  "statusCode": 200,
  "message": "Reversal request approved",
  "data": {
    "id": "1",
    "originalLedgerId": "999",
    "status": "APPROVED",
    "reversalLedgerId": "1000",
    "reviewedBy": "7",
    "reviewedAt": "2026-10-09T08:00:00.000Z"
  }
}
```

#### E. Kiểm tra nghiệp vụ trước khi tạo và trước khi duyệt

1. Ledger tồn tại, đúng scope, chưa là reversal và chưa được đảo. PENDING trùng trả 409.
2. Chỉ hỗ trợ dòng thuộc chứng từ một vế theo whitelist đã review. Bản đầu ưu tiên
   ADJUST_IN/ADJUST_OUT của Adjustment độc lập; phải kiểm tra liên kết chứng từ,
   không chỉ nhìn movement code. Adjustment liên kết Shipment/Transfer và các
   movement PICK/PUTAWAY/TRANSFER/dispatch nhiều bước không được đảo lẻ.
3. Receipt/SHIP_OUT hoặc các loại khác chỉ được đưa vào whitelist sau khi chốt
   tác động chứng từ, reservation và lịch sử. Không mặc định cho phép mọi movement
   một vế chỉ vì đảo được phép tính quantity.
4. Không có movement mới hơn trên cùng identity warehouse/location/SKU/lot/serial
   sau ledger gốc. Kiểm tra lại trong transaction; không chặn chỉ vì ledger khác
   identity có ID lớn hơn. Nếu không đủ điều kiện, hướng dẫn lập Adjustment mới
   theo tồn hiện tại và quy trình duyệt; không tự tạo đề xuất thay người dùng.
5. Kết quả tồn không âm hoặc thấp hơn reserved; giữ quy tắc serial, expiry và
   STORAGE một SKU. Nếu reversal khôi phục SKU khác vào STORAGE đang có hàng thì chặn.
6. Kiểm tra cả chứng từ gốc và request trước approve. Không tự reopen Adjustment
   APPROVED hay cho phép approve chứng từ gốc lần hai; màn đối soát phải hiển thị
   dấu đã đảo từ ledger/request liên quan.

Whitelist trên là giới hạn triển khai đề xuất cần Trung và team xác nhận trước
khi expose approve; không mô tả đây là quy tắc đã có đầy đủ trong code hiện tại.

#### F. Transaction, đồng thời và ví dụ

- Khóa request, ledger gốc và dòng inventory tương ứng theo thứ tự nhất quán.
  Kiểm tra PENDING, chưa đảo và movement mới hơn **sau khi khóa**; mọi writer tồn
  phải tuân thủ cơ chế concurrency tương thích hoặc dùng Serializable + retry.
- Mở rộng/reuse `InventoryLedgerService.reverseMovement` để nhận transaction ngoài.
  Không mở transaction độc lập khiến tồn đã đổi mà request review thất bại.
- INSERT ledger mới với `qtyChange = -original.qtyChange`, `reversalOfId` ngay
  trong INSERT, dùng movement/reference REVERSAL đã có. Tính qtyBefore/qtyAfter
  theo tồn hiện tại khi approve, không copy snapshot qtyBefore cũ vào inventory.
- Cập nhật tồn/version/audit và request APPROVED/reviewer/time/reversalLedgerId
  trong cùng transaction. Không ghi trực tiếp qtyAvailable.
- Hai approve đồng thời chỉ tạo một reversal. Request đã kết thúc trả 409, không
  sinh thêm ledger. Unique conflict/retry có giới hạn; lỗi giữa các bước rollback.

Ví dụ: ledger **99** nhập sai `+10`, tồn trước duyệt `50`, không có movement sau
trên cùng identity. Đảo ledger 99 tạo ledger mới `-10`, tồn còn `40`. Ledger 99
vẫn giữ nguyên. Ledger 100/101 không tự bị đảo. Nếu 99/100/101 cùng sai, lập yêu
cầu từng dòng; trên cùng identity cần xử lý dòng mới nhất trước và kiểm tra lại
sau mỗi lần. Reversal mới cũng là movement, nên không đảm bảo đảo chuỗi cũ được;
trường hợp lịch sử phức tạp dùng Adjustment có duyệt sau đối soát.

#### G. Những việc phải sửa trong code hiện tại

- ReversalService.approve đang gọi recordMovement với quantity đảo âm, movement
  REVERSAL sign=0 và reference REVERSAL_REQ; không tương thích ledger service/seed.
- Code còn UPDATE reversalOfId sau INSERT; trigger append-only sẽ từ chối.
- List/detail chưa áp đầy đủ scope/requester; guard permission không thay thế
  kiểm tra ADMIN global, kho từ ledger và quyền trên từng tài nguyên.
- Bỏ fallback actor `1n`; thiếu user hợp lệ trả 401. Validate ID dương BIGINT,
  phân trang an toàn, reason/reviewNote và trạng thái trong service.
- Chặn route `POST /api/stock-ledger/{id}/reverse` gọi trực tiếp để không bypass
  request/review/whitelist. Contract đích: bỏ route công khai, trả 404; nội bộ
  dùng ledger service qua approve. FE không gọi route này.
- Unit test hiện có một TODO approve thành công; thêm unit/e2e trước nghiệm thu.

#### H. UI và nghiệm thu

Manager: từ dòng Sổ cái mở form lý do; hiện đúng ID/chứng từ/identity/quantity,
không cho nhập lại qtyChange; tab yêu cầu của tôi, sửa/hủy khi PENDING.
Admin: bộ lọc PENDING/kho/requester, detail so sánh ledger gốc và kết quả dự kiến,
nút Duyệt/Từ chối cần reviewNote, disable khi submit, reload kết quả từ BE.
Giải thích rõ đảo giao dịch không phải xóa lịch sử; lỗi 409 phải hiển thị lý do.

Nghiệm thu: đúng dòng được chọn; không đảo lẻ nhiều vế; không vượt scope; không
tự duyệt; request trùng/approve đồng thời chỉ một kết quả; lỗi ghi request hoặc
ledger rollback toàn bộ; reject/cancel không đổi tồn; đối soát tổng ledger = tồn.

---

<a id="adjustment"></a>

### 4.4. Điều chỉnh nhanh từ giao diện tồn kho

Quick Adjustment là lối mở form của module Adjustment hiện có, không phải API
sửa tồn trực tiếp hoặc module/bảng mới. Luồng: DRAFT → submit → PENDING_APPROVAL
→ APPROVED/REJECTED; DRAFT/PENDING_APPROVAL có thể CANCELLED bởi proposer.

Create/PUT chỉ gửi warehouseId, reason và lines gồm inventoryId/actualQty.
actualQty là số đếm theo base UOM, Decimal string. Server đọc SKU/location/UOM/
lot/serial/expiry/systemQty/inventoryVersion từ inventory và tính qtyChange.
Không gửi các snapshot này từ FE; trường lạ phải trả 400 theo DTO hiện có.

```json
{
  "warehouseId": "1",
  "reason": "Kiểm đếm phát hiện thiếu hàng",
  "lines": [{ "inventoryId": "100", "actualQty": "48" }]
}
```

| Method | Endpoint                      | Quyền/giới hạn                                     |
| ------ | ----------------------------- | -------------------------------------------------- |
| POST   | /api/adjustments              | ADJUSTMENT.CREATE; sinh DRAFT, chưa đổi tồn        |
| GET    | /api/adjustments              | ADJUSTMENT.READ; proposer hoặc reviewer đúng scope |
| GET    | /api/adjustments/{id}         | ADJUSTMENT.READ, scope từ phiếu                    |
| PUT    | /api/adjustments/{id}         | ADJUSTMENT.UPDATE; proposer, DRAFT                 |
| POST   | /api/adjustments/{id}/submit  | ADJUSTMENT.SUBMIT; proposer, snapshot còn đúng     |
| POST   | /api/adjustments/{id}/cancel  | ADJUSTMENT.CANCEL; proposer                        |
| POST   | /api/adjustments/{id}/approve | ADJUSTMENT.APPROVE, khác proposer kể cả ADMIN      |
| POST   | /api/adjustments/{id}/reject  | ADJUSTMENT.REJECT, body reason                     |

Submit/approve/cancel body `{}`. Reject body `{ "reason": "Cần kiểm đếm lại" }`;
server lưu rejectionReason. Không gửi rejectionReason thay reason trong DTO.
List: warehouseId/status/proposedBy/page/limit, mặc định 1/20, tối đa 100.
Response giữ contract đang triển khai của module; FE không tự đổi tên mảng quan
hệ của response chỉ vì ví dụ tài liệu khác. Xem docs/week3/README.md và Swagger.

Approve kiểm tra version và quantity; stale trả 409, không tự tính lại.
Tồn/version/audit, ADJUST_IN/OUT và trạng thái phiếu cùng transaction. Không
giảm dưới reserved hoặc âm, serial actual 0/1. Quick UI không bỏ qua submit
hoặc duyệt. Thiếu hàng của đơn nhưng DB đúng không phải lý do Adjustment.

---

<a id="5-ky-thuat"></a>

## 5. Nguyên tắc kỹ thuật và kiểm tra an toàn dữ liệu

1. **Transaction & Snapshot (409)**: `inventoryVersion` phải được validate. Snapshot do BE đọc từ DB. Nếu tồn hoặc version thay đổi trước duyệt, trả 409; không tin inventoryVersion do client tự gửi.
2. **Bút toán đảo an toàn**: Chỉ cho phép đảo chứng từ 1 vế. Nếu đã có movement tiếp theo đè lên dòng tồn kho đó -> Chặn không cho đảo. Không được xóa/sửa dòng ledger cũ. Không được âm tồn kho/dưới mức reserved sau khi đảo.
3. **Quyền & Scope (403)**: Picker/Receiver chỉ thao tác được phiếu đã assign cho mình. Manager thao tác phải thuộc đúng Warehouse. (Trừ Admin). Không trả về Password Hash trong mọi res.

<a id="6-phan-cong"></a>

## 6. Phân công Nhiệm vụ DEMO 2

| Thành viên     | Trách nhiệm cốt lõi                                                                                                                                             |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Nam Nguyen** | Luồng Shipment: Reserve / Pick sang STAGING / Dispatch từng phần / giao bổ sung (chưa theo dõi giao hàng ngoài kho). Lưu History/Status. Xử lý logic Pick 2 vế. |
| **Thuan Le**   | Luồng Transfer: SOURCE/DESTINATION/BOTH, Gửi đi, Nhận về, trạng thái TRANSIT. Tích hợp chặn ngoại lệ trước khi gửi.                                             |
| **Trung Pham** | Bút toán đảo (Reversal) & Điều chỉnh nhanh: API Request List/Detail/Reject/Cancel/Approve. Chặn route bypass. Giới hạn chỉ đảo chứng từ 1 vế.                   |
| **Vy Tran**    | Frontend UI/UX: Xây dựng toàn bộ giao diện luồng **Xuất kho (Shipment)** cho các vai trò & Giao diện form **Điều chỉnh nhanh** tại Tồn kho.                     |
| **Nhật Quân**  | Frontend UI/UX: Xây dựng giao diện luồng **Chuyển kho (Transfer)** (Tab Gửi/Nhận) & Màn hình quản lý **Bút toán đảo (Reversal)**.                               |

<a id="7-ban-giao"></a>

## 7. Công việc bổ sung, thứ tự và bàn giao

| Hạng mục         | Owner trong plan / đề xuất          | Kết quả phải bàn giao                                                                                       |
| ---------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Reversal BE      | Trung Pham (giữ phân công cũ)       | 7 route request, scope/ADMIN global, whitelist, transaction approve, chặn direct reverse, unit/e2e, Swagger |
| Reversal FE      | Nhật Quân (giữ phân công cũ)        | Form Manager, hàng chờ ADMIN, detail nguồn/kết quả, reviewNote, lỗi 409                                     |
| Quick Adjustment | Trung BE + Vy FE (giữ phân công cũ) | Form theo inventoryId/actualQty; DRAFT/submit/approve, không sửa tồn trực tiếp                              |

Giữ phân công Shipment của Nam và Reversal của Trung như bảng ở mục 6.

Thứ tự: (1) chốt whitelist Reversal và contract Transfer còn mở; (2) sửa Reversal
BE/Swagger và kiểm thử; (3) tích hợp UI review và Quick Adjustment; (4) kiểm thử
liên phân hệ, đối soát tồn/ledger; (5) DEMO 2 và bàn giao checklist.

Ngày 09/10 user đã cho phép unit test: chạy unit test cho thay đổi mới; kết hợp
TypeScript/build, git diff --check và HTTP e2e trên DB riêng. Unit mock không
chứng minh rollback/trigger/unique/concurrency PostgreSQL; phải có e2e thực.
Không chạy harness trên Neon ứng dụng.

Bàn giao: checklist ghi rõ code hiện có/chưa sửa/chưa test, kết quả test thật,
API thay đổi (đặc biệt direct reverse bị bỏ), Swagger và BPMN lanes
nhân viên → Manager → ADMIN → hệ thống.
Không tự deploy migration hoặc sửa dữ liệu chỉ vì cập nhật tài liệu này.

<a id="8-diem-mo"></a>

## 8. Các điểm Transfer còn phải thống nhất riêng với Thuận

- Schema dùng PENDING_APPROVAL/DISPATCHED; phần gốc ghi PENDING/IN_TRANSIT.
  Chốt theo enum/check hiện có hoặc migration review, không gửi status tùy ý.
- Duyệt SOURCE/DESTINATION/BOTH: hai Manager duyệt mỗi đầu; một Manager có quyền
  hai kho dùng một nút BOTH, BE ghi hai quyết định trong transaction. Không chỉ
  duyệt DESTINATION rồi coi phiếu đã đủ hai quyết định.
- TRANSIT là Location không pickable thuộc kho nguồn. Đổi tồn nguồn/TRANSIT/đích
  phải ghi đủ ledger cho mỗi location đổi quantity; mô tả chỉ một TRANSFER_OUT
  hoặc TRANSFER_IN trong ví dụ cũ chưa đủ để đối soát ledger theo location.
- Chốt vai trò của pick/dispatch để không trừ nguồn hai lần; receive một lần
  hay nhiều lần, quantity tích lũy/delta và idempotency phải thống nhất trước code.
- Nhận thiếu sau dispatch giữ DISCREPANCY/phần còn TRANSIT; không dùng Adjustment
  tồn trong kho để tự xóa lượng transit. API giải quyết sau dispatch chưa chốt.
- factor/identity/expiry lấy từ nguồn/conversion và snapshot BE, không tin các
  giá trị client trong ví dụ cũ. Sửa lượng approved trước dispatch xóa cả hai
  quyết định và quay DRAFT, giữ requested gốc.

Các mục này là điểm mở cần team xác nhận, không phát sinh bảng/API tự động
trong lần sửa tài liệu này. Checklist đánh dấu chưa chốt, không giả đã xong.

<a id="9-checklist"></a>

## 9. Checklist API

Dùng [WEEK4_API_CHECKLIST.md](WEEK4_API_CHECKLIST.md) cùng thư mục. Có danh sách
Shipment, Transfer, Reversal, Adjustment; mỗi endpoint có hiện trạng và
việc phải làm. Ô trống nghĩa là chưa có bằng chứng nghiệm thu theo bản plan mới.
