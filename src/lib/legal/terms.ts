/**
 * The FirstWord Terms of Use.
 *
 * The single source for both the /terms page and `GET /api/legal/terms`. Edit the
 * copy here, and bump `lastUpdated` whenever the substance changes — clients use
 * it to decide whether a user needs to see the document again.
 */

import { CONTACT_EMAIL } from "./contact";
import {
    lineBreak,
    link,
    list,
    paragraph,
    quote,
    section,
    strong,
    type LegalDocument,
} from "./types";

export const TERMS_OF_USE: LegalDocument = {
    slug: "terms",
    title: "Terms of Use",
    description:
        "The terms that govern your use of FirstWord — your account, Bible content, notes and journals, subscriptions, and the limits of what the app promises.",
    eyebrow: "The agreement between us",
    lede: "These terms govern your use of the FirstWord app, website, and related services. By using FirstWord, you agree to them.",
    lastUpdated: "2026-08-27",
    path: "/terms",
    sections: [
        section(1, "About FirstWord", [
            paragraph(
                "Welcome to ",
                strong("FirstWord"),
                " (\"FirstWord,\" \"we,\" \"us,\" or \"our\"). These Terms of Use (\"Terms\") govern your access to and use of the FirstWord mobile application, website, and related services (collectively, the \"Service\").",
            ),
            paragraph(
                "By downloading, accessing, or using FirstWord, you agree to these Terms. If you do not agree with these Terms, please do not use the Service.",
            ),
            paragraph(
                "FirstWord is a Bible and Christian spiritual-growth application designed to help you read Scripture, follow Bible reading plans, engage with devotionals, reflect through notes and journals, and develop consistent Bible-reading and prayer habits.",
            ),
            paragraph(
                "FirstWord is intended to provide educational, inspirational, and spiritual resources. It is not a substitute for professional medical, psychological, legal, financial, or other professional advice.",
            ),
        ]),
        section(2, "Eligibility", [
            paragraph(
                "You must be legally permitted to use the Service in your country or jurisdiction.",
            ),
            paragraph(
                "If you are under the age required to enter into a legally binding agreement in your jurisdiction, you may only use FirstWord with the involvement and permission of a parent or legal guardian where required by law.",
            ),
            paragraph(
                "By using FirstWord, you represent that the information you provide to us is accurate and that you have the legal capacity to agree to these Terms.",
            ),
        ]),
        section(3, "Your Account", [
            paragraph("Certain features may require you to create an account."),
            paragraph("You are responsible for:"),
            list([
                "Providing accurate account information",
                "Maintaining the confidentiality of your login credentials",
                "Keeping your account secure",
                "All activity that occurs through your account",
                "Not sharing your account credentials with others where such sharing is prohibited",
            ]),
            paragraph(
                "You should notify us promptly if you believe your account has been accessed without your authorization.",
            ),
            paragraph(
                "We reserve the right to suspend or terminate accounts that violate these Terms or are used for unlawful, abusive, fraudulent, or harmful activity.",
            ),
        ]),
        section(4, "Bible Content and Translations", [
            paragraph(
                "FirstWord may provide access to Bible translations and other Scripture-related content.",
            ),
            paragraph(
                "Bible translations are owned by their respective copyright holders and may be subject to separate copyright notices, licenses, and usage restrictions.",
            ),
            paragraph(
                "FirstWord does not claim ownership of Bible translations that are owned or licensed by third parties.",
            ),
            paragraph(
                "Your use of a particular Bible translation through FirstWord may be subject to the terms and copyright requirements applicable to that translation.",
            ),
            paragraph(
                "You may not reproduce, redistribute, sell, publicly republish, or commercially exploit copyrighted Bible translation content accessed through FirstWord except as permitted by applicable law or the relevant rights holder.",
            ),
            paragraph(
                "Where a Bible translation is provided under a public-domain or open license, its use remains subject to the applicable license.",
            ),
        ]),
        section(5, "Devotionals and Original Content", [
            paragraph(
                "FirstWord may provide devotionals, reflections, prayers, reading plans, explanations, educational materials, and other original content.",
            ),
            paragraph(
                "Unless otherwise stated, content created by FirstWord is owned by or licensed to FirstWord and is protected by applicable intellectual-property laws.",
            ),
            paragraph(
                "You may access and use such content for your personal, non-commercial spiritual and educational use.",
            ),
            paragraph(
                "You may not reproduce, distribute, sell, modify, publicly display, or commercially exploit FirstWord's original content without our prior written permission.",
            ),
        ]),
        section(6, "User Notes, Journals, and Other Content", [
            paragraph("FirstWord may allow you to create or store personal content, including:"),
            list([
                "Scripture notes",
                "Devotional reflections",
                "Prayer notes",
                "Journal entries",
                "Bookmarks",
                "Reading progress",
                "Other content you choose to create within the Service",
            ]),
            paragraph(strong("You retain ownership of your original user-generated content.")),
            paragraph(
                "You grant FirstWord only the limited rights reasonably necessary to provide, operate, maintain, secure, and improve the Service, including storing and synchronizing your content where applicable.",
            ),
            paragraph(
                "You are responsible for the content you create or store through FirstWord.",
            ),
            paragraph(
                "You must not use the Service to create, upload, store, or distribute content that:",
            ),
            list([
                "Violates applicable law",
                "Infringes another person's intellectual-property rights",
                "Contains malicious software or harmful code",
                "Attempts to compromise the security of the Service",
                "Harasses, threatens, or abuses others",
                "Facilitates illegal activity",
                "Attempts to interfere with the operation of the Service",
            ]),
            paragraph(
                "We may remove content or restrict access to content where reasonably necessary to comply with law, protect users, protect our systems, or enforce these Terms.",
            ),
        ]),
        section(7, "AI-Generated or AI-Assisted Content", [
            paragraph(
                "If FirstWord introduces AI-powered features, including AI-generated explanations, reflections, summaries, recommendations, or other content, such content may contain inaccuracies or errors.",
            ),
            paragraph(
                "AI-generated content should not be treated as authoritative theological, medical, legal, or professional advice.",
            ),
            paragraph(
                "You are responsible for evaluating AI-generated content and should consult appropriate human sources, including qualified theological or pastoral authorities, where appropriate.",
            ),
        ]),
        section(8, "Bible Reading Plans and Spiritual Features", [
            paragraph(
                "FirstWord may provide reading plans, reminders, streaks, progress tracking, devotional schedules, prayer prompts, and similar features.",
            ),
            paragraph(
                "These features are intended to encourage consistent spiritual habits but do not guarantee any particular spiritual, emotional, behavioral, or religious outcome.",
            ),
            paragraph(
                "Reading plans and schedules may be changed, discontinued, or updated from time to time.",
            ),
        ]),
        section(9, "Focus and App-Restriction Features", [
            paragraph(
                "FirstWord may provide features designed to help you reduce distractions or restrict access to other applications or device functions.",
            ),
            paragraph(
                "These features may depend on operating-system capabilities, permissions, device settings, or third-party platform restrictions.",
            ),
            paragraph(
                "We do not guarantee that such features will work on every device, operating-system version, or configuration.",
            ),
            paragraph(
                "You are responsible for understanding and configuring device permissions and restrictions appropriately.",
            ),
            paragraph(
                "FirstWord is not responsible for loss of access to other applications, device functions, data, or services resulting from your configuration or use of these features.",
            ),
        ]),
        section(10, "Subscriptions and Paid Features", [
            paragraph(
                "Some FirstWord features may be available only through a paid subscription or one-time purchase.",
            ),
            paragraph(
                "Before completing a purchase, you will be shown the applicable price and relevant purchase information.",
            ),
            paragraph(
                "Subscriptions purchased through the Apple App Store or Google Play may be subject to the respective platform's payment, renewal, cancellation, and refund policies.",
            ),
            paragraph(
                "Unless otherwise stated, subscriptions may automatically renew until cancelled.",
            ),
            paragraph(
                "You are responsible for cancelling your subscription before the next renewal period if you do not wish to continue being charged.",
            ),
            paragraph(
                strong("Deleting the FirstWord app does not necessarily cancel an active subscription."),
            ),
            paragraph(
                "Refunds may be governed by the policies of the platform through which the purchase was made.",
            ),
        ]),
        section(11, "Free Trials and Promotional Offers", [
            paragraph(
                "FirstWord may occasionally provide free trials, promotional offers, discounts, or other special pricing.",
            ),
            paragraph(
                "The terms of each offer will be provided at the time the offer is presented.",
            ),
            paragraph(
                "Unless otherwise stated, we reserve the right to modify or discontinue promotional offers at any time.",
            ),
        ]),
        section(12, "Payments", [
            paragraph(
                "Payments may be processed through third-party payment providers or app stores.",
            ),
            paragraph(
                "FirstWord does not directly store your complete payment-card information unless expressly stated.",
            ),
            paragraph(
                "Your use of third-party payment services may also be subject to the terms and privacy policies of those providers.",
            ),
        ]),
        section(13, "Intellectual Property", [
            paragraph(
                "The FirstWord name, logo, branding, interface, software, original content, graphics, designs, and other materials provided by FirstWord are owned by or licensed to FirstWord and are protected by applicable intellectual-property laws.",
            ),
            paragraph(
                "Except for the limited right to use the Service in accordance with these Terms, no ownership rights are transferred to you.",
            ),
            paragraph("You may not:"),
            list([
                "Copy or reproduce the FirstWord software or interface",
                "Reverse engineer or attempt to extract source code except where expressly permitted by law",
                "Modify or create derivative works from the Service",
                "Sell, sublicense, lease, or redistribute the Service",
                "Remove copyright, trademark, or other proprietary notices",
                "Use FirstWord branding without authorization",
            ]),
        ]),
        section(14, "Third-Party Services", [
            paragraph(
                "FirstWord may integrate with or rely on third-party services, including app stores, authentication providers, analytics services, payment providers, cloud infrastructure, Bible-content providers, and other external services.",
            ),
            paragraph("Third-party services are controlled by their respective providers."),
            paragraph(
                "We are not responsible for the availability, accuracy, security, or practices of third-party services.",
            ),
            paragraph(
                "Your use of third-party services may be subject to additional terms and privacy policies.",
            ),
        ]),
        section(15, "Availability of the Service", [
            paragraph(
                "We aim to keep FirstWord available and reliable, but we do not guarantee uninterrupted or error-free operation.",
            ),
            paragraph("The Service may occasionally be unavailable because of:"),
            list([
                "Maintenance",
                "Updates",
                "Security incidents",
                "Network failures",
                "Device or operating-system limitations",
                "Third-party service outages",
                "Circumstances beyond our reasonable control",
            ]),
            paragraph(
                "We reserve the right to modify, suspend, or discontinue any part of the Service at any time.",
            ),
        ]),
        section(16, "Accuracy of Content", [
            paragraph("We make reasonable efforts to provide accurate and useful information."),
            paragraph(
                "However, we do not guarantee that all content available through FirstWord will always be complete, accurate, current, or error-free.",
            ),
            paragraph(
                "Bible translations, theological explanations, devotionals, educational content, recommendations, and other materials may differ across sources and traditions.",
            ),
            paragraph(
                "You are responsible for exercising your own judgment when using the Service.",
            ),
        ]),
        section(17, "Spiritual and Religious Disclaimer", [
            paragraph(
                "FirstWord is a tool intended to support Bible reading, reflection, prayer, and Christian spiritual practices.",
            ),
            paragraph(
                "FirstWord does not represent itself as a church, denomination, pastor, priest, minister, theologian, or religious authority.",
            ),
            paragraph(
                "The Service is not intended to replace participation in a local church, pastoral care, personal study, or consultation with qualified religious leaders.",
            ),
        ]),
        section(18, "Privacy", [
            paragraph(
                "Your use of FirstWord is also governed by our ",
                link("Privacy Policy", "/privacy"),
                ", which explains how we collect, use, store, and protect information.",
            ),
            paragraph(
                "By using FirstWord, you acknowledge that you have reviewed our Privacy Policy.",
            ),
        ]),
        section(19, "Security", [
            paragraph(
                "We take reasonable measures to protect the Service and user information.",
            ),
            paragraph("However, no online service can guarantee absolute security."),
            paragraph(
                "You acknowledge that you use the Service at your own risk and should take reasonable steps to protect your account and device.",
            ),
        ]),
        section(20, "Prohibited Uses", [
            paragraph("You agree not to:"),
            list([
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
            ]),
        ]),
        section(21, "Termination", [
            paragraph("You may stop using FirstWord at any time."),
            paragraph("We may suspend or terminate your access to the Service if:"),
            list([
                "You violate these Terms",
                "Your use creates a security or legal risk",
                "You engage in fraudulent or abusive activity",
                "We are required to do so by law",
                "We discontinue the Service",
            ]),
            paragraph("Where appropriate, we may provide notice before taking action."),
            paragraph(
                "Termination does not automatically entitle you to a refund except where required by applicable law or the applicable purchase platform's policies.",
            ),
        ]),
        section(22, "Account and Data Deletion", [
            paragraph(
                "You may request deletion of your FirstWord account and associated personal information in accordance with our ",
                link("Privacy Policy", "/privacy"),
                ". You can start that request on our ",
                link("account deletion", "/delete-account"),
                " page.",
            ),
            paragraph(
                "Some information may need to be retained where required by law, necessary to resolve disputes, prevent fraud, enforce our agreements, or otherwise permitted by applicable law.",
            ),
            paragraph(
                "Deleting your account may permanently remove your saved notes, journal entries, reading progress, and other account-associated information. You should export or otherwise preserve anything you wish to keep before deleting your account where such functionality is available.",
            ),
        ]),
        section(23, "Disclaimer of Warranties", [
            paragraph(
                "To the maximum extent permitted by applicable law, FirstWord is provided on an \"as is\" and \"as available\" basis.",
            ),
            paragraph("We do not guarantee that:"),
            list([
                "The Service will always be available",
                "The Service will be uninterrupted or error-free",
                "The content will always be accurate or complete",
                "The Service will meet every user's requirements",
                "The Service will operate on every device or operating-system version",
                "Any particular spiritual, personal, or religious outcome will result from using the Service",
            ]),
            paragraph(
                "Nothing in these Terms excludes any warranty or consumer right that cannot legally be excluded under applicable law.",
            ),
        ]),
        section(24, "Limitation of Liability", [
            paragraph(
                "To the maximum extent permitted by applicable law, FirstWord and its owners, employees, contractors, affiliates, and service providers will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages arising from or related to your use of the Service.",
            ),
            paragraph(
                "Where liability cannot legally be excluded, our liability will be limited to the maximum extent permitted by applicable law.",
            ),
            paragraph(
                "Nothing in these Terms limits liability that cannot legally be limited or excluded.",
            ),
        ]),
        section(25, "Indemnification", [
            paragraph(
                "To the extent permitted by applicable law, you agree to indemnify and hold harmless FirstWord and its owners, employees, contractors, affiliates, and service providers from claims, losses, liabilities, damages, and expenses arising from:",
            ),
            list([
                "Your violation of these Terms",
                "Your unlawful use of the Service",
                "Your violation of another person's rights",
                "Content you submit or create through the Service",
            ]),
        ]),
        section(26, "Changes to These Terms", [
            paragraph("We may update these Terms from time to time."),
            paragraph(
                "When we make material changes, we may provide notice through the Service or other reasonable means.",
            ),
            paragraph(
                "The updated Terms will become effective on the date indicated at the beginning of the revised Terms.",
            ),
            paragraph(
                "Your continued use of FirstWord after the effective date constitutes acceptance of the updated Terms.",
            ),
        ]),
        section(27, "Governing Law", [
            paragraph(
                "These Terms will be governed by and interpreted in accordance with the laws applicable in the jurisdiction where FirstWord is operated, except where applicable law requires otherwise.",
            ),
            paragraph(
                "Nothing in this section removes protections you are entitled to under the mandatory laws of your own country of residence.",
            ),
        ]),
        section(28, "Dispute Resolution", [
            paragraph(
                "If you have a concern or dispute relating to FirstWord, we encourage you to contact us first so that we can attempt to resolve the issue informally.",
            ),
            paragraph(
                "Nothing in these Terms prevents you from exercising rights or remedies that cannot legally be waived or restricted under applicable law.",
            ),
        ]),
        section(29, "Severability", [
            paragraph(
                "If any provision of these Terms is determined to be invalid or unenforceable, that provision will be enforced to the maximum extent permitted by law, and the remaining provisions will remain in effect.",
            ),
        ]),
        section(30, "Entire Agreement", [
            paragraph(
                "These Terms, together with our ",
                link("Privacy Policy", "/privacy"),
                " and any additional terms applicable to specific features, constitute the agreement between you and FirstWord regarding your use of the Service.",
            ),
        ]),
        section(31, "Contact Us", [
            paragraph(
                "If you have questions, concerns, or requests regarding these Terms, contact us at:",
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
            quote(
                "By using FirstWord, you acknowledge that you have read, understood, and agreed to these Terms of Use.",
            ),
        ]),
    ],
};
