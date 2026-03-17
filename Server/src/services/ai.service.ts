import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

const SYSTEM_PROMPT = `You are a search query parser for a social media app.
Given a user's free-text search query about posts, extract structured filters.

Return ONLY a valid JSON object with these optional fields:
- "textSearch": space-separated keywords to search in post text. Include the original word AND relevant variants (singular/plural, synonyms). For example: "cats" → "cat cats kitten feline pet". (string or null)
- "dateFrom": ISO date string for start date filter (string or null)  
- "dateTo": ISO date string for end date filter (string or null)
- "username": username to filter by post author (string or null)

Today's date is ${new Date().toISOString().split("T")[0]}.

Examples:
- "posts about cooking" → {"textSearch":"cooking cook recipe food kitchen","dateFrom":null,"dateTo":null,"username":null}
- "what did john post last week" → {"textSearch":null,"dateFrom":"<last week date>","dateTo":null,"username":"john"}
- "posts about cats" → {"textSearch":"cat cats kitten feline pet animal","dateFrom":null,"dateTo":null,"username":null}
- "dog photos" → {"textSearch":"dog dogs puppy canine pet photo picture","dateFrom":null,"dateTo":null,"username":null}

Return ONLY the JSON object, no markdown, no explanation.`;

export interface ParsedQuery {
  textSearch: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  username: string | null;
}

// Simple in-memory cache with TTL
const cache = new Map<string, { data: ParsedQuery; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key: string): ParsedQuery | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: ParsedQuery): void {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL });
}

export async function parseSearchQuery(query: string): Promise<ParsedQuery> {
  const normalizedQuery = query.trim().toLowerCase();

  const cached = getCached(normalizedQuery);
  if (cached) return cached;

  const model = getGenAI().getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const MAX_RETRIES = 2;
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent([
        { text: SYSTEM_PROMPT },
        { text: query },
      ]);

      console.log("AI search query parser response:", result.response.text());

      const responseText = result.response.text().trim();

      // Strip markdown code block wrappers if present
      const jsonText = responseText
        .replace(/^```(?:json)?\s*/, "")
        .replace(/\s*```$/, "");

      const parsed: ParsedQuery = JSON.parse(jsonText);

      // Whitelist only known fields
      const sanitized: ParsedQuery = {
        textSearch:
          typeof parsed.textSearch === "string" ? parsed.textSearch : null,
        dateFrom: typeof parsed.dateFrom === "string" ? parsed.dateFrom : null,
        dateTo: typeof parsed.dateTo === "string" ? parsed.dateTo : null,
        username: typeof parsed.username === "string" ? parsed.username : null,
      };

      setCache(normalizedQuery, sanitized);
      return sanitized;
    } catch (err: unknown) {
      lastError = err;
      const status = (err as { status?: number }).status;

      // Don't retry on non-retryable errors
      if (status === 429 && attempt < MAX_RETRIES) {
        // Wait before retrying (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 * (attempt + 1)),
        );
        continue;
      }
      break;
    }
  }

  throw lastError;
}

const TAGS_PROMPT = `You are a content tagger for a social media app.
Given a post's text content, extract 3-5 relevant semantic tags that describe the topics, themes, and subjects in the post.

Return ONLY a JSON array of lowercase tag strings. Include:
- Main subjects (e.g., "cat", "food", "travel")
- Broader categories (e.g., "pet", "animal", "nature")
- Related concepts that someone might search for

Examples:
- "I love my cat so much!" → ["cat", "pet", "animal", "love"]
- "Beautiful sunset at the beach today" → ["sunset", "beach", "nature", "photography", "travel"]
- "Just finished cooking pasta for dinner" → ["pasta", "cooking", "food", "dinner", "homemade"]

Return ONLY the JSON array, no markdown, no explanation.`;

export async function generateTags(text: string): Promise<string[]> {
  if (!text || text.trim().length < 3) {
    return [];
  }

  try {
    const model = getGenAI().getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      { text: TAGS_PROMPT },
      { text: text },
    ]);

    const responseText = result.response.text().trim();
    console.log("AI tags response:", responseText);

    // Strip markdown code block wrappers if present
    const jsonText = responseText
      .replace(/^```(?:json)?\s*/, "")
      .replace(/\s*```$/, "");

    const parsed = JSON.parse(jsonText);

    // Validate and sanitize: must be array of strings
    if (!Array.isArray(parsed)) {
      return [];
    }

    const tags = parsed
      .filter((t): t is string => typeof t === "string")
      .map((t) => t.toLowerCase().trim())
      .filter((t) => t.length > 0 && t.length < 50)
      .slice(0, 10); // Max 10 tags

    return tags;
  } catch (err) {
    console.warn("Failed to generate tags:", (err as Error).message ?? err);
    return []; // Non-blocking: return empty tags on failure
  }
}
