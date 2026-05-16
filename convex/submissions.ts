/**
 * Submissions — user-submitted variant flow.
 *
 * Pattern: client calls `submitVariant` (mutation), which inserts a row in
 * status "pending" and schedules an action. The action calls Modal's
 * /classify endpoint synchronously, then writes predictions back via
 * `completeSubmission` (internal mutation).
 *
 * Auth-ready but not yet auth-gated: `user_id` is taken from the auth
 * context if present, otherwise falls back to "anonymous". When Convex Auth
 * is wired into the frontend, this just starts honoring real identities
 * without code changes.
 */
import { v } from "convex/values";
import {
  mutation,
  query,
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

const PATHOS_API_URL =
  "https://ch3mistocampus--pathos-fastapi-app.modal.run";

// ─── Client-facing ─────────────────────────────────────────────────────────

export const submitVariant = mutation({
  args: { variant: v.any(), user_id: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    // Identity from real auth wins; fall back to the explicit arg the demo
    // frontend passes from its localStorage session; otherwise "anonymous".
    const user_id = identity?.subject ?? args.user_id ?? "anonymous";

    const submissionId = await ctx.db.insert("submissions", {
      user_id,
      variant: args.variant,
      status: "pending",
      created_at: Date.now(),
    });

    // Kick off the Modal call in the background (action, not mutation).
    await ctx.scheduler.runAfter(0, internal.submissions.runClassification, {
      submissionId,
    });

    return submissionId;
  },
});

export const getMySubmissions = query({
  args: { user_id: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const user_id = identity?.subject ?? args.user_id ?? "anonymous";

    return await ctx.db
      .query("submissions")
      .withIndex("by_user", (q) => q.eq("user_id", user_id))
      .order("desc")
      .collect();
  },
});

export const getSubmission = query({
  args: { id: v.id("submissions") },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.id);
    if (!submission) return null;

    // Optional: scope visibility to the submitter once auth is real.
    const identity = await ctx.auth.getUserIdentity();
    if (identity && submission.user_id !== identity.subject) {
      return null;
    }
    return submission;
  },
});

// ─── Internal — invoked by scheduled action ────────────────────────────────

export const _get = internalQuery({
  args: { id: v.id("submissions") },
  handler: async (ctx, args) => await ctx.db.get(args.id),
});

export const _setStatus = internalMutation({
  args: {
    id: v.id("submissions"),
    status: v.union(
      v.literal("pending"),
      v.literal("classifying"),
      v.literal("done"),
      v.literal("error"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const _complete = internalMutation({
  args: { id: v.id("submissions"), predictions: v.any() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "done",
      predictions: args.predictions,
      completed_at: Date.now(),
    });
  },
});

export const _fail = internalMutation({
  args: { id: v.id("submissions"), error: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "error",
      error: args.error,
      completed_at: Date.now(),
    });
  },
});

export const runClassification = internalAction({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, args) => {
    const submission = await ctx.runQuery(internal.submissions._get, {
      id: args.submissionId,
    });
    if (!submission) throw new Error(`Submission ${args.submissionId} not found`);

    await ctx.runMutation(internal.submissions._setStatus, {
      id: args.submissionId,
      status: "classifying",
    });

    try {
      const response = await fetch(`${PATHOS_API_URL}/classify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant: submission.variant }),
      });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Modal /classify returned ${response.status}: ${detail.slice(0, 200)}`);
      }
      const data = (await response.json()) as { predictions: Record<string, unknown> };
      await ctx.runMutation(internal.submissions._complete, {
        id: args.submissionId,
        predictions: data.predictions,
      });
    } catch (err) {
      await ctx.runMutation(internal.submissions._fail, {
        id: args.submissionId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  },
});
