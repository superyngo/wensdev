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

## Shipping a CLI/TUI inside the GUI's package — one `<Application>` node, alias with `Executable`

If the product has a console binary (CLI, TUI, headless worker) and the MSIX should expose it
on PATH, **do not give it a second `<Application>` node.** Declare the
`windows.appExecutionAlias` extension under the **GUI's** node and set the target on the
extension itself — `uap3:Extension` takes optional `Executable` and `EntryPoint` attributes
(plus `uap11:Subsystem="console"`):

```xml
<Application Id="myapp" Executable="myapp-desktop.exe" EntryPoint="Windows.FullTrustApplication">
  <uap:VisualElements DisplayName="MyApp" … />
  <Extensions>
    <uap3:Extension Category="windows.appExecutionAlias"
                    Executable="mytool.exe" EntryPoint="Windows.FullTrustApplication">
      <uap3:AppExecutionAlias>
        <desktop:ExecutionAlias Alias="mytool.exe" />
      </uap3:AppExecutionAlias>
    </uap3:Extension>
  </Extensions>
</Application>
```

One visible Start-menu entry, `mytool` on PATH runs the console binary, no waiver, no second
icon set or DisplayName to localize. **Verified** (confy, 2026-09-18, real Windows):
`makeappx pack` accepts the attributes, `mytool --help` prints the console binary's usage, the
Start menu shows only the GUI, and the GUI's file associations still work.

Getting here cost four Store-blocking defects, and the trap is that each one's obvious fix is
wrong:

- **An alias launches its parent `<Application>` node's `Executable` unless the extension
  declares its own.** Nested under the GUI node with no `Executable` attribute, the `mytool`
  alias silently opened the **GUI** even though `mytool.exe` was bundled in the same package.
  The fix is the `Executable` attribute above — *not* a second `<Application>` node.
- **A second `<Application>` node is a dead end in both states.** Hidden
  (`AppListEntry="none"` — the only way to keep a node out of the Start menu) the Store
  rejects the **whole package**:
  `Package acceptance validation error: The package file <pkg>.msix specifies a headless app.`
  `You don't have permission to create a headless app. Please update AppListEntry="none" …`
  `and also ensure you have the waiver "HeadlessAppBypass" associated to this app.`
  The check is **per-`<Application>`**: a visible GUI node in the same package does **not**
  exempt a hidden sibling. Left visible, the node installs a tile most console binaries
  cannot serve — a CLI that requires a file argument gets no argv from Start-menu activation,
  so clicking it flashes a usage error and exits.
- **`Application/@Id` must match `([A-Za-z][A-Za-z0-9]*)(\.[A-Za-z][A-Za-z0-9]*)*`.** A hyphen
  fails the package build, not the submission: `MakeAppx C00CE169`. `my-app-cli` → `myappcli`.
- **A winget/scoop-installed copy of the same binary shadows the alias stub**, which is how a
  broken alias survives weeks of "it works for me":
  `%LOCALAPPDATA%\Microsoft\WinGet\Links` precedes `%LOCALAPPDATA%\Microsoft\WindowsApps` in
  the user PATH. Test the alias by the stub, never by PATH:

  ```powershell
  where.exe mytool                                                # expect exactly one hit
  & "$env:LOCALAPPDATA\Microsoft\WindowsApps\mytool.exe" --help    # bypasses PATH order
  ```

Still true regardless of shape: the release build must place the console binary in the package
root next to the GUI executable.

### If you do end up needing `HeadlessAppBypass`

Only a package with **no** visible entry point (a pure CLI or service) genuinely needs it —
and Microsoft's own [packaging-a-CLI guide](https://learn.microsoft.com/windows/apps/dev-tools/winapp-cli/guides/packaging-cli)
prescribes `AppListEntry="none"` without mentioning the waiver, so the rejection is a
surprise. Request it **before** uploading the package: email `storeops@microsoft.com` with the
Store ID, `Identity/Name`, `Identity/Publisher`, publisher display name, the verbatim
validation error, and why the hidden node exists. Expect a reply of the form *"We have enabled
the HeadlessAppBypass waiver for the requested product."* If email goes unanswered, open a
**Business support** ticket
(<https://support.serviceshub.microsoft.com/supportforbusiness/create?sapId=bc9d4067-7218-61b9-1d2c-68ae591acf9d>)
under *Developer, Student and Startup Programs → Dev Center → Account Management* — the
Windows Developer Support form lacks that category and dead-ends. `partnerops@microsoft.com`
is the historically unanswered address.

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
