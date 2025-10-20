CREATE TABLE "bde_machines" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"machine_id" text NOT NULL,
	"password" text NOT NULL,
	"department" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bde_machines_machine_id_unique" UNIQUE("machine_id")
);
--> statement-breakpoint
CREATE TABLE "factory_users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"image_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_numbers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "order_numbers_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "part_numbers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"part_number" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "part_numbers_part_number_unique" UNIQUE("part_number")
);
--> statement-breakpoint
CREATE TABLE "performance_ids" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"performance_id" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "performance_ids_performance_id_unique" UNIQUE("performance_id")
);
--> statement-breakpoint
CREATE TABLE "work_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"machine_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"user_name" text NOT NULL,
	"part_number" text NOT NULL,
	"order_number" text NOT NULL,
	"performance_id" text NOT NULL,
	"duration" integer NOT NULL,
	"is_modified" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"machine_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"is_running" boolean DEFAULT false NOT NULL,
	"duration" integer DEFAULT 0 NOT NULL,
	"part_number" text,
	"order_number" text,
	"performance_id" text,
	"started_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "work_logs" ADD CONSTRAINT "work_logs_machine_id_bde_machines_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."bde_machines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_logs" ADD CONSTRAINT "work_logs_user_id_factory_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."factory_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_sessions" ADD CONSTRAINT "work_sessions_machine_id_bde_machines_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."bde_machines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_sessions" ADD CONSTRAINT "work_sessions_user_id_factory_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."factory_users"("id") ON DELETE no action ON UPDATE no action;