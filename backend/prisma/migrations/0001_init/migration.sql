-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "CoconutGrade" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "price_per_unit" DOUBLE PRECISION NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoconutGrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GradeChangeLog" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "slot_id" TEXT,
    "from_grade_id" TEXT NOT NULL,
    "to_grade_id" TEXT NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changed_by" TEXT NOT NULL DEFAULT 'admin',

    CONSTRAINT "GradeChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerHoliday" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "created_by" TEXT NOT NULL DEFAULT 'admin',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerHoliday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "customer_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "primary_address_id" TEXT,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerAddress" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "address_line" TEXT NOT NULL,
    "landmark" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "address_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "total_days" INTEGER NOT NULL DEFAULT 30,
    "payment_mode" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "price_per_unit" DOUBLE PRECISION NOT NULL,
    "qty_per_day" INTEGER NOT NULL DEFAULT 1,
    "grade_id" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanChangeLog" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changed_by" TEXT,
    "field_changed" TEXT NOT NULL,
    "old_value" TEXT NOT NULL,
    "new_value" TEXT NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliverySlot" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "address_id" TEXT NOT NULL,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "actual_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "qty_ordered" INTEGER NOT NULL DEFAULT 1,
    "qty_delivered" INTEGER,
    "price_at_delivery" DOUBLE PRECISION,
    "grade_id" TEXT,
    "marked_by" TEXT,
    "marked_at" TIMESTAMP(3),
    "override_reason" TEXT,
    "notes" TEXT,

    CONSTRAINT "DeliverySlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingEntry" (
    "id" TEXT NOT NULL,
    "delivery_slot_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "address_id" TEXT NOT NULL,
    "delivery_date" TIMESTAMP(3) NOT NULL,
    "qty_delivered" INTEGER NOT NULL,
    "price_per_unit" DOUBLE PRECISION NOT NULL,
    "line_amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillingEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "payment_mode" TEXT NOT NULL,
    "reference" TEXT,
    "recorded_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaMessageLog" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "template_type" TEXT NOT NULL,
    "message_body" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3),
    "delivery_status" TEXT NOT NULL DEFAULT 'generated',
    "wa_message_id" TEXT,

    CONSTRAINT "WaMessageLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GradeChangeLog_subscription_id_changed_at_idx" ON "GradeChangeLog"("subscription_id", "changed_at" DESC);

-- CreateIndex
CREATE INDEX "CustomerHoliday_customer_id_date_idx" ON "CustomerHoliday"("customer_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerHoliday_subscription_id_date_key" ON "CustomerHoliday"("subscription_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_customer_code_key" ON "Customer"("customer_code");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_mobile_key" ON "Customer"("mobile");

-- CreateIndex
CREATE INDEX "CustomerAddress_customer_id_status_idx" ON "CustomerAddress"("customer_id", "status");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_subscription_id_effective_from_idx" ON "SubscriptionPlan"("subscription_id", "effective_from" DESC);

-- CreateIndex
CREATE INDEX "PlanChangeLog_subscription_id_changed_at_idx" ON "PlanChangeLog"("subscription_id", "changed_at" DESC);

-- CreateIndex
CREATE INDEX "DeliverySlot_actual_date_status_idx" ON "DeliverySlot"("actual_date", "status");

-- CreateIndex
CREATE INDEX "DeliverySlot_customer_id_actual_date_idx" ON "DeliverySlot"("customer_id", "actual_date");

-- CreateIndex
CREATE INDEX "DeliverySlot_address_id_actual_date_status_idx" ON "DeliverySlot"("address_id", "actual_date", "status");

-- CreateIndex
CREATE INDEX "DeliverySlot_subscription_id_status_idx" ON "DeliverySlot"("subscription_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "BillingEntry_delivery_slot_id_key" ON "BillingEntry"("delivery_slot_id");

-- CreateIndex
CREATE INDEX "BillingEntry_customer_id_subscription_id_idx" ON "BillingEntry"("customer_id", "subscription_id");

-- CreateIndex
CREATE INDEX "BillingEntry_address_id_delivery_date_idx" ON "BillingEntry"("address_id", "delivery_date");

-- CreateIndex
CREATE INDEX "BillingEntry_delivery_date_idx" ON "BillingEntry"("delivery_date");

-- CreateIndex
CREATE INDEX "Payment_customer_id_subscription_id_idx" ON "Payment"("customer_id", "subscription_id");

-- AddForeignKey
ALTER TABLE "GradeChangeLog" ADD CONSTRAINT "GradeChangeLog_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeChangeLog" ADD CONSTRAINT "GradeChangeLog_from_grade_id_fkey" FOREIGN KEY ("from_grade_id") REFERENCES "CoconutGrade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeChangeLog" ADD CONSTRAINT "GradeChangeLog_to_grade_id_fkey" FOREIGN KEY ("to_grade_id") REFERENCES "CoconutGrade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerHoliday" ADD CONSTRAINT "CustomerHoliday_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerHoliday" ADD CONSTRAINT "CustomerHoliday_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_primary_address_id_fkey" FOREIGN KEY ("primary_address_id") REFERENCES "CustomerAddress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerAddress" ADD CONSTRAINT "CustomerAddress_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "CustomerAddress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPlan" ADD CONSTRAINT "SubscriptionPlan_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPlan" ADD CONSTRAINT "SubscriptionPlan_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "CoconutGrade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanChangeLog" ADD CONSTRAINT "PlanChangeLog_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliverySlot" ADD CONSTRAINT "DeliverySlot_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliverySlot" ADD CONSTRAINT "DeliverySlot_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "CustomerAddress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliverySlot" ADD CONSTRAINT "DeliverySlot_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "CoconutGrade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingEntry" ADD CONSTRAINT "BillingEntry_delivery_slot_id_fkey" FOREIGN KEY ("delivery_slot_id") REFERENCES "DeliverySlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingEntry" ADD CONSTRAINT "BillingEntry_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingEntry" ADD CONSTRAINT "BillingEntry_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingEntry" ADD CONSTRAINT "BillingEntry_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "CustomerAddress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaMessageLog" ADD CONSTRAINT "WaMessageLog_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

