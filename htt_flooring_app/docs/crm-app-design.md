# CRM App visual reference

The sales and warehouse App follows the mobile reference supplied on 10 November 2026: dark green header, flooring detail, white rounded content panels, pastel status cards and dark green bottom navigation. Website and management navigation are separate products.

`lib/widgets/design/crm_design.dart` supplies the offline vector flooring backdrop, brand mark and native bottom navigation. The sales dashboard retains its current calculations, labelled demo values, routes, task actions and customer permissions. Warehouse retains its own Orders destination, scanning, picking, dispatch and calendar callbacks.

The flooring detail is a vector illustration, not a crop of the supplied screenshot. Existing customer names and visit records are retained; storefront photos or confirmation states are not fabricated to match the reference.

Verified: changed-file Flutter analysis, all 22 existing/widget tests, native navigation callback checks at 390 and 1024 logical pixels, production Flutter Web build and isolated DEMO_WORKSPACE preview. Browser visual checks cover sales and warehouse at a phone viewport. iOS/Android device builds and installation were not performed.
