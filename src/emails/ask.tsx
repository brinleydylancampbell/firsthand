import { Body, Button, Container, Head, Html, Preview, Text } from "@react-email/components";

/**
 * The scheduled ask. Plain, short, one button. The owner's body copy is
 * rendered paragraph by paragraph; the {{link}} placeholder becomes the button.
 */
export function AskEmail({ body, link, workspaceName, accent }: { body: string; link: string; workspaceName: string; accent: string }) {
  const paragraphs = body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return (
    <Html lang="en">
      <Head />
      <Preview>{paragraphs[0]?.slice(0, 120) ?? `A quick question from ${workspaceName}`}</Preview>
      <Body style={{ margin: 0, background: "#ffffff", fontFamily: "-apple-system, Segoe UI, Helvetica, Arial, sans-serif", color: "#141414" }}>
        <Container style={{ maxWidth: 520, padding: "32px 24px" }}>
          <Text style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8c8c8c", margin: "0 0 20px" }}>{workspaceName}</Text>
          {paragraphs.map((p, i) =>
            p === link ? (
              <Button key={i} href={link} style={{ background: accent, color: "#ffffff", padding: "12px 18px", borderRadius: 2, fontSize: 15, fontWeight: 600, textDecoration: "none", display: "inline-block", margin: "6px 0 14px" }}>
                Share how it went
              </Button>
            ) : (
              <Text key={i} style={{ fontSize: 16, lineHeight: "26px", margin: "0 0 16px", whiteSpace: "pre-wrap" }}>
                {p.split(link).map((chunk, j, arr) =>
                  j < arr.length - 1 ? (
                    <span key={j}>
                      {chunk}
                      <a href={link} style={{ color: accent }}>{link}</a>
                    </span>
                  ) : (
                    chunk
                  ),
                )}
              </Text>
            ),
          )}
          <Text style={{ fontSize: 12, lineHeight: "18px", color: "#8c8c8c", margin: "28px 0 0" }}>
            You are getting this because you recently worked with {workspaceName}. It is a one-off; there is no list to unsubscribe from. Nothing you write is published without your say-so.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
