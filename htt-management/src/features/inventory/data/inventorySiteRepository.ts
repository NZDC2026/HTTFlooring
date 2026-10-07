import {
    mockInventorySites,
} from "./mockInventorySites";

import type {
    InventorySite,
} from "../types/inventorySite";

let sites:
    InventorySite[] =
    structuredClone(
        mockInventorySites,
    );

export const inventorySiteRepository =
{
    getAll():
        InventorySite[] {
        return sites;
    },

    getById(
        siteId: string,
    ) {
        return sites.find(
            (site) =>
                site.id ===
                siteId,
        );
    },

    getActive():
        InventorySite[] {
        return sites.filter(
            (site) =>
                site.status ===
                "ACTIVE",
        );
    },
};