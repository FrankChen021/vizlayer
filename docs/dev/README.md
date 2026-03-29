# Developer Publishing

## Publish to npm

Vizlayer publishes these public packages:

- `@vizlayer/core`
- `@vizlayer/react`

Publish `@vizlayer/core` first, then `@vizlayer/react`.

## Prerequisites

- You have npm publish access to the `@vizlayer` scope.
- You have generated an npm access token with publish permission.

## Authenticate

Set the token in your current shell:

```bash
export NPM_TOKEN="YOUR_TOKEN_HERE"
npm config set //registry.npmjs.org/:_authToken "$NPM_TOKEN"
```

Verify authentication:

```bash
npm whoami
```

## Validate the workspace

From the repository root:

```bash
pnpm install --no-frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Versioning

When publishing a fix or release, bump the package versions first.

For coordinated releases of `@vizlayer/core` and `@vizlayer/react`, keep them in sync and ensure `@vizlayer/react` depends on a real semver range such as `^0.1.3` for `@vizlayer/core`.

Do not publish `@vizlayer/react` with `@vizlayer/core: "workspace:*"` in its package manifest, because downstream npm consumers cannot install that published artifact.

## Publish packages

Publish `@vizlayer/core` first:

```bash
cd /Users/frank.chenling/source/open/vizlayer/packages/core
npm publish --access public
```

Then publish `@vizlayer/react`:

```bash
cd /Users/frank.chenling/source/open/vizlayer/packages/react
npm publish --access public
```

## Notes

- Scoped packages need `--access public` on first publish.
- If npm reports that a version already exists, bump the version in that package before retrying.
- If your npm setup requires OTP instead of a bypass-capable token, use:

```bash
npm publish --access public --otp <code>
```
