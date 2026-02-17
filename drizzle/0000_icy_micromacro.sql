CREATE TYPE "public"."profile_slot" AS ENUM('plan', 'build', 'debug');--> statement-breakpoint
CREATE TABLE "model_catalog" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider" varchar(48) NOT NULL,
	"name" varchar(128) NOT NULL,
	"context_window" varchar(16),
	"max_output_tokens" varchar(16),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_model_selections" (
	"profile_id" integer NOT NULL,
	"slot" "profile_slot" NOT NULL,
	"model_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profile_model_selections_profile_id_slot_pk" PRIMARY KEY("profile_id","slot")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"username" varchar(40) NOT NULL,
	"display_name" varchar(128),
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "profiles_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "profile_model_selections" ADD CONSTRAINT "profile_model_selections_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_model_selections" ADD CONSTRAINT "profile_model_selections_model_id_model_catalog_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."model_catalog"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "model_catalog_provider_name_idx" ON "model_catalog" USING btree ("provider","name");