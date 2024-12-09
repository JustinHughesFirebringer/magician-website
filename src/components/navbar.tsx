'use client';

import Link from 'next/link';
import { Button } from "./ui/button";

export default function Navbar() {
  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="text-xl font-bold">Magic Directory</span>
        </Link>
        <div className="ml-auto flex items-center space-x-4">
          <Link href="/directory">
            <Button variant="ghost">Find a Magician</Button>
          </Link>
          <Link href="/about">
            <Button variant="ghost">About</Button>
          </Link>
          <Link href="/contact">
            <Button variant="ghost">Contact</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
