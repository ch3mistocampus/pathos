import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User-submitted variants. The 5 agents classify each submission via the
  // Modal backend; the result is written back here. No ground truth is
  // provided, so submissions are NOT scored and do NOT affect the
  // continuous-tournament leaderboard.
  submissions: defineTable({
    // For now `user_id` is a free-form string (we'll plug in Convex Auth
    // later). When auth is wired, this becomes the authenticated identity's
    // subject claim. Until then it's "anonymous" or a client-supplied label.
    user_id: v.string(),

    // The VariantChallenge payload as shipped to the agents. We store the
    // entire object so the dashboard can re-render the evidence pack later.
    variant: v.any(),

    status: v.union(
      v.literal("pending"),
      v.literal("classifying"),
      v.literal("done"),
      v.literal("error"),
    ),

    // Filled in once the Modal action returns. Shape: per-agent
    // AgentPrediction dicts keyed by agent name.
    predictions: v.optional(v.any()),

    // Set when status === "error".
    error: v.optional(v.string()),

    created_at: v.number(),
    completed_at: v.optional(v.number()),
  })
    .index("by_user", ["user_id"])
    .index("by_status", ["status"]),
});
