import Link from 'next/link';

export default function RegisterForm() {
    return (
        <div>
            hello from register form
            <p>
                hello login dito <Link href="/login">Log in</Link>
            </p>
        </div>
    );
}