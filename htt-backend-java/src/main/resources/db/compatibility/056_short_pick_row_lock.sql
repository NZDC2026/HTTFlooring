-- Incremental Java compatibility migration, after the unchanged legacy 001..055 scripts.
-- SELECT ... FOR UPDATE needs UPDATE on at least one selected-table column.
-- Both API implementations lock immutable sales.order_lines when recording a shortage.
-- Grant only the immutable primary key; the existing append_only trigger still rejects
-- every actual row update, and quantity/pricing/delete privileges remain unavailable.
GRANT UPDATE(id) ON sales.order_lines TO htt_app;
-- Local rollback (after stopping shortage writes):
-- REVOKE UPDATE(id) ON sales.order_lines FROM htt_app;
