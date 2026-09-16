# Microsoft Store (MSIX)

**Verified**: this pattern is running in production (confy, live since v0.18.0).

## Mechanism

Microsoft Store Developer CLI (`msstore`) driving the Partner Center **Submission API**. The
CLI creates a submission, uploads the package, and commits it in one call — no hand-rolled
REST calls needed.

**Important:** ship an **unsigned** `.msix`. The Store re-signs every submission with its own
certificate; a package signed with a non-Store cert is rejected outright.

## One-time setup (Partner Center)

1. Register a developer account at partner.microsoft.com/dashboard (individual, one-time fee).
2. Reserve the app name, create the app listing.
3. *Product management → Product identity* — copy `Package/Identity/Name`,
   `Package/Identity/Publisher`, `Package/Properties/PublisherDisplayName` into the app's
   `AppxManifest.xml` (as GitHub **repository variables** if CI bakes them in at build time —
   until set, a Store upload fails identity validation even though sideload testing works).
4. Register a Microsoft Entra ID application; in Partner Center *Account settings → User
   management → Microsoft Entra applications*, assign it the **Manager** role. Collect:
   - Tenant ID
   - Client (application) ID
   - Client secret
   - Seller ID (*Account settings → Developer settings*)
   - Store product ID (*App identity → "Store ID"*)
5. Create a GitHub **Environment** (e.g. `publish-gate`) with a required reviewer — see the
   main SKILL.md's gate pattern.

## Required secrets

| Secret | Source |
|---|---|
| `MSIX_SUBMISSION_TENANT_ID` | Entra ID app registration |
| `MSIX_SUBMISSION_CLIENT_ID` | Entra ID app registration |
| `MSIX_SUBMISSION_CLIENT_SECRET` | Entra ID app registration |
| `MSIX_SUBMISSION_SELLER_ID` | Partner Center → Developer settings |
| `MSIX_SUBMISSION_APP_ID` | Partner Center → App identity → Store ID |

## Workflow

Runs on **`windows-latest`, not `ubuntu-latest`** — the `msstore` CLI's Linux credential store
needs `libsecret` + a D-Bus Secret Service daemon that headless Ubuntu runners don't have;
Windows DPAPI works headless with no extra setup.

```yaml
name: Publish to Microsoft Store
on:
  workflow_dispatch:
    inputs:
      tag:
        description: "Release tag whose .msix to publish (e.g. v0.18.0)"
        required: true
      run_id:
        description: "Run ID of the Release workflow that built the .msix"
        required: true

permissions:
  contents: read

jobs:
  publish:
    runs-on: windows-latest
    steps:
      - uses: actions/download-artifact@v5
        with:
          name: <ARTIFACT_NAME>            # e.g. desktop-x86_64-pc-windows-msvc
          path: msix
          run-id: ${{ inputs.run_id }}
          github-token: ${{ secrets.GITHUB_TOKEN }}

      - uses: microsoft/microsoft-store-apppublisher@v1.2

      - name: Configure Microsoft Store Developer CLI
        shell: bash
        run: |
          msstore reconfigure \
            --tenantId ${{ secrets.MSIX_SUBMISSION_TENANT_ID }} \
            --sellerId ${{ secrets.MSIX_SUBMISSION_SELLER_ID }} \
            --clientId ${{ secrets.MSIX_SUBMISSION_CLIENT_ID }} \
            --clientSecret ${{ secrets.MSIX_SUBMISSION_CLIENT_SECRET }}

      - name: Submit and publish to the Store
        shell: bash
        run: msstore publish msix/<PACKAGE_NAME>.msix -id ${{ secrets.MSIX_SUBMISSION_APP_ID }}
```

`-id` is always passed explicitly (the CLI's "only needed if not `msstore init`-ed" caveat
doesn't apply to a repo that never ran `msstore init` / has no local `msstore.json`).

## Sideload testing (before Store identity exists)

```powershell
New-SelfSignedCertificate -Type Custom -Subject "CN=00000000-0000-0000-0000-000000000000" `
  -KeyUsage DigitalSignature -FriendlyName my-app-dev -CertStoreLocation Cert:\CurrentUser\My `
  -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3", "2.5.29.19={text}")
# export it, import into LocalMachine\TrustedPeople, then:
signtool sign /fd SHA256 /a <package>.msix
Add-AppxPackage <package>.msix
```

## Shipping a CLI/TUI inside the GUI's package — decide this before the manifest exists

If the product has a console binary (CLI, TUI, headless worker) and you want the MSIX to expose
it, that is a **manifest-shape decision, not a packaging afterthought**: it costs a second
`<Application>` node, a second visible Start-menu entry with its own DisplayName and icons, and
a listing that explains both. Retrofitting it produced three consecutive Store-blocking defects:

- **An `AppExecutionAlias` always launches its parent `<Application>` node's `Executable`.**
  Nested under the GUI's node, the `mytool` alias silently opened the GUI — even though the
  console `mytool.exe` was bundled in the same package. The alias extension must sit inside an
  `<Application>` whose `Executable` *is* the console binary.
- **`Application/@Id` must match `([A-Za-z][A-Za-z0-9]*)(\.[A-Za-z][A-Za-z0-9]*)*`.** A hyphen
  fails the package build, not the submission: `MakeAppx C00CE169`. `my-app-cli` → `myappcli`.
  The Id is internal — the Start-menu entry and the alias are unaffected by the rename.
- **`AppListEntry="none"` makes the package a *headless app*,** which Store certification
  rejects unless you hold the `HeadlessAppBypass` waiver. Hiding the console node from the Start
  menu is therefore not free: either keep it listed with a distinct DisplayName ("MyApp (CLI)")
  or apply for the waiver before submitting.

Plan accordingly: choose GUI-only or GUI+CLI up front, budget the extra icon set and
DisplayName strings (including localized listing copy), and make the release build place the
console binary in the package root next to the GUI executable.

## Gotchas

- Ship unsigned; the Store re-signs. Signing with any other cert = rejection.
- `windows-latest` runner required for the publish step (headless credential store).
- `x.y.z.0` version derived from the git tag must match the identity manifest.
- WebView2 runtime cannot be bundled in the MSIX — rely on the inbox/Edge-updated runtime on
  Windows 10/11; a machine without it shows a WebView2 error at launch.
- Per-release listing metadata is a **source file, not a portal action** if you keep
  `listings/listingData-<StoreId>.csv` in the repo: its `ReleaseNotes` column must be updated in
  the same release commit as the version bumps, or the Store shows the previous version's notes.
- Review time after submission varies — CI automates the upload/submit, not the approval.

## Docs

- Microsoft Store Developer CLI: <https://github.com/microsoft/store-submission-cli>
- Submission API: <https://learn.microsoft.com/windows/uwp/monetize/create-and-manage-submissions-using-windows-store-services>
