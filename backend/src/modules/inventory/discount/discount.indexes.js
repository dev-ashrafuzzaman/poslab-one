import { ensureIndex } from "../../../database/indexManager.js";


export async function discountsIndexes(db) {
    /* ============================
       DISCOUNTS (Master Rules)
    ============================ */
    const discountsCol = db.collection("discounts");

    // 1️⃣ STRICT ACTIVE TARGET CHECK (🔥 MOST IMPORTANT)
    // Used in: createDiscount validation
    await ensureIndex(
        discountsCol,
        {
            targetType: 1,
            targetId: 1,
            status: 1,
            endDate: 1,
        },
        {
            name: "idx_discount_active_target",
        }
    );

    // 2️⃣ POS DISCOUNT RESOLVE
    // Used in: POS scan → auto discount apply
    await ensureIndex(
        discountsCol,
        {
            targetType: 1,
            targetId: 1,
            status: 1,
            startDate: 1,
        },
        {
            name: "idx_discount_pos_resolve",
        }
    );

    // 3️⃣ DATE BASED ACTIVATION / EXPIRY
    // Used in: cron / auto-expire / validity check
    await ensureIndex(
        discountsCol,
        {
            status: 1,
            startDate: 1,
            endDate: 1,
        },
        {
            name: "idx_discount_date_window",
        }
    );

    // 4️⃣ ADMIN LISTING / CAMPAIGN MANAGEMENT
    // Used in: discount list page, filters
    await ensureIndex(
        discountsCol,
        {
            status: 1,
            createdAt: -1,
        },
        {
            name: "idx_discount_admin_list",
        }
    );

    // 5️⃣ TARGET TYPE FILTER (PRODUCT / CATEGORY / BRANCH / BILL)
    await ensureIndex(
        discountsCol,
        {
            targetType: 1,
            status: 1,
        },
        {
            name: "idx_discount_target_type",
        }
    );

    // 6️⃣ REPORTING / ANALYTICS
    // Used in: campaign performance, audit
    await ensureIndex(
        discountsCol,
        {
            name: 1,
            createdAt: 1,
        },
        {
            name: "idx_discount_campaign",
        }
    );
}
