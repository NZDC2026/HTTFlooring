# 批次、货位、扫码与交接照片（032）

在现有仓库/SKU 数量账、预留和移动平均成本之下新增实物维度，不改变既有财务计价方法。

## 库存位置

- `GET/POST /warehouse/bins`：warehouseId、code、name；`PUT /warehouse/bins/{id}`：name、active，If-Match。UNASSIGNED 自动管理，不能停用；有库存的货位不能停用。
- `GET /warehouse/positions?warehouseId=...`：可按 productId/binId/lotId 分页筛选；返回基础数量、已指定位置拣货的占用及剩余可拣数。这里的剩余不是全局销售可售数。
- `POST /warehouse/location-moves`：sourcePositionId、targetBinId、lotCode、baseQuantity、reference、reason、可选 countId。仅同仓实物重分配，生成 LM 单据和成对位置流水，不产生会计凭证。
- `GET /warehouse/lot-trace?warehouseId=...&lotId=...`：位置流水、来源单据或请求/事务关联。批次/货位不暴露财务成本。

升级时旧库存进入 UNASSIGNED；其数量通过 LEGACY_UNASSIGNED_OPENING 保存。分配旧库存必须提供当前已 POSTED 的盘点：同仓同 SKU、盘点数量等于当前 onHand、过账后的库存 revision 仍相符。新收货、退货及调拨到货自动进入未分配位置；本次不在采购收货请求内直接登记批号。人员确认后通过位置移动分配。盘点仍为现有选定 SKU 的仓库总数盘点，不是分货位盲盘/复盘。

所有数量变动自动同步位置。指定拣货位置优先扣指定批次；未指定位置的旧接口按未分配优先、批次日期/ID 顺序自动分摊，保护其他未完成拣货占用。延迟约束保证位置合计等于仓库/SKU onHand，位置余额等于位置流水，拣货位置数量/来源一致；对账增加位置余额检查。

## 拣货与扫码

创建拣货沿用 `/warehouse/orders/{id}/picks`：每行可传 `positions[{positionId,baseQuantity}]`（必须覆盖整行基础数量）、`shortPickReason`。原无位置请求继续有效。取消拣货释放位置占用；更改指定位置需取消后重新创建，不能修改历史流水。

`POST /warehouse/picks/{id}/short-pick-reasons` 支持 orderLineId、reason，保存当时剩余欠拣数量；旧部分拣货请求仍兼容，原因不是强制确认门槛。

`GET /warehouse/scan?warehouseId=...&code=...`：`BIN:<uuid>`、`LOT:<uuid>`、单位条码、旧产品条码或 SKU；返回匹配对象，扫码本身不改变库存。

## 照片

PICK 接入原私有附件 API：`POST /documents/{pickId}/attachments?fileName=...`（原始 JPEG/PNG body、If-Match、幂等键），扫描通过前不可下载。通过原 `/documents/{id}/files` 与 `/files/{id}/content` 访问；继承仓库权限，不能凭文件 ID 越权。照片是可选证据，未要求旧客户端交接时强制上传。供应商账单和贷项也允许授权附件；本次未扩展其 PDF/邮件模板。

默认 ADMIN/WAREHOUSE 可维护位置；ADMIN/WAREHOUSE/OFFICE/PROCUREMENT/FINANCE 可按既有仓库授权读取。仓库人员获附件权限但仍逐单据检查范围。相机、扫码硬件、货位选择和移动端页面需要未来客户端接入；三个客户端本次未修改。
