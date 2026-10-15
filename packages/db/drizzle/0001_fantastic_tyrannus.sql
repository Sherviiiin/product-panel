ALTER TABLE "product_views" ADD COLUMN "guest_id" uuid;--> statement-breakpoint
CREATE UNIQUE INDEX "product_views_user_unique" ON "product_views" USING btree ("product_id","user_id") WHERE "product_views"."user_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "product_views_guest_unique" ON "product_views" USING btree ("product_id","guest_id") WHERE "product_views"."guest_id" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "product_views" ADD CONSTRAINT "product_views_identity_check" CHECK ("product_views"."user_id" IS NOT NULL OR "product_views"."guest_id" IS NOT NULL);