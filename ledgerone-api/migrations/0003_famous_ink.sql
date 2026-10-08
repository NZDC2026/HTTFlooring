CREATE TABLE "refresh_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"family_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"membership_id" uuid NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"revoked_reason" varchar(100),
	"replaced_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "refresh_sessions" ADD CONSTRAINT "refresh_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_sessions" ADD CONSTRAINT "refresh_sessions_membership_id_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."memberships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "refresh_sessions_token_hash_unique" ON "refresh_sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "refresh_sessions_family_id_idx" ON "refresh_sessions" USING btree ("family_id");--> statement-breakpoint
CREATE INDEX "refresh_sessions_user_id_idx" ON "refresh_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "refresh_sessions_membership_id_idx" ON "refresh_sessions" USING btree ("membership_id");--> statement-breakpoint
CREATE INDEX "refresh_sessions_expires_at_idx" ON "refresh_sessions" USING btree ("expires_at");