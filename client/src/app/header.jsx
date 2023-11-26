'use client'

import Link from 'next/link';

const Header = () => (
    <div>
        <p>Guesstify</p>
        <Link href="/about">
            About
        </Link>
    </div>
);

export default Header;