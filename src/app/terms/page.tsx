import { legalMetadata, LegalDocumentPage } from "../components/legal-document";
import { TERMS_OF_USE } from "@/lib/legal/terms";

export const metadata = legalMetadata(TERMS_OF_USE);

export default function TermsOfUsePage() {
    return <LegalDocumentPage document={TERMS_OF_USE} />;
}
