'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <ol className="flex text-sm">
          <li className="flex items-center">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              Home
            </Link>
            <svg className="h-5 w-5 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </li>
          <li className="text-gray-500">About</li>
        </ol>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6">About Magician Near Me</h1>
          
          <div className="prose prose-lg">
            <p className="mb-4">
              Welcome to Magician Near Me, your premier destination for finding talented magicians in your area. 
              Our platform connects audiences with skilled performers who bring wonder and amazement to events across the country.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
            <p className="mb-4">
              We believe that magic has the power to create unforgettable moments and bring joy to people of all ages. 
              Our mission is to make it easy for anyone to find and book the perfect magician for their event, 
              whether it's a birthday party, corporate event, wedding, or special celebration.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">What We Offer</h2>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2">Easy search functionality to find magicians in your area</li>
              <li className="mb-2">Detailed profiles of professional magicians</li>
              <li className="mb-2">Direct contact with performers</li>
              <li className="mb-2">Location-based searching across the United States</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">For Magicians</h2>
            <p className="mb-4">
              Are you a magician looking to reach more audiences? Join our platform to showcase your talents 
              and connect with potential clients in your area. We help talented performers increase their 
              visibility and grow their business.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

