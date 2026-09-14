import type { Metadata } from "next"
import Link from "next/link"
import { PageWrapper } from "../../../components/page-wrapper"
import { LegalContent } from "../../../components/legal-content"

export const metadata: Metadata = {
  title: "FAIR Social Ops — solhun.com",
  description: "FAIR Social Ops publishes and manages approved videos on the operator's own YouTube channels.",
  alternates: { canonical: "/apps/fair-social-ops" },
}

export default function FairSocialOpsPage() {
  return (
    <PageWrapper>
      <LegalContent title="FAIR Social Ops" updated="September 14, 2026">
        <section>
          <p>
            FAIR Social Ops is a content-operations tool run by solhun. It publishes content that has been reviewed and
            approved in the operator&apos;s workflow to social channels the operator owns or manages — currently the{" "}
            <strong>FAIR ERP</strong> YouTube channel — and reports back what happened.
          </p>
        </section>

        <section>
          <h2>What it does</h2>
          <ul>
            <li>Uploads approved videos to the authorized YouTube channel (private first, then as scheduled).</li>
            <li>Updates a video&apos;s description when a revised version is approved.</li>
            <li>Deletes a video when deletion is approved, and confirms the video is gone.</li>
            <li>Reads channel and video metrics so the operator can see how published content performs.</li>
          </ul>
        </section>

        <section>
          <h2>Google account access</h2>
          <p>
            The tool asks for access only after the channel owner signs in with Google and consents. It requests YouTube
            (<code>youtube.force-ssl</code>) and YouTube Analytics read-only (<code>yt-analytics.readonly</code>) access and
            uses them only for the actions above. Access can be revoked at any time at{" "}
            <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">
              myaccount.google.com/permissions
            </a>
            .
          </p>
        </section>

        <section>
          <h2>Policies and contact</h2>
          <p>
            <Link href="/privacy">Privacy Policy</Link> · <Link href="/terms">Terms of Service</Link> ·{" "}
            <a href="mailto:solhun.jeong@gmail.com">solhun.jeong@gmail.com</a>
          </p>
        </section>
      </LegalContent>
    </PageWrapper>
  )
}
