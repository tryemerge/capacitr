CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"system_prompt" text NOT NULL,
	"auto_approve_threshold" real DEFAULT 0.8,
	"auto_reject_threshold" real DEFAULT 0.2,
	"snap_poll_duration_minutes" integer DEFAULT 5,
	"max_token_ask" real,
	"context_packs" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "agent_configs_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
CREATE TABLE "agents" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'human' NOT NULL,
	"wallet_address" text,
	"builder_code" text NOT NULL,
	"referred_by" text,
	"bio" text,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"total_earnings" real DEFAULT 0,
	"projects_contributed" integer DEFAULT 0,
	CONSTRAINT "agents_builder_code_unique" UNIQUE("builder_code")
);
--> statement-breakpoint
CREATE TABLE "emitter_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"rounds" integer NOT NULL,
	"preset" text,
	"config_used" jsonb,
	"summary" jsonb NOT NULL,
	"snapshots" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "governance_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"rounds" integer NOT NULL,
	"config_used" jsonb,
	"summary" jsonb NOT NULL,
	"snapshots" jsonb NOT NULL,
	"deliberation_count" integer DEFAULT 0 NOT NULL,
	"self_funding_ratio" real
);
--> statement-breakpoint
CREATE TABLE "idea_metadata" (
	"idea_id" text PRIMARY KEY NOT NULL,
	"image_url" text,
	"pitch" text,
	"problem_statement" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"target_customers" text,
	"comparables" text,
	"creator_name" text,
	"creator_avatar" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investor_token_balances" (
	"id" text PRIMARY KEY NOT NULL,
	"investor_id" text NOT NULL,
	"project_id" text NOT NULL,
	"balance" real DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "investor_token_balances_investor_project" UNIQUE("investor_id","project_id")
);
--> statement-breakpoint
CREATE TABLE "investors" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"eth_balance" real DEFAULT 100 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "launchpad_setups" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"config" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"symbol" text NOT NULL,
	"description" text,
	"system_prompt" text NOT NULL,
	"decay_k" real DEFAULT 0.002 NOT NULL,
	"graduation_threshold" real DEFAULT 69000 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"chain_id" integer,
	"token_address" text,
	"w_token_address" text,
	"bonding_curve_address" text,
	"reserve_eth" real DEFAULT 10 NOT NULL,
	"reserve_token" real DEFAULT 1000000 NOT NULL,
	"total_supply" real DEFAULT 1000000 NOT NULL,
	"token_price" real DEFAULT 0.00001,
	"market_cap" real DEFAULT 0,
	"total_volume" real DEFAULT 0,
	"work_pool_value" real DEFAULT 0,
	"w_token_per_buy" real DEFAULT 0 NOT NULL,
	"w_token_per_referral_buy" real DEFAULT 1 NOT NULL,
	"contributor_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"config" jsonb
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"referrer_code" text NOT NULL,
	"referee_address" text NOT NULL,
	"purchase_tx_hash" text,
	"w_tokens_minted" real,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "snap_poll_votes" (
	"id" text PRIMARY KEY NOT NULL,
	"poll_id" text NOT NULL,
	"voter_address" text NOT NULL,
	"vote" text NOT NULL,
	"weight" real NOT NULL,
	"tx_hash" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "snap_polls" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"submission_id" text NOT NULL,
	"question" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"start_at" timestamp DEFAULT now() NOT NULL,
	"end_at" timestamp NOT NULL,
	"yes_weight" real DEFAULT 0 NOT NULL,
	"no_weight" real DEFAULT 0 NOT NULL,
	"outcome" text,
	"on_chain_poll_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "token_balances" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"project_id" text NOT NULL,
	"balance" real DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "token_balances_user_project" UNIQUE("user_id","project_id")
);
--> statement-breakpoint
CREATE TABLE "trades" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"user_id" text,
	"investor_id" text,
	"side" text NOT NULL,
	"amount_in" real NOT NULL,
	"amount_out" real NOT NULL,
	"fee" real NOT NULL,
	"creator_fee" real NOT NULL,
	"protocol_fee" real NOT NULL,
	"work_pool_fee" real NOT NULL,
	"price_after" real NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"is_anonymous" boolean,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "w_token_balances" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"investor_id" text,
	"project_id" text NOT NULL,
	"balance" real DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "w_token_balances_user_project" UNIQUE("user_id","project_id"),
	CONSTRAINT "w_token_balances_investor_project" UNIQUE("investor_id","project_id")
);
--> statement-breakpoint
CREATE TABLE "work_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"agent_id" text NOT NULL,
	"proof_content" text NOT NULL,
	"proof_hash" text,
	"token_ask" real NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_by" text,
	"review_notes" text,
	"tx_hash" text,
	"mint_tx_hash" text,
	"assets" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_configs" ADD CONSTRAINT "agent_configs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emitter_runs" ADD CONSTRAINT "emitter_runs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "governance_runs" ADD CONSTRAINT "governance_runs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investor_token_balances" ADD CONSTRAINT "investor_token_balances_investor_id_investors_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investor_token_balances" ADD CONSTRAINT "investor_token_balances_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investors" ADD CONSTRAINT "investors_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "launchpad_setups" ADD CONSTRAINT "launchpad_setups_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snap_poll_votes" ADD CONSTRAINT "snap_poll_votes_poll_id_snap_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."snap_polls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snap_polls" ADD CONSTRAINT "snap_polls_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snap_polls" ADD CONSTRAINT "snap_polls_submission_id_work_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."work_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_balances" ADD CONSTRAINT "token_balances_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_balances" ADD CONSTRAINT "token_balances_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_investor_id_investors_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "w_token_balances" ADD CONSTRAINT "w_token_balances_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "w_token_balances" ADD CONSTRAINT "w_token_balances_investor_id_investors_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "w_token_balances" ADD CONSTRAINT "w_token_balances_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_submissions" ADD CONSTRAINT "work_submissions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_submissions" ADD CONSTRAINT "work_submissions_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;