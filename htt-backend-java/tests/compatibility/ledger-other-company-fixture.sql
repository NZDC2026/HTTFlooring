-- Separate transaction: deferred BAS guards require one company through COMMIT.
SELECT set_config('htt.company_id','00000000-0000-0000-0000-000000000021',true);
INSERT INTO accounting.accounts(id,company_id,code,name,kind,created_by)VALUES('00000000-0000-0000-0000-000000000423','00000000-0000-0000-0000-000000000021','OTHER_LEDGER_TEST','Synthetic other-company ledger row','ASSET','00000000-0000-0000-0000-000000000002');
