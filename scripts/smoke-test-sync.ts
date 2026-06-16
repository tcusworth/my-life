#!/usr/bin/env tsx
/**
 * Smoke test for My Life sync API routes.
 *
 * Usage:
 *   npx tsx scripts/smoke-test-sync.ts --base-url http://localhost:3000 --api-key ml_sync_...
 *   npx tsx scripts/smoke-test-sync.ts --base-url https://app.example.com --api-key ml_sync_... --post-calendar --post-event
 */

const AGENT_VERSION = "1.0.0";

interface CliOptions {
  baseUrl: string;
  apiKey: string;
  postCalendar: boolean;
  postEvent: boolean;
}

interface TestResult {
  name: string;
  passed: boolean;
  detail: string;
}

function parseArgs(argv: string[]): CliOptions {
  let baseUrl = "";
  let apiKey = "";
  let postCalendar = false;
  let postEvent = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    switch (arg) {
      case "--base-url":
        baseUrl = next ?? "";
        i += 1;
        break;
      case "--api-key":
        apiKey = next ?? "";
        i += 1;
        break;
      case "--post-calendar":
        postCalendar = true;
        break;
      case "--post-event":
        postEvent = true;
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
      default:
        break;
    }
  }

  return { baseUrl, apiKey, postCalendar, postEvent };
}

function printHelp() {
  console.log(`My Life sync API smoke test

Required:
  --base-url <url>     Next.js app URL (e.g. http://localhost:3000)
  --api-key <key>      Sync agent API key (ml_sync_<64 hex>)

Optional:
  --post-calendar      POST a test calendar source
  --post-event         POST a test event (requires --post-calendar or existing source)
  -h, --help           Show this help
`);
}

function normalizeBaseUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, "");
  if (!trimmed.startsWith("http")) {
    throw new Error("Base URL must start with http:// or https://");
  }
  return trimmed;
}

function isValidApiKeyFormat(key: string): boolean {
  return /^ml_sync_[a-f0-9]{64}$/i.test(key) || /^ml_[a-f0-9]{64}$/i.test(key);
}

async function request(
  baseUrl: string,
  apiKey: string,
  method: string,
  path: string,
  body?: unknown
): Promise<{ status: number; body: string }> {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Sync-Agent-Version": AGENT_VERSION,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  return { status: response.status, body: text };
}

function pass(name: string, detail: string): TestResult {
  return { name, passed: true, detail };
}

function fail(name: string, detail: string): TestResult {
  return { name, passed: false, detail };
}

async function run(): Promise<number> {
  const options = parseArgs(process.argv.slice(2));

  if (!options.baseUrl || !options.apiKey) {
    printHelp();
    console.error("\nError: --base-url and --api-key are required.\n");
    return 1;
  }

  if (!isValidApiKeyFormat(options.apiKey)) {
    console.error("Error: API key must match ml_sync_<64 hex> (or legacy ml_<64 hex>).");
    return 1;
  }

  let baseUrl: string;
  try {
    baseUrl = normalizeBaseUrl(options.baseUrl);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    return 1;
  }

  const results: TestResult[] = [];
  const testCalendarExternalId = `smoke-cal-${Date.now()}`;
  const testEventExternalId = `smoke-event-${Date.now()}`;

  console.log(`\nMy Life sync API smoke test`);
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Agent version header: ${AGENT_VERSION}\n`);

  try {
    const pending = await request(baseUrl, options.apiKey, "GET", "/api/sync/pending-writes");
    if (pending.status === 200) {
      results.push(pass("GET /api/sync/pending-writes", `HTTP ${pending.status}`));
    } else if (pending.status === 401 || pending.status === 403) {
      results.push(
        fail(
          "GET /api/sync/pending-writes",
          `HTTP ${pending.status} — check API key and device status (${pending.body.slice(0, 200)})`
        )
      );
    } else if (pending.status === 503) {
      results.push(
        fail(
          "GET /api/sync/pending-writes",
          `HTTP 503 — server missing POCKETBASE_ADMIN_* credentials`
        )
      );
    } else {
      results.push(
        fail("GET /api/sync/pending-writes", `HTTP ${pending.status}: ${pending.body.slice(0, 200)}`)
      );
    }

    if (options.postCalendar) {
      const calendarBody = {
        sources: [
          {
            externalId: testCalendarExternalId,
            name: "Smoke Test Calendar",
            color: "#3366FF",
            isEnabled: true,
            sourceType: "eventkit",
          },
        ],
      };

      const calendar = await request(
        baseUrl,
        options.apiKey,
        "POST",
        "/api/sync/calendars",
        calendarBody
      );

      if (calendar.status === 200) {
        results.push(pass("POST /api/sync/calendars", `HTTP ${calendar.status}`));
      } else {
        results.push(
          fail("POST /api/sync/calendars", `HTTP ${calendar.status}: ${calendar.body.slice(0, 300)}`)
        );
      }
    }

    if (options.postEvent) {
      const now = new Date();
      const startsAt = new Date(now.getTime() + 60 * 60 * 1000);
      const endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000);

      const eventBody = {
        events: [
          {
            calendarSourceExternalId: testCalendarExternalId,
            externalId: testEventExternalId,
            title: "Smoke Test Event",
            description: "Created by scripts/smoke-test-sync.ts",
            location: "CLI",
            startsAt: startsAt.toISOString(),
            endsAt: endsAt.toISOString(),
            isAllDay: false,
          },
        ],
      };

      const events = await request(
        baseUrl,
        options.apiKey,
        "POST",
        "/api/sync/events",
        eventBody
      );

      if (events.status === 200) {
        results.push(pass("POST /api/sync/events", `HTTP ${events.status}`));
      } else if (events.status === 404) {
        results.push(
          fail(
            "POST /api/sync/events",
            "HTTP 404 — calendar source not found. Run with --post-calendar first."
          )
        );
      } else {
        results.push(
          fail("POST /api/sync/events", `HTTP ${events.status}: ${events.body.slice(0, 300)}`)
        );
      }
    }
  } catch (error) {
    results.push(
      fail("Network", (error as Error).message || "Request failed")
    );
  }

  console.log("Results:");
  for (const result of results) {
    const icon = result.passed ? "PASS" : "FAIL";
    console.log(`  [${icon}] ${result.name}`);
    console.log(`         ${result.detail}`);
  }

  const failed = results.filter((result) => !result.passed).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed.\n`);

  return failed === 0 ? 0 : 1;
}

run().then((code) => {
  process.exit(code);
});
