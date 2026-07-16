<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- nextpilot:start -->

## NextPilot Agent Instructions

NextPilot is installed as this project's Next.js development intelligence and validation tool.

Before making meaningful changes:

1. Inspect the existing project structure and conventions.
2. Use available NextPilot MCP tools to inspect relevant routes, components, symbols, dependencies, and diagnostics.
3. Read documentation matching the installed Next.js version before changing framework-specific behavior.
4. Reuse existing components, utilities, validation schemas, and data-access patterns instead of creating duplicates.
5. Prefer Server Components unless client-side state, browser APIs, event handlers, or React client hooks are required.
6. Validate all untrusted input and enforce authorization inside protected mutations.
7. Never expose credentials, tokens, private environment variables, or raw database records to Client Components.
8. Run `npx --no-install nextpilot doctor --root .` after meaningful changes.

Useful CLI commands:

```bash
npx --no-install nextpilot inspect --root .
npx --no-install nextpilot routes --root .
npx --no-install nextpilot inspect-route <route> --root .
npx --no-install nextpilot inspect-component <file> --root .
npx --no-install nextpilot doctor --root .
```

When NextPilot MCP is available, prefer its structured tools for project inspection. Use the CLI for validation, automation, and CI.

<!-- nextpilot:end -->
