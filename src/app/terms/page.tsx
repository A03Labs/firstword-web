import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import { CONTACT_EMAIL, SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { displayLg, eyebrowOnInk, ledeOnInk, shell } from "../components/styles";

export const metadata: Metadata = {
    title: "Terms of Use",
    description:
        "The terms that govern your use of FirstWord — your account, Bible content, notes and journals, subscriptions, and the limits of what the app promises.",
};

const LAST_UPDATED = "August 27, 2026";

/**
 * Section titles, kept in the same order as the document below so the contents
 * list and the copy cannot drift apart.
 */
const contents = [
    ["01", "About FirstWord"],
    ["02", "Eligibility"],
    ["03", "Your Account"],
    ["04", "Bible Content and Translations"],
    ["05", "Devotionals and Original Content"],
    ["06", "User Notes, Journals, and Other Content"],
    ["07", "AI-Generated or AI-Assisted Content"],
    ["08", "Bible Reading Plans and Spiritual Features"],
    ["09", "Focus and App-Restriction Features"],
    ["10", "Subscriptions and Paid Features"],
    ["11", "Free Trials and Promotional Offers"],
    ["12", "Payments"],
    ["13", "Intellectual Property"],
    ["14", "Third-Party Services"],
    ["15", "Availability of the Service"],
    ["16", "Accuracy of Content"],
    ["17", "Spiritual and Religious Disclaimer"],
    ["18", "Privacy"],
    ["19", "Security"],
    ["20", "Prohibited Uses"],
    ["21", "Termination"],
    ["22", "Account and Data Deletion"],
    ["23", "Disclaimer of Warranties"],
    ["24", "Limitation of Liability"],
    ["25", "Indemnification"],
    ["26", "Changes to These Terms"],
    ["27", "Governing Law"],
    ["28", "Dispute Resolution"],
    ["29", "Severability"],
    ["30", "Entire Agreement"],
    ["31", "Contact Us"],
] as const;

/**
 * Typography for the document body, applied once on the container so each
 * section stays plain JSX.
 *
 * Note these descendant rules outrank a plain utility on the child itself, so
 * anything that needs to differ (the pull-quote) uses a non-<p> element.
 */
const prose = [
    "[&_p]:mb-4 [&_p]:text-base [&_p]:leading-[1.75] [&_p:last-child]:mb-0",
    "[&_ul]:mt-2 [&_ul]:mb-5 [&_ul]:grid [&_ul]:list-disc [&_ul]:gap-1.5 [&_ul]:pl-5",
    "[&_li]:text-base [&_li]:leading-[1.75] marker:text-muted",
    "[&_h3]:mt-8 [&_h3]:mb-2.5 [&_h3]:text-[0.8rem] [&_h3]:font-semibold [&_h3]:uppercase [&_h3]:tracking-[0.14em] [&_h3]:text-muted",
    "[&_strong]:font-bold",
    "[&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-1",
].join(" ");

type TermsSectionProps = {
    number: string;
    title: string;
    children: ReactNode;
};

function TermsSection({ number, title, children }: TermsSectionProps) {
    return (
        <section
            className="scroll-mt-6 py-12 first:pt-0 last:pb-0"
            id={`section-${number}`}
        >
            <span className="mb-3 block text-[0.7rem] font-semibold uppercase tabular-nums tracking-[0.2em] text-muted">
                Section {number.replace(/^0/, "")}
            </span>
            <h2 className="mb-5 text-[clamp(1.5rem,3.2vw,2.15rem)] font-normal leading-[1.1] tracking-[-0.035em] text-balance">
                {title}
            </h2>
            {children}
        </section>
    );
}

function List({ items }: { items: string[] }) {
    return (
        <ul>
            {items.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    );
}

export default function TermsOfUsePage() {
    return (
        <div className="min-h-screen">
            <SiteHeader hide={["terms"]}>
                <div className="pb-16 pt-4 sm:pb-20">
                    <p className={eyebrowOnInk}>The agreement between us</p>
                    <h1 className={`${displayLg} mt-5 max-w-[16ch]`} id="top">
                        Terms of Use
                    </h1>
                    <p className={`${ledeOnInk} mt-7 max-w-[58ch]`}>
                        These terms govern your use of the FirstWord app, website, and related
                        services. By using FirstWord, you agree to them.
                    </p>
                    <span className="mt-9 block text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-on-ink-muted">
                        Last updated: {LAST_UPDATED}
                    </span>
                </div>
            </SiteHeader>

            <div
                className={`${shell} grid items-start gap-10 py-12 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-[clamp(3rem,6vw,6rem)] lg:py-18`}
            >
                {/* 31 sections is too many to scan by scrolling — this is the way in. */}
                <nav
                    className="border border-rule bg-surface-muted p-5 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:border-0 lg:border-l lg:bg-transparent lg:p-0 lg:pl-5"
                    aria-label="Terms of use contents"
                >
                    <p className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted">
                        On this page
                    </p>
                    <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-x-5 gap-y-2 p-0 lg:grid-cols-1">
                        {contents.map(([number, title]) => (
                            <li key={number}>
                                <a
                                    className="grid grid-cols-[1.6rem_minmax(0,1fr)] text-[0.8rem] leading-[1.4] text-muted no-underline transition-colors duration-150 hover:text-foreground focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground motion-reduce:transition-none"
                                    href={`#section-${number}`}
                                >
                                    <span className="font-semibold tabular-nums text-foreground">
                                        {number.replace(/^0/, "")}
                                    </span>
                                    <span>{title}</span>
                                </a>
                            </li>
                        ))}
                    </ol>
                </nav>

                <main
                    className={`min-w-0 max-w-[68ch] divide-y divide-rule border border-rule bg-surface p-6 sm:p-10 lg:p-14 ${prose}`}
                >
                    <TermsSection number="01" title="About FirstWord">
                        <p>
                            Welcome to <strong>FirstWord</strong> (&quot;FirstWord,&quot;
                            &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). These Terms of Use
                            (&quot;Terms&quot;) govern your access to and use of the FirstWord
                            mobile application, website, and related services (collectively, the
                            &quot;Service&quot;).
                        </p>
                        <p>
                            By downloading, accessing, or using FirstWord, you agree to these
                            Terms. If you do not agree with these Terms, please do not use the
                            Service.
                        </p>
                        <p>
                            FirstWord is a Bible and Christian spiritual-growth application
                            designed to help you read Scripture, follow Bible reading plans,
                            engage with devotionals, reflect through notes and journals, and
                            develop consistent Bible-reading and prayer habits.
                        </p>
                        <p>
                            FirstWord is intended to provide educational, inspirational, and
                            spiritual resources. It is not a substitute for professional medical,
                            psychological, legal, financial, or other professional advice.
                        </p>
                    </TermsSection>

                    <TermsSection number="02" title="Eligibility">
                        <p>
                            You must be legally permitted to use the Service in your country or
                            jurisdiction.
                        </p>
                        <p>
                            If you are under the age required to enter into a legally binding
                            agreement in your jurisdiction, you may only use FirstWord with the
                            involvement and permission of a parent or legal guardian where
                            required by law.
                        </p>
                        <p>
                            By using FirstWord, you represent that the information you provide to
                            us is accurate and that you have the legal capacity to agree to these
                            Terms.
                        </p>
                    </TermsSection>

                    <TermsSection number="03" title="Your Account">
                        <p>Certain features may require you to create an account.</p>
                        <p>You are responsible for:</p>
                        <List
                            items={[
                                "Providing accurate account information",
                                "Maintaining the confidentiality of your login credentials",
                                "Keeping your account secure",
                                "All activity that occurs through your account",
                                "Not sharing your account credentials with others where such sharing is prohibited",
                            ]}
                        />
                        <p>
                            You should notify us promptly if you believe your account has been
                            accessed without your authorization.
                        </p>
                        <p>
                            We reserve the right to suspend or terminate accounts that violate
                            these Terms or are used for unlawful, abusive, fraudulent, or harmful
                            activity.
                        </p>
                    </TermsSection>

                    <TermsSection number="04" title="Bible Content and Translations">
                        <p>
                            FirstWord may provide access to Bible translations and other
                            Scripture-related content.
                        </p>
                        <p>
                            Bible translations are owned by their respective copyright holders and
                            may be subject to separate copyright notices, licenses, and usage
                            restrictions.
                        </p>
                        <p>
                            FirstWord does not claim ownership of Bible translations that are
                            owned or licensed by third parties.
                        </p>
                        <p>
                            Your use of a particular Bible translation through FirstWord may be
                            subject to the terms and copyright requirements applicable to that
                            translation.
                        </p>
                        <p>
                            You may not reproduce, redistribute, sell, publicly republish, or
                            commercially exploit copyrighted Bible translation content accessed
                            through FirstWord except as permitted by applicable law or the
                            relevant rights holder.
                        </p>
                        <p>
                            Where a Bible translation is provided under a public-domain or open
                            license, its use remains subject to the applicable license.
                        </p>
                    </TermsSection>

                    <TermsSection number="05" title="Devotionals and Original Content">
                        <p>
                            FirstWord may provide devotionals, reflections, prayers, reading
                            plans, explanations, educational materials, and other original
                            content.
                        </p>
                        <p>
                            Unless otherwise stated, content created by FirstWord is owned by or
                            licensed to FirstWord and is protected by applicable
                            intellectual-property laws.
                        </p>
                        <p>
                            You may access and use such content for your personal, non-commercial
                            spiritual and educational use.
                        </p>
                        <p>
                            You may not reproduce, distribute, sell, modify, publicly display, or
                            commercially exploit FirstWord&apos;s original content without our
                            prior written permission.
                        </p>
                    </TermsSection>

                    <TermsSection number="06" title="User Notes, Journals, and Other Content">
                        <p>
                            FirstWord may allow you to create or store personal content,
                            including:
                        </p>
                        <List
                            items={[
                                "Scripture notes",
                                "Devotional reflections",
                                "Prayer notes",
                                "Journal entries",
                                "Bookmarks",
                                "Reading progress",
                                "Other content you choose to create within the Service",
                            ]}
                        />
                        <p>
                            <strong>You retain ownership of your original user-generated content.</strong>
                        </p>
                        <p>
                            You grant FirstWord only the limited rights reasonably necessary to
                            provide, operate, maintain, secure, and improve the Service, including
                            storing and synchronizing your content where applicable.
                        </p>
                        <p>
                            You are responsible for the content you create or store through
                            FirstWord.
                        </p>
                        <p>
                            You must not use the Service to create, upload, store, or distribute
                            content that:
                        </p>
                        <List
                            items={[
                                "Violates applicable law",
                                "Infringes another person's intellectual-property rights",
                                "Contains malicious software or harmful code",
                                "Attempts to compromise the security of the Service",
                                "Harasses, threatens, or abuses others",
                                "Facilitates illegal activity",
                                "Attempts to interfere with the operation of the Service",
                            ]}
                        />
                        <p>
                            We may remove content or restrict access to content where reasonably
                            necessary to comply with law, protect users, protect our systems, or
                            enforce these Terms.
                        </p>
                    </TermsSection>

                    <TermsSection number="07" title="AI-Generated or AI-Assisted Content">
                        <p>
                            If FirstWord introduces AI-powered features, including AI-generated
                            explanations, reflections, summaries, recommendations, or other
                            content, such content may contain inaccuracies or errors.
                        </p>
                        <p>
                            AI-generated content should not be treated as authoritative
                            theological, medical, legal, or professional advice.
                        </p>
                        <p>
                            You are responsible for evaluating AI-generated content and should
                            consult appropriate human sources, including qualified theological or
                            pastoral authorities, where appropriate.
                        </p>
                    </TermsSection>

                    <TermsSection number="08" title="Bible Reading Plans and Spiritual Features">
                        <p>
                            FirstWord may provide reading plans, reminders, streaks, progress
                            tracking, devotional schedules, prayer prompts, and similar features.
                        </p>
                        <p>
                            These features are intended to encourage consistent spiritual habits
                            but do not guarantee any particular spiritual, emotional, behavioral,
                            or religious outcome.
                        </p>
                        <p>
                            Reading plans and schedules may be changed, discontinued, or updated
                            from time to time.
                        </p>
                    </TermsSection>

                    <TermsSection number="09" title="Focus and App-Restriction Features">
                        <p>
                            FirstWord may provide features designed to help you reduce
                            distractions or restrict access to other applications or device
                            functions.
                        </p>
                        <p>
                            These features may depend on operating-system capabilities,
                            permissions, device settings, or third-party platform restrictions.
                        </p>
                        <p>
                            We do not guarantee that such features will work on every device,
                            operating-system version, or configuration.
                        </p>
                        <p>
                            You are responsible for understanding and configuring device
                            permissions and restrictions appropriately.
                        </p>
                        <p>
                            FirstWord is not responsible for loss of access to other applications,
                            device functions, data, or services resulting from your configuration
                            or use of these features.
                        </p>
                    </TermsSection>

                    <TermsSection number="10" title="Subscriptions and Paid Features">
                        <p>
                            Some FirstWord features may be available only through a paid
                            subscription or one-time purchase.
                        </p>
                        <p>
                            Before completing a purchase, you will be shown the applicable price
                            and relevant purchase information.
                        </p>
                        <p>
                            Subscriptions purchased through the Apple App Store or Google Play may
                            be subject to the respective platform&apos;s payment, renewal,
                            cancellation, and refund policies.
                        </p>
                        <p>
                            Unless otherwise stated, subscriptions may automatically renew until
                            cancelled.
                        </p>
                        <p>
                            You are responsible for cancelling your subscription before the next
                            renewal period if you do not wish to continue being charged.
                        </p>
                        <p>
                            <strong>
                                Deleting the FirstWord app does not necessarily cancel an active
                                subscription.
                            </strong>
                        </p>
                        <p>
                            Refunds may be governed by the policies of the platform through which
                            the purchase was made.
                        </p>
                    </TermsSection>

                    <TermsSection number="11" title="Free Trials and Promotional Offers">
                        <p>
                            FirstWord may occasionally provide free trials, promotional offers,
                            discounts, or other special pricing.
                        </p>
                        <p>
                            The terms of each offer will be provided at the time the offer is
                            presented.
                        </p>
                        <p>
                            Unless otherwise stated, we reserve the right to modify or discontinue
                            promotional offers at any time.
                        </p>
                    </TermsSection>

                    <TermsSection number="12" title="Payments">
                        <p>
                            Payments may be processed through third-party payment providers or app
                            stores.
                        </p>
                        <p>
                            FirstWord does not directly store your complete payment-card
                            information unless expressly stated.
                        </p>
                        <p>
                            Your use of third-party payment services may also be subject to the
                            terms and privacy policies of those providers.
                        </p>
                    </TermsSection>

                    <TermsSection number="13" title="Intellectual Property">
                        <p>
                            The FirstWord name, logo, branding, interface, software, original
                            content, graphics, designs, and other materials provided by FirstWord
                            are owned by or licensed to FirstWord and are protected by applicable
                            intellectual-property laws.
                        </p>
                        <p>
                            Except for the limited right to use the Service in accordance with
                            these Terms, no ownership rights are transferred to you.
                        </p>
                        <p>You may not:</p>
                        <List
                            items={[
                                "Copy or reproduce the FirstWord software or interface",
                                "Reverse engineer or attempt to extract source code except where expressly permitted by law",
                                "Modify or create derivative works from the Service",
                                "Sell, sublicense, lease, or redistribute the Service",
                                "Remove copyright, trademark, or other proprietary notices",
                                "Use FirstWord branding without authorization",
                            ]}
                        />
                    </TermsSection>

                    <TermsSection number="14" title="Third-Party Services">
                        <p>
                            FirstWord may integrate with or rely on third-party services,
                            including app stores, authentication providers, analytics services,
                            payment providers, cloud infrastructure, Bible-content providers, and
                            other external services.
                        </p>
                        <p>
                            Third-party services are controlled by their respective providers.
                        </p>
                        <p>
                            We are not responsible for the availability, accuracy, security, or
                            practices of third-party services.
                        </p>
                        <p>
                            Your use of third-party services may be subject to additional terms
                            and privacy policies.
                        </p>
                    </TermsSection>

                    <TermsSection number="15" title="Availability of the Service">
                        <p>
                            We aim to keep FirstWord available and reliable, but we do not
                            guarantee uninterrupted or error-free operation.
                        </p>
                        <p>The Service may occasionally be unavailable because of:</p>
                        <List
                            items={[
                                "Maintenance",
                                "Updates",
                                "Security incidents",
                                "Network failures",
                                "Device or operating-system limitations",
                                "Third-party service outages",
                                "Circumstances beyond our reasonable control",
                            ]}
                        />
                        <p>
                            We reserve the right to modify, suspend, or discontinue any part of
                            the Service at any time.
                        </p>
                    </TermsSection>

                    <TermsSection number="16" title="Accuracy of Content">
                        <p>
                            We make reasonable efforts to provide accurate and useful information.
                        </p>
                        <p>
                            However, we do not guarantee that all content available through
                            FirstWord will always be complete, accurate, current, or error-free.
                        </p>
                        <p>
                            Bible translations, theological explanations, devotionals, educational
                            content, recommendations, and other materials may differ across
                            sources and traditions.
                        </p>
                        <p>
                            You are responsible for exercising your own judgment when using the
                            Service.
                        </p>
                    </TermsSection>

                    <TermsSection number="17" title="Spiritual and Religious Disclaimer">
                        <p>
                            FirstWord is a tool intended to support Bible reading, reflection,
                            prayer, and Christian spiritual practices.
                        </p>
                        <p>
                            FirstWord does not represent itself as a church, denomination, pastor,
                            priest, minister, theologian, or religious authority.
                        </p>
                        <p>
                            The Service is not intended to replace participation in a local
                            church, pastoral care, personal study, or consultation with qualified
                            religious leaders.
                        </p>
                    </TermsSection>

                    <TermsSection number="18" title="Privacy">
                        <p>
                            Your use of FirstWord is also governed by our{" "}
                            <Link href="/privacy">Privacy Policy</Link>, which explains how we
                            collect, use, store, and protect information.
                        </p>
                        <p>
                            By using FirstWord, you acknowledge that you have reviewed our Privacy
                            Policy.
                        </p>
                    </TermsSection>

                    <TermsSection number="19" title="Security">
                        <p>
                            We take reasonable measures to protect the Service and user
                            information.
                        </p>
                        <p>However, no online service can guarantee absolute security.</p>
                        <p>
                            You acknowledge that you use the Service at your own risk and should
                            take reasonable steps to protect your account and device.
                        </p>
                    </TermsSection>

                    <TermsSection number="20" title="Prohibited Uses">
                        <p>You agree not to:</p>
                        <List
                            items={[
                                "Use FirstWord for unlawful purposes",
                                "Attempt to gain unauthorized access to our systems",
                                "Circumvent security or access controls",
                                "Interfere with the operation of the Service",
                                "Introduce viruses, malware, or other harmful code",
                                "Scrape or systematically extract content without authorization",
                                "Abuse, overload, or attack our infrastructure",
                                "Impersonate FirstWord or its employees",
                                "Use the Service to infringe another person's rights",
                                "Attempt to obtain paid features without authorization",
                                "Resell or commercially exploit the Service without permission",
                            ]}
                        />
                    </TermsSection>

                    <TermsSection number="21" title="Termination">
                        <p>You may stop using FirstWord at any time.</p>
                        <p>We may suspend or terminate your access to the Service if:</p>
                        <List
                            items={[
                                "You violate these Terms",
                                "Your use creates a security or legal risk",
                                "You engage in fraudulent or abusive activity",
                                "We are required to do so by law",
                                "We discontinue the Service",
                            ]}
                        />
                        <p>Where appropriate, we may provide notice before taking action.</p>
                        <p>
                            Termination does not automatically entitle you to a refund except
                            where required by applicable law or the applicable purchase
                            platform&apos;s policies.
                        </p>
                    </TermsSection>

                    <TermsSection number="22" title="Account and Data Deletion">
                        <p>
                            You may request deletion of your FirstWord account and associated
                            personal information in accordance with our{" "}
                            <Link href="/privacy">Privacy Policy</Link>. You can start that
                            request on our <Link href="/delete-account">account deletion</Link>{" "}
                            page.
                        </p>
                        <p>
                            Some information may need to be retained where required by law,
                            necessary to resolve disputes, prevent fraud, enforce our agreements,
                            or otherwise permitted by applicable law.
                        </p>
                        <p>
                            Deleting your account may permanently remove your saved notes, journal
                            entries, reading progress, and other account-associated information.
                            You should export or otherwise preserve anything you wish to keep
                            before deleting your account where such functionality is available.
                        </p>
                    </TermsSection>

                    <TermsSection number="23" title="Disclaimer of Warranties">
                        <p>
                            To the maximum extent permitted by applicable law, FirstWord is
                            provided on an &quot;as is&quot; and &quot;as available&quot; basis.
                        </p>
                        <p>We do not guarantee that:</p>
                        <List
                            items={[
                                "The Service will always be available",
                                "The Service will be uninterrupted or error-free",
                                "The content will always be accurate or complete",
                                "The Service will meet every user's requirements",
                                "The Service will operate on every device or operating-system version",
                                "Any particular spiritual, personal, or religious outcome will result from using the Service",
                            ]}
                        />
                        <p>
                            Nothing in these Terms excludes any warranty or consumer right that
                            cannot legally be excluded under applicable law.
                        </p>
                    </TermsSection>

                    <TermsSection number="24" title="Limitation of Liability">
                        <p>
                            To the maximum extent permitted by applicable law, FirstWord and its
                            owners, employees, contractors, affiliates, and service providers will
                            not be liable for indirect, incidental, special, consequential,
                            exemplary, or punitive damages arising from or related to your use of
                            the Service.
                        </p>
                        <p>
                            Where liability cannot legally be excluded, our liability will be
                            limited to the maximum extent permitted by applicable law.
                        </p>
                        <p>
                            Nothing in these Terms limits liability that cannot legally be limited
                            or excluded.
                        </p>
                    </TermsSection>

                    <TermsSection number="25" title="Indemnification">
                        <p>
                            To the extent permitted by applicable law, you agree to indemnify and
                            hold harmless FirstWord and its owners, employees, contractors,
                            affiliates, and service providers from claims, losses, liabilities,
                            damages, and expenses arising from:
                        </p>
                        <List
                            items={[
                                "Your violation of these Terms",
                                "Your unlawful use of the Service",
                                "Your violation of another person's rights",
                                "Content you submit or create through the Service",
                            ]}
                        />
                    </TermsSection>

                    <TermsSection number="26" title="Changes to These Terms">
                        <p>We may update these Terms from time to time.</p>
                        <p>
                            When we make material changes, we may provide notice through the
                            Service or other reasonable means.
                        </p>
                        <p>
                            The updated Terms will become effective on the date indicated at the
                            beginning of the revised Terms.
                        </p>
                        <p>
                            Your continued use of FirstWord after the effective date constitutes
                            acceptance of the updated Terms.
                        </p>
                    </TermsSection>

                    <TermsSection number="27" title="Governing Law">
                        <p>
                            These Terms will be governed by and interpreted in accordance with the
                            laws applicable in the jurisdiction where FirstWord is operated, except
                            where applicable law requires otherwise.
                        </p>
                        <p>
                            Nothing in this section removes protections you are entitled to under
                            the mandatory laws of your own country of residence.
                        </p>
                    </TermsSection>

                    <TermsSection number="28" title="Dispute Resolution">
                        <p>
                            If you have a concern or dispute relating to FirstWord, we encourage
                            you to contact us first so that we can attempt to resolve the issue
                            informally.
                        </p>
                        <p>
                            Nothing in these Terms prevents you from exercising rights or remedies
                            that cannot legally be waived or restricted under applicable law.
                        </p>
                    </TermsSection>

                    <TermsSection number="29" title="Severability">
                        <p>
                            If any provision of these Terms is determined to be invalid or
                            unenforceable, that provision will be enforced to the maximum extent
                            permitted by law, and the remaining provisions will remain in effect.
                        </p>
                    </TermsSection>

                    <TermsSection number="30" title="Entire Agreement">
                        <p>
                            These Terms, together with our{" "}
                            <Link href="/privacy">Privacy Policy</Link> and any additional terms
                            applicable to specific features, constitute the agreement between you
                            and FirstWord regarding your use of the Service.
                        </p>
                    </TermsSection>

                    <TermsSection number="31" title="Contact Us">
                        <p>
                            If you have questions, concerns, or requests regarding these Terms,
                            contact us at:
                        </p>
                        <p>
                            <strong>FirstWord</strong>
                        </p>
                        <p>
                            Website: {" "}
                            <a href="https://firstword.online">firstword.online</a>
                            <br />
                            Email: {" "}
                            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                            <br />
                            Developer: <strong>Alabo Excel</strong>
                        </p>
                        <blockquote className="my-6 border-l-[3px] border-foreground pl-5 text-[1.2rem] leading-[1.55]">
                            By using FirstWord, you acknowledge that you have read, understood, and
                            agreed to these Terms of Use.
                        </blockquote>
                    </TermsSection>
                </main>
            </div>

            <SiteFooter />
        </div>
    );
}
