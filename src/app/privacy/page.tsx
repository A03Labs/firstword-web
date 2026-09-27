import { legalMetadata, LegalDocumentPage } from "../components/legal-document";
import { PRIVACY_POLICY } from "@/lib/legal/privacy";

export const metadata = legalMetadata(PRIVACY_POLICY);

export default function PrivacyPolicyPage() {
    return <LegalDocumentPage document={PRIVACY_POLICY} />;
}
