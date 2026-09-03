import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_QUESTIONS, type InterviewTurn, type Objection } from "./types";

/**
 * The demo workspace a judge lands in. Twelve testimonials, three forms, two
 * widgets, two draft asks. Also what the nightly reset restores.
 *
 * Only relative imports here: this file is bundled and run outside Next by
 * scripts/seed.mjs as well as by the reset cron.
 */

export const DEMO_WIDGET_WALL_ID = "11111111-1111-4111-8111-111111111111";
export const DEMO_WIDGET_PRICING_ID = "22222222-2222-4222-8222-222222222222";

const WS = {
  name: "Harbour Bookkeeping",
  brand: { accent: "#0f6e56", font: "sans" },
  ask_delay_days: 2,
  ask_subject: "How did it go?",
  ask_body:
    "Hi {{name}},\n\nYou've had a couple of weeks with us now. Would you spare three minutes to tell us how it went? It's a short conversation, not a form, and you approve every word before anything is used.\n\n{{link}}\n\nThanks,\nHarbour",
  provenance_default: true,
};

type SeedTestimonial = {
  author_name: string | null;
  author_role: string | null;
  author_company: string | null;
  author_url?: string | null;
  avatar: number | null;
  rating: number | null;
  body: string;
  source: "interview" | "classic" | "import";
  status: "pending" | "approved" | "hidden";
  featured?: boolean;
  identity_mode?: "full" | "first_role" | "anonymous";
  objection: Objection | null;
  outcome: string | null;
  tags: string[];
  highlight?: string | null;
  highlight_mode?: "none" | "bold" | "only";
  transcript?: InterviewTurn[];
  provenance?: Record<string, unknown>;
  provenance_public?: boolean;
  daysAgo: number;
};

