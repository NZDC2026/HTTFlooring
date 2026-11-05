# Synthetic compatibility regression

Run from any directory with Docker running, JDK 21 (`JAVA_HOME`), Maven, .NET 10, Flutter, Python 3 and OpenSSL available:

```sh
python3 tests/compatibility/run.py --legacy ../htt-backend --flutter ../htt_flooring_app
```

Set `HTT_COMPAT_DOTNET` and `HTT_COMPAT_FLUTTER` when those executables are outside PATH. The legacy default also recognizes the eventual literal folder `htt-backend-c#`.

The runner creates a uniquely named disposable PostgreSQL 17 container exposed only on loopback, applies the original SQL migrations and synthetic fixtures, builds Java and isolated copies of the legacy API/Worker and Flutter client, and runs the HTTP comparisons and recovery scenarios. It does not modify either original source tree or connect to production services. The legacy copy accepts only the generated localhost certificate fingerprint. A local scanner fixture replaces ClamAV. Container removal runs on ordinary success/failure; abrupt machine termination may require removing the recorded `htt-java-compat-*` container manually.

Evidence stays in `target/compatibility/<run-id>/`, including build output, HTTP comparison output and server logs. A `PASSED` file is written only after every assertion succeeds. Ports 15081, 15082 and 15443 must be free; do not run multiple suites concurrently. Build/package downloads need network access. Add `--stalled-uploads` to include the optional slow incomplete upload probes; the default run skips those probes.

Coverage includes 72 direct read comparisons, shared idempotency replay in both directions, CRM creation/upload and worker completion, actual Flutter recovery after a committed response is lost, order/warehouse/invoice/customer receipt workflows, purchase orders/receipts, supplier bills/payments/variance bills, advances, reversal, reapplication and reallocation, concurrent replay and rejected corrections.

This suite is a migration regression gate, not full phases 0–4 acceptance. Quotes/direct sales orders are still created by the legacy backend. Array normalization currently ignores list ordering. Stalled upload rejection is bounded but response status/timing differs between Tomcat and Kestrel and remains unresolved. Remaining route coverage, Java background workers, CI/deployment/rollback and complete acceptance must be verified before renaming the original backend.
