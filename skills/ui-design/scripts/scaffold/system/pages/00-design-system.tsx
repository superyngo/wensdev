import type { Markup } from "@design/jsx/jsx-runtime";
import { Figure, Page, Row, Section } from "../components/page.tsx";
import { Button, CONTROL_STATES } from "../components/button.tsx";

export default function DesignSystem(): Markup {
  return (
    <Page title="Design system" subtitle="Shared components and their states. App code uses these exactly.">
      <Section title="Button" description="One shape; tone and state change colour only.">
        {(["primary", "secondary"] as const).map((tone) => (
          <Row columns={CONTROL_STATES.length}>
            {CONTROL_STATES.map((state) => (
              <Figure
                title={`${tone} · ${state}`}
                caption={state === "disabled" ? "No hover or press feedback." : undefined}
              >
                <div class="rounded-panel bg-panel p-4 shadow-panel">
                  <Button label="Export" tone={tone} state={state} />
                </div>
              </Figure>
            ))}
          </Row>
        ))}
      </Section>
    </Page>
  );
}
