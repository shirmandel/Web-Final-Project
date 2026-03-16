import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("keyyy", process.env.GEMINI_API_KEY);

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
- "textSearch": keywords to search in post text (string or null)
- "dateFrom": ISO date string for start date filter (string or null)  
- "dateTo": ISO date string for end date filter (string or null)
- "username": username to filter by post author (string or null)

Today's date is ${new Date().toISOString().split("T")[0]}.

Examples:
- "posts about cooking" → {"textSearch":"cooking","dateFrom":null,"dateTo":null,"username":null}
- "what did john post last week" → {"textSearch":null,"dateFrom":"<last week date>","dateTo":null,"username":"john"}
- "pictures of dogs from march" → {"textSearch":"dogs","dateFrom":"2026-03-01","dateTo":"2026-03-31","username":null}

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
