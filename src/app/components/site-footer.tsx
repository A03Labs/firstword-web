import Link from "next/link";

import { Brand } from "./brand";
import { plate, plateLink, shell } from "./styles";

export const CONTACT_EMAIL = "hello@firstword.online";

export function SiteFooter() {
    return (
        <footer className={plate}>
            <div
                className={`${shell} flex flex-col gap-6 pb-11 pt-10 sm:flex-row sm:items-center sm:justify-between`}
            >
                <Brand />
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <Link className={plateLink} href="/privacy">
                        Privacy Policy
                    </Link>
                    <Link className={plateLink} href="/delete-account">
                        Delete Account
                    </Link>
                    <a className={plateLink} href={`mailto:${CONTACT_EMAIL}`}>
                        Contact
                    </a>
                </div>
            </div>
        </footer>
    );
}