const T: SeedTestimonial[] = [
  {
    author_name: "Priya Raman",
    author_role: "Founder",
    author_company: "Lumen Skincare",
    avatar: 47,
    rating: 5,
    body:
      "Before Harbour I was doing the books on a Sunday night with a glass of wine and a spreadsheet, and dreading January. What nearly stopped me was the price, honestly, it felt like a luxury for a business my size. Now the numbers are just done. I look at one page on a Monday and I know where I am. I've told two other founders in my co-working space already.",
    source: "interview",
    status: "approved",
    featured: true,
    objection: "price",
    outcome: "Books done without Sundays",
    tags: ["small team", "founder", "monthly reporting"],
    highlight: "Now the numbers are just done.",
    highlight_mode: "bold",
    transcript: [
      { role: "interviewer", text: "What was going on before you found Harbour?" },
      { role: "customer", text: "Doing the books myself on a Sunday night. Glass of wine, spreadsheet, dreading January every year." },
      { role: "interviewer", text: "You mentioned dreading January. What nearly stopped you handing it over?" },
      { role: "customer", text: "The price, honestly. It felt like a luxury for a business my size. I kept thinking I should just be more disciplined." },
      { role: "interviewer", text: "And once you started, what actually changed on those Sunday nights?" },
      { role: "customer", text: "They stopped. The numbers are just done now. I look at one page on a Monday and I know where I am." },
      { role: "interviewer", text: "Who would you tell about this?" },
      { role: "customer", text: "Already told two other founders in my co-working space." },
    ],
    provenance_public: true,
    daysAgo: 4,
  },
  {
    author_name: "Tom Okafor",
    author_role: "Director",
    author_company: "Okafor Electrical",
    avatar: 12,
    rating: 5,
    body:
      "We'd been with the same accountant for nine years and switching felt like a betrayal, plus I assumed it would be a nightmare to move everything. It took one call. They pulled the history in themselves. What changed is I actually get answers now, the same week, not at year end.",
    source: "interview",
    status: "approved",
    featured: true,
    objection: "switching",
    outcome: "Answers the same week",
    tags: ["switching", "trades", "responsiveness"],
    highlight: "It took one call.",
    highlight_mode: "bold",
    transcript: [
      { role: "interviewer", text: "What was going on before you found Harbour?" },
      { role: "customer", text: "Nine years with the same accountant. Fine, but slow. I'd ask something in March and hear back after year end." },
      { role: "interviewer", text: "Nine years is a long time. What nearly stopped you moving?" },
      { role: "customer", text: "Felt like a betrayal to be honest. And I assumed moving everything would be a nightmare." },
      { role: "interviewer", text: "How did the move actually go, compared with the nightmare you expected?" },
      { role: "customer", text: "It took one call. They pulled the history in themselves." },
      { role: "interviewer", text: "Who would you tell about this?" },
      { role: "customer", text: "Any other tradesman who's been putting it off." },
    ],
    provenance_public: true,
    daysAgo: 9,
  },
  {
    author_name: "Hannah Lindqvist",
    author_role: "Co-founder",
    author_company: "Fold Studio",
    avatar: 32,
    rating: 5,
    body:
      "I didn't trust anyone with our numbers because the last firm made a VAT mistake that cost us. Harbour walked me through exactly how they check things before I signed anything. Two quarters in, zero surprises, and I sleep better.",
    source: "interview",
    status: "approved",
    objection: "trust",
    outcome: "Zero surprises, two quarters",
    tags: ["trust", "vat", "design studio"],
    highlight: "Two quarters in, zero surprises, and I sleep better.",
    highlight_mode: "bold",
    transcript: [
      { role: "interviewer", text: "What was going on before you found Harbour?" },
      { role: "customer", text: "The last firm made a VAT mistake that cost us a few thousand. So I didn't trust anyone with our numbers." },
      { role: "interviewer", text: "After that, what nearly stopped you trying again?" },
      { role: "customer", text: "Just the fear of it happening twice. They walked me through exactly how they check things before I signed anything, which helped." },
      { role: "interviewer", text: "What has actually changed since?" },
      { role: "customer", text: "Two quarters in, zero surprises. I sleep better." },
      { role: "interviewer", text: "Who would you tell about this?" },
      { role: "customer", text: "Anyone who's been burned before." },
    ],
    daysAgo: 15,
  },
  {
    author_name: "Marcus Bell",
    author_role: "Owner",
    author_company: "Bell & Sons Joinery",
    avatar: 59,
    rating: 4,
    body:
      "Honest, quick, and they don't talk down to you. I was worried a proper bookkeeper would be overkill for a two-man workshop. It isn't. The monthly summary is one page and I actually read it.",
    source: "classic",
    status: "approved",
    objection: "fit",
    outcome: "One page I actually read",
    tags: ["small team", "trades", "monthly reporting"],
    highlight: "Honest, quick, and they don't talk down to you.",
    highlight_mode: "bold",
    daysAgo: 21,
  },
  {
    author_name: "Amara Osei",
    author_role: "Founder",
    author_company: null,
    avatar: 26,
    rating: 5,
    body:
      "I run a small online shop and I was losing a full day a month to reconciliations. Harbour took that off me in the first week. I got the day back and I've spent it on the shop, which is what I should have been doing all along.",
    source: "interview",
    status: "approved",
    identity_mode: "first_role",
    objection: "time",
    outcome: "A day a month back",
    tags: ["ecommerce", "time saved", "reconciliation"],
    highlight: "I got the day back and I've spent it on the shop, which is what I should have been doing all along.",
    highlight_mode: "bold",
    transcript: [
      { role: "interviewer", text: "What was going on before you found Harbour?" },
      { role: "customer", text: "Losing a full day a month to reconciliations. Every month." },
      { role: "interviewer", text: "A full day is a lot. What nearly stopped you handing that over?" },
      { role: "customer", text: "Thought it'd take longer to explain my setup than to just do it myself." },
      { role: "interviewer", text: "Did it? What actually changed once you started?" },
      { role: "customer", text: "No. They took it off me in the first week. I got the day back and I've spent it on the shop, which is what I should have been doing all along." },
      { role: "interviewer", text: "Who would you tell about this?" },
      { role: "customer", text: "Every other small shop owner in my Facebook group." },
    ],
    daysAgo: 27,
  },
  {
    author_name: "David Chen",
    author_role: "Managing Director",
    author_company: "Chen Consulting",
    avatar: 68,
    rating: 5,
    body:
      "Switched from a big-name online service that treated us like a ticket number. With Harbour there is a person, and she knows our business. Our quarterly VAT went from a stressful afternoon to a five-minute approval.",
    source: "import",
    status: "approved",
    objection: "switching",
    outcome: "VAT in five minutes",
    tags: ["switching", "vat", "consulting"],
    highlight: "With Harbour there is a person, and she knows our business.",
    highlight_mode: "bold",
    provenance: { type: "import", source_label: "google", source_url: "https://www.google.com/maps" },
    daysAgo: 33,
  },
  {
    author_name: "Sophie Marsh",
    author_role: "Founder",
    author_company: "Marsh Coffee Roasters",
    avatar: 44,
    rating: 5,
    body:
      "I nearly didn't go ahead because of the monthly fee. Then I worked out what my own time was costing me and it wasn't close. Six months in, our margins are clearer and I've raised prices twice with confidence because I could finally see the numbers.",
    source: "interview",
    status: "approved",
    objection: "price",
    outcome: "Raised prices with confidence",
    tags: ["pricing", "margins", "food and drink"],
    highlight: "Then I worked out what my own time was costing me and it wasn't close.",
    highlight_mode: "bold",
    transcript: [
      { role: "interviewer", text: "What was going on before you found Harbour?" },
      { role: "customer", text: "Roasting, selling, and doing the books at midnight. No idea what my real margins were." },
      { role: "interviewer", text: "What nearly stopped you going ahead?" },
      { role: "customer", text: "The monthly fee. Then I worked out what my own time was costing me and it wasn't close." },
      { role: "interviewer", text: "What actually changed once you could see the numbers?" },
      { role: "customer", text: "Margins are clearer. I've raised prices twice with confidence, six months in." },
      { role: "interviewer", text: "Who would you tell about this?" },
      { role: "customer", text: "Other food producers. We all underprice." },
    ],
    daysAgo: 40,
  },
  {
    author_name: "James Whitfield",
    author_role: null,
    author_company: null,
    avatar: null,
    rating: 5,
    body:
      "Straightforward, no jargon, and they answered every question I had before I signed up, including the awkward ones about what happens if I want to leave. That honesty is why I stayed.",
    source: "classic",
    status: "approved",
    identity_mode: "anonymous",
    objection: "trust",
    outcome: "Stayed because of honesty",
    tags: ["trust", "onboarding", "transparency"],
    highlight: "That honesty is why I stayed.",
    highlight_mode: "bold",
    daysAgo: 46,
  },
  {
    author_name: "Leila Haddad",
    author_role: "Director",
    author_company: "Haddad Architecture",
    avatar: 5,
    rating: 4,
    body:
      "Great for a practice our size. We're eight people and were too big for a spreadsheet and too small for the firms that kept pitching us. Harbour fits exactly in that gap.",
    source: "import",
    status: "approved",
    objection: "fit",
    outcome: "Fits the gap",
    tags: ["fit", "architecture", "mid-size"],
    highlight: "Harbour fits exactly in that gap.",
    highlight_mode: "bold",
    provenance: { type: "import", source_label: "x", source_url: "https://x.com" },
    daysAgo: 52,
  },
  {
    author_name: "Ben Carter",
    author_role: "Founder",
    author_company: "Carter Fitness",
    avatar: 15,
    rating: 5,
    body:
      "Payroll used to eat my Friday afternoons. Now I get a message saying it's done and I check it on my phone between clients. That's it. That's the whole review.",
    source: "interview",
    status: "pending",
    objection: null,
    outcome: null,
    tags: [],
    transcript: [
      { role: "interviewer", text: "What was going on before you found Harbour?" },
      { role: "customer", text: "Payroll ate my Friday afternoons. Every single week." },
      { role: "interviewer", text: "What nearly stopped you going ahead?" },
      { role: "customer", text: "Thought it would be complicated to hand over with staff on different hours." },
      { role: "interviewer", text: "What actually changed once you started?" },
      { role: "customer", text: "I get a message saying it's done and I check it on my phone between clients. That's it. That's the whole review." },
      { role: "interviewer", text: "Who would you tell about this?" },
      { role: "customer", text: "Any gym owner with more than two staff." },
    ],
    daysAgo: 1,
  },
  {
    author_name: "Nina Patel",
    author_role: "Owner",
    author_company: "Patel Pharmacy",
    avatar: 38,
    rating: 5,
    body:
      "I was sceptical because our sector has odd rules and most bookkeepers have never dealt with them. Harbour had, and they proved it in the first meeting with specific questions nobody else had asked.",
    source: "classic",
    status: "pending",
    objection: null,
    outcome: null,
    tags: [],
    daysAgo: 2,
  },
  {
    author_name: "Oliver Grant",
    author_role: "Co-founder",
    author_company: "Grant & Lowe",
    avatar: 53,
    rating: 3,
    body: "Good service overall. Onboarding took a bit longer than I'd hoped but everything since has been smooth.",
    source: "classic",
    status: "hidden",
    objection: "time",
    outcome: "Smooth after onboarding",
    tags: ["onboarding"],
    daysAgo: 60,
  },
];

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

