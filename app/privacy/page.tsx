import type { Metadata } from "next"
import Link from "next/link"
import { PageWrapper } from "../../components/page-wrapper"
import { LegalContent } from "../../components/legal-content"

export const metadata: Metadata = {
  title: "Privacy Policy — solhun.com",
  description: "How solhun.com, CLI Manager and FAIR Social Ops handle personal data and Google user data.",
  alternates: { canonical: "/privacy" },
}

export default function PrivacyPage() {
  return (
    <PageWrapper>
      <LegalContent title="Privacy Policy" updated="September 14, 2026">
        <section>
          <p>
            This policy explains what information is collected by <strong>solhun.com</strong> (including the CLI Manager
            pages) and by <strong>FAIR Social Ops</strong>, a content-publishing tool operated by solhun. Questions:{" "}
            <a href="mailto:solhun.jeong@gmail.com">solhun.jeong@gmail.com</a>.
          </p>
        </section>

        <section>
          <h2>1. Information collected on this website</h2>
          <ul>
            <li>
              <strong>Feedback and comments</strong> you submit on the Feedback and Roadmap pages: the message and an optional
              name. They are stored in our database so they can be shown on the site and answered.
            </li>
            <li>
              <strong>Usage analytics</strong> through Google Analytics, which uses cookies to measure aggregate visits. You can
              block it with your browser settings or the Google Analytics opt-out add-on.
            </li>
            <li>
              <strong>Downloads</strong> of CLI Manager are served by a file host that may keep standard access logs (IP address,
              user agent, time).
            </li>
          </ul>
        </section>

        <section>
          <h2>2. FAIR Social Ops and Google user data</h2>
          <p>
            <Link href="/apps/fair-social-ops">FAIR Social Ops</Link> is used by its operator to publish, update and delete
            videos on YouTube channels the operator owns or manages, and to read those channels&apos; performance metrics. It
            requests access to a Google account only after the account owner signs in and grants consent.
          </p>
          <ul>
            <li>
              <strong>YouTube Data API</strong> (<code>youtube.force-ssl</code>): upload videos, edit video details, delete
              videos, and list the authorized channel&apos;s own videos.
            </li>
            <li>
              <strong>YouTube Analytics API</strong> (<code>yt-analytics.readonly</code>): read metrics for the authorized
              channel and its videos.
            </li>
          </ul>
          <p>
            Google user data is used only to carry out publishing actions the operator has approved, to confirm their result,
            and to show the operator the channel&apos;s metrics. It is not sold, not shared with third parties, not used for
            advertising, and not used to develop, improve or train generalized AI or machine-learning models.
          </p>
          <p>
            FAIR Social Ops&apos; use and transfer of information received from Google APIs adheres to the{" "}
            <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </p>
        </section>

        <section>
          <h2>3. Storage, retention and deletion</h2>
          <ul>
            <li>
              OAuth tokens are kept in the operator&apos;s private configuration (readable only by the operator&apos;s account)
              and as an encrypted secret of the operator&apos;s own cloud worker. They are never committed to source code.
            </li>
            <li>Video IDs and publishing status are kept in the operator&apos;s workflow database to track what was published.</li>
            <li>
              Tokens are kept until access is revoked. You can revoke access at any time at{" "}
              <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">
                myaccount.google.com/permissions
              </a>
              . On request we delete stored tokens and related records within 30 days.
            </li>
          </ul>
        </section>

        <section>
          <h2>4. Children</h2>
          <p>This website and FAIR Social Ops are not directed to children.</p>
        </section>

        <section>
          <h2>5. Changes</h2>
          <p>When this policy changes, the date at the top of this page is updated.</p>
        </section>

        <section>
          <h2>6. Contact</h2>
          <p>
            <a href="mailto:solhun.jeong@gmail.com">solhun.jeong@gmail.com</a>
          </p>
        </section>
      </LegalContent>
    </PageWrapper>
  )
}
