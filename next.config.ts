import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // `data/bibles/**` is read at request time by the Bible API routes but is not
    // reachable from the module graph, so file tracing cannot infer it. Without
    // this, the generated chapter files are left out of the serverless bundle and
    // every chapter request 500s in production.
    //
    // Versioned assets under `/_next/static` need no entry here: Next already
    // serves them as `public, max-age=31536000, immutable`, and that header
    // cannot be overridden.
    outputFileTracingIncludes: {
        "/api/bibles/**": ["./data/bibles/**/*.json"],
    },
};

export default nextConfig;