function consent(ws: string) {
  return `I agree that ${ws} may publish this testimonial on their website, in embedded widgets on sites they control, and in their marketing. I can ask for it to be removed at any time.`;
}

export async function seedDemo(admin: SupabaseClient, slug: string): Promise<{ workspaceId: string }> {
  // Workspace: keep the id if it exists so shared links survive the reset.
  const { data: existing } = await admin.from("workspace").select("id").eq("slug", slug).maybeSingle();
  let workspaceId = existing?.id as string | undefined;

  if (!workspaceId) {
    const { data, error } = await admin
      .from("workspace")
      .insert({ slug, is_demo: true, ...WS })
      .select("id")
      .single();
    if (error) throw error;
    workspaceId = data.id;
  } else {
    await admin.from("workspace").update({ is_demo: true, ask_mode: "draft", ...WS }).eq("id", workspaceId);
  }
  if (!workspaceId) throw new Error("Demo workspace could not be created.");

  // Wipe everything the workspace owns. Memberships too: judges start fresh.
  await Promise.all([
    admin.from("testimonial").delete().eq("workspace_id", workspaceId),
    admin.from("ask").delete().eq("workspace_id", workspaceId),
    admin.from("widget").delete().eq("workspace_id", workspaceId),
    admin.from("form").delete().eq("workspace_id", workspaceId),
    admin.from("workspace_member").delete().eq("workspace_id", workspaceId),
  ]);

  const { data: forms, error: formErr } = await admin
    .from("form")
    .insert([
      {
        workspace_id: workspaceId,
        slug: "interview",
        title: "Three minutes, in your words",
        intro: "A short conversation instead of a form. Your answers become a testimonial you approve before anything is used.",
        questions: DEFAULT_QUESTIONS,
        mode: "chat",
        thank_you: "Thank you. That was genuinely useful.",
      },
      {
        workspace_id: workspaceId,
        slug: "quick",
        title: "Leave a quick review",
        intro: "A couple of sentences is plenty.",
        questions: [],
        mode: "classic",
      },
      {
        workspace_id: workspaceId,
        slug: "launch-offer",
        title: "Tell us how it went",
        intro: "We are collecting a few honest words from early clients.",
        questions: DEFAULT_QUESTIONS,
        incentive: "Leave a review and we take 10% off next month's invoice.",
        mode: "chat",
        thank_you: "Thanks. The 10% is on its way to your next invoice.",
      },
    ])
    .select("id, slug");
  if (formErr) throw formErr;
  const formId = (s: string) => forms!.find((f) => f.slug === s)!.id;

  const rows = T.map((t) => ({
    workspace_id: workspaceId,
    form_id: t.source === "import" ? null : formId(t.source === "interview" ? "interview" : "quick"),
    author_name: t.author_name,
    author_role: t.author_role,
    author_company: t.author_company,
    author_url: t.author_url ?? null,
    avatar_url: t.avatar ? `https://i.pravatar.cc/128?img=${t.avatar}` : null,
    rating: t.rating,
    body: t.body,
    raw_transcript: t.transcript ?? null,
    source: t.source,
    status: t.status,
    featured: t.featured ?? false,
    sort_order: 0,
    tags: t.tags,
    objection: t.objection,
    outcome: t.outcome,
    highlight: t.highlight ?? null,
    highlight_mode: t.highlight_mode ?? "none",
    identity_mode: t.identity_mode ?? "full",
    consent_public: true,
    consent_at: daysAgo(t.daysAgo),
    consent_text: consent(WS.name),
    provenance: t.provenance ?? { type: t.source },
    provenance_public: t.provenance_public ?? false,
    created_at: daysAgo(t.daysAgo),
  }));
  const { error: tErr } = await admin.from("testimonial").insert(rows);
  if (tErr) throw tErr;

  const { error: wErr } = await admin.from("widget").insert([
    {
      id: DEMO_WIDGET_WALL_ID,
      workspace_id: workspaceId,
      name: "Homepage wall",
      type: "wall",
      config: { filters: {}, count: 6, theme: "auto", showSource: true, showRating: true, showProvenance: true },
      view_count: 1284,
    },
    {
      id: DEMO_WIDGET_PRICING_ID,
      workspace_id: workspaceId,
      name: "Pricing page quote",
      type: "single",
      config: { filters: { objection: "price" }, count: 3, theme: "auto", showSource: false, showRating: true },
      view_count: 402,
    },
  ]);
  if (wErr) throw wErr;

  // A little view history so the dashboard chart is not empty.
  const views = [];
  for (let d = 13; d >= 0; d--) {
    const day = new Date(Date.now() - d * 86_400_000).toISOString().slice(0, 10);
    views.push({ widget_id: DEMO_WIDGET_WALL_ID, day, count: 60 + Math.round(Math.sin(d) * 20) + d * 2 });
    views.push({ widget_id: DEMO_WIDGET_PRICING_ID, day, count: 20 + Math.round(Math.cos(d) * 8) });
  }
  await admin.from("widget_view").insert(views);

  await admin.from("ask").insert([
    {
      workspace_id: workspaceId,
      form_id: formId("interview"),
      email: "sam@example.com",
      name: "Sam Reilly",
      order_ref: "INV-2041",
      delivered_at: daysAgo(1),
      send_at: daysAgo(-1),
      status: "draft",
    },
    {
      workspace_id: workspaceId,
      form_id: formId("interview"),
      email: "jo@example.com",
      name: "Jo Adebayo",
      order_ref: "INV-2044",
      delivered_at: daysAgo(0),
      send_at: daysAgo(-2),
      status: "draft",
    },
  ]);

  return { workspaceId: workspaceId as string };
}

/** Entry point for scripts/seed.mjs. */
export async function seedFromEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.");
  const admin = createClient(url, key, { auth: { persistSession: false } });
  const slug = process.env.DEMO_WORKSPACE_SLUG ?? "demo";
  const res = await seedDemo(admin, slug);
  console.log(`Seeded demo workspace "${slug}" (${res.workspaceId})`);
}
