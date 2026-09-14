import type { Metadata } from "next"
import Link from "next/link"
import { PageWrapper } from "../../components/page-wrapper"
import { LegalContent } from "../../components/legal-content"

export const metadata: Metadata = {
  title: "Terms of Service — solhun.com",
  description: "Terms for using solhun.com, CLI Manager and FAIR Social Ops.",
  alternates: { canonical: "/terms" },
}

export default function TermsPage() {
  return (
    <PageWrapper>
      <LegalContent title="Terms of Service" updated="September 14, 2026">
        <section>
          <p>
            These terms apply to <strong>solhun.com</strong>, the CLI Manager software offered here, and{" "}
            <Link href="/apps/fair-social-ops">FAIR Social Ops</Link>. By using them you agree to these terms.
          </p>
        </section>

        <section>
          <h2>1. The website and CLI Manager</h2>
          <p>
            The website provides information, documentation and downloads. CLI Manager is provided &quot;as is&quot;, without
            warranties of any kind. You are responsible for how you use it with your own tools and accounts.
          </p>
        </section>

        <section>
          <h2>2. FAIR Social Ops</h2>
          <ul>
            <li>FAIR Social Ops is an operator tool. Only the operator and people the operator authorizes may use it.</li>
            <li>
              It acts on a Google or social account only after that account&apos;s owner grants consent, and only for publishing
              actions approved in the operator&apos;s workflow. Consent can be revoked at any time from the account&apos;s
              security settings.
            </li>
            <li>
              Use of YouTube features is also subject to the{" "}
              <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">
                YouTube Terms of Service
              </a>{" "}
              and the{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                Google Privacy Policy
              </a>
              .
            </li>
          </ul>
        </section>

        <section>
          <h2>3. Acceptable use</h2>
          <p>Do not use this website or its tools to break the law, infringe others&apos; rights, or disrupt the services.</p>
        </section>

        <section>
          <h2>4. Liability</h2>
          <p>
            To the extent permitted by law, solhun is not liable for indirect or consequential damages arising from use of
            the website, CLI Manager or FAIR Social Ops.
          </p>
        </section>

        <section>
          <h2>5. Changes and governing law</h2>
          <p>
            These terms may be updated; the date above shows the latest version. These terms are governed by the laws of the
            Republic of Korea.
          </p>
        </section>

        <section>
          <h2>6. Contact</h2>
          <p>
            <a href="mailto:solhun.jeong@gmail.com">solhun.jeong@gmail.com</a> ·{" "}
            <Link href="/privacy">Privacy Policy</Link>
          </p>
        </section>
      </LegalContent>
    </PageWrapper>
  )
}
