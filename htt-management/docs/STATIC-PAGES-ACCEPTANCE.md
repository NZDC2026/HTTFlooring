# Static page completion — existing navigation scope

Completed 2026-10-16. Scope is the modules currently present in HTT Management's sidebar, top bar and registered routes, including their newly added prototype subpages. This is a static/interactivity milestone, not a claim that payroll, document storage or external integrations are implemented as business services.

## Completed screens

- Payroll: overview, employee directory, new/edit employee, employee detail, pay-run register, new pay run, pay-run review, payslip layout, timesheets and leave requests.
- Documents: searchable/filterable library, upload/file-selection metadata form, detail/content outline, properties, sample version history and access layout. File bytes are never read, uploaded or stored.
- Settings: company form, preferences/notification/theme configuration layout, sample reset confirmation, role policy, integration directory and four integration configuration variants. Actual local user/audit/backup controls remain linked to the existing security page. Removed obsolete wording that required an independent identity backend.
- Report library: categorized links to 14 existing operational/financial reports, filtered by current role.
- Workspace utilities: module/screen search with empty state, help/FAQ, sample notifications with read/unread state, and a 404 page. Search, help and notifications in the top bar now navigate to working screens; Cmd/Ctrl+K opens search. The sidebar company footer opens settings.
- App navigation resets page scroll position so a detail page does not open halfway down after following a long list.
- Forms provide native required/type/range validation and relevant date checks. Invalid/missing sample detail IDs show a recovery link instead of crashing.

## Prototype data boundary

Payroll, document and general setting changes use an isolated in-memory sample store. They reset when the desktop page reloads and never mutate the main-process financial/contact/security repositories. Every affected module explicitly labels this behavior. Company currency/timezone, language/theme and notification choices are configuration previews; they do not change application-wide accounting/display policies. Sample review/approval states do not create actual payments, employment decisions, submissions or access grants. Integration previews do not collect credentials or contact any external service.

Previously implemented sales, purchasing, inventory, banking, accounting, contacts, security and period pages retain their existing real local behavior. No standalone backend was added. No business database version or persistence format was changed in this milestone.

## Verification

- Production build: `npm run build` passed. Existing Vite bundle-size warning remains informational.
- Regression: `npm test -- --reporter=dot` passed: 56 files, 507 tests. No implementation-mirroring unit tests were added for these prototype layouts.
- Route inventory: 90 registered route patterns, including root and 404. Every fixed JSX `to="/..."` link was matched to a registered route; no unmatched fixed links found. The legacy PlaceholderPage component has no route/import references.
- Browser acceptance used a temporary local harness rendering the actual new components plus the existing sidebar/top bar, with a synthetic administrator principal. This harness was not copied into the project or patch and does not bypass production sign-in. A 1100×800 viewport matched the supported minimum desktop window width.
- Opened 27 representative addresses: all 11 payroll layouts; document library/upload/detail; company/preferences/roles/integration directory and four integration variants; report library; search; help; notifications; 404. Each displayed the expected headings. No console errors were reported.
- Interaction checks: added a synthetic employee and reached its detail page; reviewed a sample run and opened a payslip; switched document version view; saved sample company settings and observed confirmation; opened integration configuration; exercised search empty results and notification unread empty state. Payroll and document detail layouts were visually inspected.

## Remaining acceptance

The new prototype layouts were verified in the browser harness. A complete packaged-Electron click-through of every existing business page and native file-picker flow was not performed. Existing real finance/security behavior is covered by the unchanged regression suite; the 90-route inventory is not a claim of 90 fresh visual inspections.

Real payroll calculations/payments/STP, document file storage/versioning, persistent company/preferences configuration and external integration connections remain separate functional development work.

See STATIC-PAGES-ROUTES.md for the complete current route inventory.
