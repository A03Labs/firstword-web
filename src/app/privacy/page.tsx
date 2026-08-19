import type { ReactNode } from "react";

type PolicySectionProps = {
    number: string;
    title: string;
    children: ReactNode;
};

function PolicySection({ number, title, children }: PolicySectionProps) {
    return (
        <section className="policy-section" id={`section-${number}`}>
            <span className="section-number">Section {number.replace(/^0/, "")}</span>
            <h2 className="section-title">{title}</h2>
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

export default function Home() {
    return (
        <div className="policy-shell">
            <header className="policy-header">
                <div className="header-inner">
                    <a className="brand" href="#top" aria-label="FirstWord home">
                        <span className="brand-mark" aria-hidden="true">
                            F
                        </span>
                        FirstWord
                    </a>
                    <p className="eyebrow">A quiet place for what matters</p>
                    <h1 className="policy-title" id="top">
                        Privacy Policy
                    </h1>
                    <p className="policy-intro">
                        FirstWord is designed to help you spend more time in God&apos;s Word,
                        with your reading, prayers, and reflections kept yours.
                    </p>
                    <span className="updated">Last updated: August 18, 2026</span>
                </div>
            </header>

            <main className="">
                {/* <nav className="contents" aria-label="Privacy policy contents">
                    <p className="contents-title">On this page</p>
                    <ol className="contents-list">
                        {contents.map(([number, title]) => (
                            <li key={number}>
                                <a href={`#section-${number}`}>
                                    {number.replace(/^0/, "")} {title}
                                </a>
                            </li>
                        ))}
                    </ol>
                </nav> */}

                <article className="policy-copy">
                    <PolicySection number="01" title="Information We Collect">
                        <p>We collect information necessary to provide and improve FirstWord.</p>
                        <h3>1.1 Account Information</h3>
                        <p>If you create an account, we may collect:</p>
                        <List
                            items={[
                                "Email address",
                                "Name or display name",
                                "Profile photo, if provided",
                                "Authentication information",
                                "User ID",
                                "Account creation date",
                            ]}
                        />
                        <p>
                            If you sign in using a third-party provider such as Apple or Google,
                            we may receive information that the provider makes available to us
                            according to your authorization and their privacy policies.
                        </p>
                    </PolicySection>

                    <PolicySection number="02" title="Bible Reading Data">
                        <p>
                            FirstWord may store information about your Bible-reading activity,
                            including:
                        </p>
                        <List
                            items={[
                                "Preferred Bible translation",
                                "Books and chapters read",
                                "Reading history",
                                "Reading-plan progress",
                                "Devotional progress",
                                "Reading streaks",
                                "Reading duration",
                                "Last-read location",
                            ]}
                        />
                        <p>This information allows FirstWord to provide features such as:</p>
                        <List
                            items={[
                                "Continue Reading",
                                "Reading plans",
                                "Reading progress",
                                "Streaks",
                                "Reading statistics",
                                "Personalized recommendations",
                            ]}
                        />
                    </PolicySection>

                    <PolicySection number="03" title="Notes, Reflections, Prayers, and Journals">
                        <p>FirstWord allows you to create private personal content, including:</p>
                        <List
                            items={[
                                "Scripture notes",
                                "Devotional reflections",
                                "Prayer entries",
                                "Journal entries",
                                "Bookmarks",
                                "Highlights",
                            ]}
                        />
                        <p>This information may contain highly personal content.</p>
                        <p>
                            <strong>Your personal content is private by default.</strong>
                        </p>
                        <p>
                            We do not sell your notes, prayers, reflections, or journal entries.
                            We do not use the contents of your private notes or prayers for
                            advertising.
                        </p>
                        <p>
                            If cloud synchronization is enabled, this information may be securely
                            stored on our servers so that it can be restored and synchronized
                            across your devices.
                        </p>
                    </PolicySection>

                    <PolicySection number="04" title="Focus Mode and App Blocking">
                        <p>
                            FirstWord provides Focus Mode features designed to help reduce
                            distractions while reading Scripture.
                        </p>
                        <p>
                            Depending on your device and operating system, FirstWord may require
                            access to system features that allow it to:
                        </p>
                        <List
                            items={[
                                "Identify applications selected for blocking",
                                "Determine whether a focus session is active",
                                "Apply or remove app restrictions",
                                "Track focus-session duration",
                                "Determine whether the required reading or devotional activity has been completed",
                            ]}
                        />
                        <p>
                            FirstWord does <strong>not</strong> need to collect the contents of
                            other applications.
                        </p>
                        <p>
                            Where possible, application-blocking information is processed and
                            stored locally on your device.
                        </p>
                        <p>We do not sell information about the applications you choose to block.</p>
                    </PolicySection>

                    <PolicySection number="05" title="Device and Technical Information">
                        <p>
                            We may automatically receive limited technical information when you
                            use FirstWord, such as:
                        </p>
                        <List
                            items={[
                                "Device type",
                                "Operating system",
                                "App version",
                                "Language",
                                "Time zone",
                                "General device configuration",
                                "Crash information",
                                "Diagnostic information",
                            ]}
                        />
                        <p>This information helps us:</p>
                        <List
                            items={[
                                "Fix bugs",
                                "Improve performance",
                                "Understand compatibility problems",
                                "Improve the reliability of FirstWord",
                            ]}
                        />
                        <p>
                            We do not use this information to identify you personally unless
                            necessary to provide a requested service.
                        </p>
                    </PolicySection>

                    <PolicySection number="06" title="Notifications">
                        <p>
                            If you enable notifications, FirstWord may store notification
                            preferences such as:
                        </p>
                        <List
                            items={[
                                "Daily reading reminder time",
                                "Devotional reminders",
                                "Prayer reminders",
                                "Focus reminders",
                                "Streak reminders",
                            ]}
                        />
                        <p>
                            You can disable notifications through FirstWord&apos;s settings or
                            your device&apos;s operating-system settings.
                        </p>
                    </PolicySection>

                    <PolicySection number="07" title="Location Information">
                        <p>
                            FirstWord does not require precise location information to provide its
                            core Bible, devotional, prayer, notes, or focus features.
                        </p>
                        <p>
                            We may use your device&apos;s time zone or locale to provide
                            appropriately timed reminders and display dates correctly.
                        </p>
                        <p>We do not sell precise location information.</p>
                    </PolicySection>

                    <PolicySection number="08" title="Payments and Subscriptions">
                        <p>FirstWord may offer paid subscriptions or other premium features.</p>
                        <p>
                            Payments made through the Apple App Store or Google Play are processed
                            by the applicable platform.
                        </p>
                        <p>We do not receive or store your full credit-card or debit-card number.</p>
                        <p>
                            We may receive information necessary to determine your subscription
                            status, such as:
                        </p>
                        <List
                            items={[
                                "Product purchased",
                                "Subscription status",
                                "Purchase date",
                                "Renewal date",
                                "Expiration date",
                                "Transaction or purchase identifier",
                            ]}
                        />
                        <p>This information allows us to provide Premium features to eligible users.</p>
                        <p>
                            If we later offer payments through the FirstWord website, payments may
                            be processed by a third-party payment provider. Payment information
                            will be handled according to that provider&apos;s privacy policy.
                        </p>
                    </PolicySection>

                    <PolicySection number="09" title="Third-Party Services">
                        <p>
                            FirstWord may use trusted third-party services to provide functionality
                            such as authentication, cloud storage, analytics, notifications,
                            payments, crash reporting, and Bible content.
                        </p>
                        <p>These services may include providers such as:</p>
                        <List
                            items={[
                                "Supabase",
                                "Apple",
                                "Google",
                                "Expo",
                                "Bible content providers",
                                "Payment processors",
                                "Analytics or crash-reporting providers",
                            ]}
                        />
                        <p>
                            These providers may process information according to their own privacy
                            policies and applicable agreements with us.
                        </p>
                        <p>
                            We only use third-party services that are reasonably necessary to
                            operate and improve FirstWord.
                        </p>
                    </PolicySection>

                    <PolicySection number="10" title="Bible Content">
                        <p>
                            Bible text may be retrieved from third-party Bible content providers.
                        </p>
                        <p>
                            Your Bible reading requests may be processed by the relevant provider
                            in order to retrieve the requested Scripture.
                        </p>
                        <p>We do not sell your Bible-reading activity.</p>
                        <p>
                            Some Bible translations may be subject to copyright and licensing
                            restrictions. FirstWord displays applicable copyright information where
                            required.
                        </p>
                    </PolicySection>

                    <PolicySection number="11" title="How We Use Your Information">
                        <p>We use collected information to:</p>
                        <List
                            items={[
                                "Provide FirstWord's features",
                                "Maintain your account",
                                "Synchronize your data",
                                "Save reading progress",
                                "Save notes and prayers",
                                "Maintain reading streaks",
                                "Provide devotionals",
                                "Provide focus features",
                                "Process subscriptions",
                                "Send requested notifications",
                                "Provide customer support",
                                "Detect and prevent abuse",
                                "Diagnose technical problems",
                                "Improve the application",
                                "Comply with applicable legal obligations",
                            ]}
                        />
                        <p>We do not sell your personal information.</p>
                    </PolicySection>

                    <PolicySection number="12" title="Advertising">
                        <p>At launch, FirstWord may not display third-party advertising.</p>
                        <p>
                            If advertising is introduced in the future, this Privacy Policy will
                            be updated before or when the relevant functionality becomes available.
                        </p>
                        <p>
                            Where required, we will provide appropriate controls for personalized
                            advertising.
                        </p>
                    </PolicySection>

                    <PolicySection number="13" title="Data Sharing">
                        <p>We do not sell your personal information.</p>
                        <p>
                            We may share limited information with service providers when necessary
                            to operate FirstWord.
                        </p>
                        <p>Examples include:</p>
                        <List
                            items={[
                                "Authentication providers",
                                "Cloud infrastructure providers",
                                "Payment providers",
                                "Notification providers",
                                "Crash-reporting providers",
                                "Analytics providers",
                                "Bible content providers",
                            ]}
                        />
                        <p>We may also disclose information when required to:</p>
                        <List
                            items={[
                                "Comply with applicable law",
                                "Respond to valid legal requests",
                                "Protect the rights or safety of users",
                                "Prevent fraud or abuse",
                                "Protect the security of FirstWord",
                            ]}
                        />
                    </PolicySection>

                    <PolicySection number="14" title="Your Private Content">
                        <p>
                            Your notes, prayers, reflections, highlights, bookmarks, and journal
                            entries are intended to remain private.
                        </p>
                        <p>
                            We will not make this content publicly accessible unless you explicitly
                            use a feature that allows you to publish or share it.
                        </p>
                        <p>
                            If FirstWord later introduces community or public-content features,
                            those features will have separate controls and will clearly explain
                            when content becomes public.
                        </p>
                    </PolicySection>

                    <PolicySection number="15" title="Data Security">
                        <p>
                            We take reasonable technical and organizational measures to protect
                            your information.
                        </p>
                        <p>These may include:</p>
                        <List
                            items={[
                                "Encrypted connections",
                                "Authentication controls",
                                "Database access controls",
                                "Row-level security",
                                "Secure server infrastructure",
                                "Limited employee access",
                                "Secure credential handling",
                            ]}
                        />
                        <p>However, no internet-based service can guarantee absolute security.</p>
                        <p>You are responsible for keeping your account credentials secure.</p>
                    </PolicySection>

                    <PolicySection number="16" title="Data Retention">
                        <p>
                            We retain information for as long as necessary to provide FirstWord&apos;s
                            services and fulfill the purposes described in this Privacy Policy.
                        </p>
                        <p>
                            When you delete your account, we will delete or anonymize your personal
                            information within a reasonable period, subject to:
                        </p>
                        <List
                            items={[
                                "Legal requirements",
                                "Fraud prevention",
                                "Security requirements",
                                "Backup retention",
                                "Legitimate business purposes",
                            ]}
                        />
                        <p>
                            Some information may remain temporarily in encrypted backups before
                            being permanently deleted.
                        </p>
                    </PolicySection>

                    <PolicySection number="17" title="Account Deletion">
                        <p>You may request deletion of your FirstWord account.</p>
                        <p>
                            When an account is deleted, we will delete or anonymize information
                            associated with the account, subject to applicable legal and security
                            requirements.
                        </p>
                        <p>Account deletion may result in the permanent loss of:</p>
                        <List
                            items={[
                                "Notes",
                                "Prayers",
                                "Reflections",
                                "Journal entries",
                                "Reading history",
                                "Reading-plan progress",
                                "Highlights",
                                "Bookmarks",
                                "Streak history",
                                "Other account-associated data",
                            ]}
                        />
                        <p>
                            We recommend exporting any information you want to retain before
                            deleting your account, where export functionality is available.
                        </p>
                    </PolicySection>

                    <PolicySection number="18" title="Children's Privacy">
                        <p>
                            FirstWord is not intentionally designed to collect personal information
                            from children below the minimum age required by applicable law.
                        </p>
                        <p>
                            We do not knowingly collect personal information from children without
                            appropriate authorization where required by law.
                        </p>
                        <p>
                            If you believe a child has provided us with personal information
                            improperly, please contact us.
                        </p>
                    </PolicySection>

                    <PolicySection number="19" title="Your Privacy Rights">
                        <p>
                            Depending on where you live, you may have rights regarding your personal
                            information, including the right to:
                        </p>
                        <List
                            items={[
                                "Access your information",
                                "Correct inaccurate information",
                                "Delete your information",
                                "Request a copy of your information",
                                "Restrict certain processing",
                                "Object to certain processing",
                                "Withdraw consent where processing is based on consent",
                            ]}
                        />
                        <p>
                            To exercise applicable rights, contact us using the information below.
                        </p>
                    </PolicySection>

                    <PolicySection number="20" title="International Data Transfers">
                        <p>
                            FirstWord may use service providers that operate in countries other
                            than your country of residence.
                        </p>
                        <p>
                            As a result, your information may be processed or stored internationally.
                        </p>
                        <p>
                            Where required, we will use appropriate safeguards for international
                            data transfers.
                        </p>
                    </PolicySection>

                    <PolicySection number="21" title="Cookies and Similar Technologies">
                        <p>
                            The FirstWord web application may use cookies or similar technologies
                            for purposes such as:
                        </p>
                        <List
                            items={[
                                "Authentication",
                                "Maintaining sessions",
                                "Security",
                                "Preferences",
                                "Analytics",
                            ]}
                        />
                        <p>
                            Mobile applications may use device storage and similar technologies to
                            maintain application data and preferences.
                        </p>
                    </PolicySection>

                    <PolicySection number="22" title="Changes to This Privacy Policy">
                        <p>We may update this Privacy Policy from time to time.</p>
                        <p>When we make significant changes, we may notify you through:</p>
                        <List
                            items={[
                                "The FirstWord application",
                                "Our website",
                                "Email",
                                "Other appropriate communication methods",
                            ]}
                        />
                        <p>
                            The &quot;Last Updated&quot; date at the beginning of this Privacy Policy
                            will indicate when the policy was most recently changed.
                        </p>
                    </PolicySection>

                    <PolicySection number="23" title="Contact Us">
                        <p>
                            If you have questions about this Privacy Policy or your personal
                            information, contact us at:
                        </p>
                        <p>
                            <strong>FirstWord</strong>
                        </p>
                        <p>
                            Website: {" "}
                            <a href="https://firstword.online">firstword.online</a>
                            <br />
                            Email: {" "}
                            <a href="mailto:hello@firstword.online">hello@firstword.online</a>
                            <br />
                            Developer: <strong>Alabo Excel</strong>
                        </p>
                    </PolicySection>

                    <PolicySection number="24" title="Summary">
                        <p>In simple terms:</p>
                        <p className="policy-quote">
                            FirstWord is designed to help you spend more time in God&apos;s Word,
                            not to collect unnecessary information about you.
                        </p>
                        <p>
                            We collect information needed to provide your account, save your
                            progress, synchronize your private content, provide focus features,
                            process subscriptions, and improve the application.
                        </p>
                        <p>
                            <strong>
                                Your Bible notes, prayers, reflections, and journal entries are
                                private by default.
                            </strong>
                        </p>
                        <p>
                            <strong>We do not sell your personal information.</strong>
                        </p>
                    </PolicySection>
                </article>
            </main>

            <footer className="policy-footer">
                <p>
                    FirstWord · <a href="mailto:hello@firstword.online">hello@firstword.online</a>
                </p>
            </footer>
        </div>
    );
}
