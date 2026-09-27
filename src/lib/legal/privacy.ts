/**
 * The FirstWord Privacy Policy.
 *
 * The single source for both the /privacy page and `GET /api/legal/privacy`. Edit the
 * copy here, and bump `lastUpdated` whenever the substance changes — clients use
 * it to decide whether a user needs to see the document again.
 */

import { CONTACT_EMAIL } from "./contact";
import {
    heading,
    lineBreak,
    link,
    list,
    paragraph,
    quote,
    section,
    strong,
    type LegalDocument,
} from "./types";

export const PRIVACY_POLICY: LegalDocument = {
    slug: "privacy",
    title: "Privacy Policy",
    description:
        "How FirstWord handles your account, reading activity, notes, prayers, and focus data — and what stays private by default.",
    eyebrow: "A quiet place for what matters",
    lede: "FirstWord is designed to help you spend more time in God's Word, with your reading, prayers, and reflections kept yours.",
    lastUpdated: "2026-08-18",
    path: "/privacy",
    sections: [
        section(1, "Information We Collect", [
            paragraph("We collect information necessary to provide and improve FirstWord."),
            heading("1.1 Account Information"),
            paragraph("If you create an account, we may collect:"),
            list([
                "Email address",
                "Name or display name",
                "Profile photo, if provided",
                "Authentication information",
                "User ID",
                "Account creation date",
            ]),
            paragraph(
                "If you sign in using a third-party provider such as Apple or Google, we may receive information that the provider makes available to us according to your authorization and their privacy policies.",
            ),
        ]),
        section(2, "Bible Reading Data", [
            paragraph(
                "FirstWord may store information about your Bible-reading activity, including:",
            ),
            list([
                "Preferred Bible translation",
                "Books and chapters read",
                "Reading history",
                "Reading-plan progress",
                "Devotional progress",
                "Reading streaks",
                "Reading duration",
                "Last-read location",
            ]),
            paragraph("This information allows FirstWord to provide features such as:"),
            list([
                "Continue Reading",
                "Reading plans",
                "Reading progress",
                "Streaks",
                "Reading statistics",
                "Personalized recommendations",
            ]),
        ]),
        section(3, "Notes, Reflections, Prayers, and Journals", [
            paragraph("FirstWord allows you to create private personal content, including:"),
            list([
                "Scripture notes",
                "Devotional reflections",
                "Prayer entries",
                "Journal entries",
                "Bookmarks",
                "Highlights",
            ]),
            paragraph("This information may contain highly personal content."),
            paragraph(strong("Your personal content is private by default.")),
            paragraph(
                "We do not sell your notes, prayers, reflections, or journal entries. We do not use the contents of your private notes or prayers for advertising.",
            ),
            paragraph(
                "If cloud synchronization is enabled, this information may be securely stored on our servers so that it can be restored and synchronized across your devices.",
            ),
        ]),
        section(4, "Focus Mode and App Blocking", [
            paragraph(
                "FirstWord provides Focus Mode features designed to help reduce distractions while reading Scripture.",
            ),
            paragraph(
                "Depending on your device and operating system, FirstWord may require access to system features that allow it to:",
            ),
            list([
                "Identify applications selected for blocking",
                "Determine whether a focus session is active",
                "Apply or remove app restrictions",
                "Track focus-session duration",
                "Determine whether the required reading or devotional activity has been completed",
            ]),
            paragraph(
                "FirstWord does ",
                strong("not"),
                " need to collect the contents of other applications.",
            ),
            paragraph(
                "Where possible, application-blocking information is processed and stored locally on your device.",
            ),
            paragraph("We do not sell information about the applications you choose to block."),
        ]),
        section(5, "Device and Technical Information", [
            paragraph(
                "We may automatically receive limited technical information when you use FirstWord, such as:",
            ),
            list([
                "Device type",
                "Operating system",
                "App version",
                "Language",
                "Time zone",
                "General device configuration",
                "Crash information",
                "Diagnostic information",
            ]),
            paragraph("This information helps us:"),
            list([
                "Fix bugs",
                "Improve performance",
                "Understand compatibility problems",
                "Improve the reliability of FirstWord",
            ]),
            paragraph(
                "We do not use this information to identify you personally unless necessary to provide a requested service.",
            ),
        ]),
        section(6, "Notifications", [
            paragraph(
                "If you enable notifications, FirstWord may store notification preferences such as:",
            ),
            list([
                "Daily reading reminder time",
                "Devotional reminders",
                "Prayer reminders",
                "Focus reminders",
                "Streak reminders",
            ]),
            paragraph(
                "You can disable notifications through FirstWord's settings or your device's operating-system settings.",
            ),
        ]),
        section(7, "Location Information", [
            paragraph(
                "FirstWord does not require precise location information to provide its core Bible, devotional, prayer, notes, or focus features.",
            ),
            paragraph(
                "We may use your device's time zone or locale to provide appropriately timed reminders and display dates correctly.",
            ),
            paragraph("We do not sell precise location information."),
        ]),
        section(8, "Payments and Subscriptions", [
            paragraph("FirstWord may offer paid subscriptions or other premium features."),
            paragraph(
                "Payments made through the Apple App Store or Google Play are processed by the applicable platform.",
            ),
            paragraph("We do not receive or store your full credit-card or debit-card number."),
            paragraph(
                "We may receive information necessary to determine your subscription status, such as:",
            ),
            list([
                "Product purchased",
                "Subscription status",
                "Purchase date",
                "Renewal date",
                "Expiration date",
                "Transaction or purchase identifier",
            ]),
            paragraph(
                "This information allows us to provide Premium features to eligible users.",
            ),
            paragraph(
                "If we later offer payments through the FirstWord website, payments may be processed by a third-party payment provider. Payment information will be handled according to that provider's privacy policy.",
            ),
        ]),
        section(9, "Third-Party Services", [
            paragraph(
                "FirstWord may use trusted third-party services to provide functionality such as authentication, cloud storage, analytics, notifications, payments, crash reporting, and Bible content.",
            ),
            paragraph("These services may include providers such as:"),
            list([
                "Supabase",
                "Apple",
                "Google",
                "Expo",
                "Bible content providers",
                "Payment processors",
                "Analytics or crash-reporting providers",
            ]),
            paragraph(
                "These providers may process information according to their own privacy policies and applicable agreements with us.",
            ),
            paragraph(
                "We only use third-party services that are reasonably necessary to operate and improve FirstWord.",
            ),
        ]),
        section(10, "Bible Content", [
            paragraph("Bible text may be retrieved from third-party Bible content providers."),
            paragraph(
                "Your Bible reading requests may be processed by the relevant provider in order to retrieve the requested Scripture.",
            ),
            paragraph("We do not sell your Bible-reading activity."),
            paragraph(
                "Some Bible translations may be subject to copyright and licensing restrictions. FirstWord displays applicable copyright information where required.",
            ),
        ]),
        section(11, "How We Use Your Information", [
            paragraph("We use collected information to:"),
            list([
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
            ]),
            paragraph("We do not sell your personal information."),
        ]),
        section(12, "Advertising", [
            paragraph("At launch, FirstWord may not display third-party advertising."),
            paragraph(
                "If advertising is introduced in the future, this Privacy Policy will be updated before or when the relevant functionality becomes available.",
            ),
            paragraph(
                "Where required, we will provide appropriate controls for personalized advertising.",
            ),
        ]),
        section(13, "Data Sharing", [
            paragraph("We do not sell your personal information."),
            paragraph(
                "We may share limited information with service providers when necessary to operate FirstWord.",
            ),
            paragraph("Examples include:"),
            list([
                "Authentication providers",
                "Cloud infrastructure providers",
                "Payment providers",
                "Notification providers",
                "Crash-reporting providers",
                "Analytics providers",
                "Bible content providers",
            ]),
            paragraph("We may also disclose information when required to:"),
            list([
                "Comply with applicable law",
                "Respond to valid legal requests",
                "Protect the rights or safety of users",
                "Prevent fraud or abuse",
                "Protect the security of FirstWord",
            ]),
        ]),
        section(14, "Your Private Content", [
            paragraph(
                "Your notes, prayers, reflections, highlights, bookmarks, and journal entries are intended to remain private.",
            ),
            paragraph(
                "We will not make this content publicly accessible unless you explicitly use a feature that allows you to publish or share it.",
            ),
            paragraph(
                "If FirstWord later introduces community or public-content features, those features will have separate controls and will clearly explain when content becomes public.",
            ),
        ]),
        section(15, "Data Security", [
            paragraph(
                "We take reasonable technical and organizational measures to protect your information.",
            ),
            paragraph("These may include:"),
            list([
                "Encrypted connections",
                "Authentication controls",
                "Database access controls",
                "Row-level security",
                "Secure server infrastructure",
                "Limited employee access",
                "Secure credential handling",
            ]),
            paragraph("However, no internet-based service can guarantee absolute security."),
            paragraph("You are responsible for keeping your account credentials secure."),
        ]),
        section(16, "Data Retention", [
            paragraph(
                "We retain information for as long as necessary to provide FirstWord's services and fulfill the purposes described in this Privacy Policy.",
            ),
            paragraph(
                "When you delete your account, we will delete or anonymize your personal information within a reasonable period, subject to:",
            ),
            list([
                "Legal requirements",
                "Fraud prevention",
                "Security requirements",
                "Backup retention",
                "Legitimate business purposes",
            ]),
            paragraph(
                "Some information may remain temporarily in encrypted backups before being permanently deleted.",
            ),
        ]),
        section(17, "Account Deletion", [
            paragraph(
                "You may delete your FirstWord account at any time from Settings → Account → Delete account inside the app, or by requesting deletion from us.",
            ),
            paragraph(
                "When an account is deleted, we will delete or anonymize information associated with the account, subject to applicable legal and security requirements.",
            ),
            paragraph("Account deletion may result in the permanent loss of:"),
            list([
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
            ]),
            paragraph(
                "We recommend exporting any information you want to retain before deleting your account, where export functionality is available.",
            ),
        ]),
        section(18, "Children's Privacy", [
            paragraph(
                "FirstWord is not intentionally designed to collect personal information from children below the minimum age required by applicable law.",
            ),
            paragraph(
                "We do not knowingly collect personal information from children without appropriate authorization where required by law.",
            ),
            paragraph(
                "If you believe a child has provided us with personal information improperly, please contact us.",
            ),
        ]),
        section(19, "Your Privacy Rights", [
            paragraph(
                "Depending on where you live, you may have rights regarding your personal information, including the right to:",
            ),
            list([
                "Access your information",
                "Correct inaccurate information",
                "Delete your information",
                "Request a copy of your information",
                "Restrict certain processing",
                "Object to certain processing",
                "Withdraw consent where processing is based on consent",
            ]),
            paragraph("To exercise applicable rights, contact us using the information below."),
        ]),
        section(20, "International Data Transfers", [
            paragraph(
                "FirstWord may use service providers that operate in countries other than your country of residence.",
            ),
            paragraph(
                "As a result, your information may be processed or stored internationally.",
            ),
            paragraph(
                "Where required, we will use appropriate safeguards for international data transfers.",
            ),
        ]),
        section(21, "Cookies and Similar Technologies", [
            paragraph(
                "The FirstWord web application may use cookies or similar technologies for purposes such as:",
            ),
            list([
                "Authentication",
                "Maintaining sessions",
                "Security",
                "Preferences",
                "Analytics",
            ]),
            paragraph(
                "Mobile applications may use device storage and similar technologies to maintain application data and preferences.",
            ),
        ]),
        section(22, "Changes to This Privacy Policy", [
            paragraph("We may update this Privacy Policy from time to time."),
            paragraph("When we make significant changes, we may notify you through:"),
            list([
                "The FirstWord application",
                "Our website",
                "Email",
                "Other appropriate communication methods",
            ]),
            paragraph(
                "The \"Last Updated\" date at the beginning of this Privacy Policy will indicate when the policy was most recently changed.",
            ),
        ]),
        section(23, "Contact Us", [
            paragraph(
                "If you have questions about this Privacy Policy or your personal information, contact us at:",
            ),
            paragraph(strong("FirstWord")),
            paragraph(
                "Website: ",
                link("firstword.online", "https://firstword.online"),
                lineBreak,
                "Email: ",
                link(CONTACT_EMAIL, `mailto:${CONTACT_EMAIL}`),
                lineBreak,
                "Developer: ",
                strong("Alabo Excel"),
            ),
        ]),
        section(24, "Summary", [
            paragraph("In simple terms:"),
            quote(
                "FirstWord is designed to help you spend more time in God's Word, not to collect unnecessary information about you.",
            ),
            paragraph(
                "We collect information needed to provide your account, save your progress, synchronize your private content, provide focus features, process subscriptions, and improve the application.",
            ),
            paragraph(
                strong("Your Bible notes, prayers, reflections, and journal entries are private by default."),
            ),
            paragraph(strong("We do not sell your personal information.")),
        ]),
    ],
};
