'use client';

import Image from 'next/image';

export default function TermsOfServicePage() {
  return (
    <div className="container-app bg-slate-100 px-4 py-6 overflow-y-auto">
      <div className="flex flex-col items-center mb-6">
        <Image
          src="/Logo blusukan-01.jpg"
          alt="Blusukan Logo"
          className="rounded-full shadow-lg"
          width={60}
          height={60}
          priority
        />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-6">Last updated: January 6, 2026</p>

        <div className="space-y-6 text-slate-700">
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">1. Acceptance of Terms</h2>
            <p className="text-sm leading-relaxed">
              By accessing or using Blusukan Virtual Run, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">2. Description of Service</h2>
            <p className="text-sm leading-relaxed">
              Blusukan Virtual Run is a virtual running event platform that tracks participants' running 
              activities through Strava integration and displays progress on a leaderboard.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">3. Eligibility</h2>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li>You must be at least 13 years old to use this service</li>
              <li>You must have a valid Strava account (for Strava integration)</li>
              <li>You must provide accurate information when registering</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">4. User Responsibilities</h2>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li>Record genuine running activities only</li>
              <li>Do not manipulate or falsify activity data</li>
              <li>Respect other participants</li>
              <li>Follow safe running practices</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">5. Activity Validation</h2>
            <p className="text-sm leading-relaxed">
              We reserve the right to validate and verify all submitted activities. Activities that appear 
              fraudulent, manipulated, or do not meet event criteria may be marked as invalid and excluded 
              from the leaderboard.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">6. Intellectual Property</h2>
            <p className="text-sm leading-relaxed">
              The Blusukan Virtual Run name, logo, and all related content are protected by intellectual 
              property laws. You may not use our branding without permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">7. Disclaimer</h2>
            <p className="text-sm leading-relaxed">
              The service is provided "as is" without warranties of any kind. We are not responsible for 
              any injuries or damages that may occur during your running activities. Please consult a 
              medical professional before starting any exercise program.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">8. Limitation of Liability</h2>
            <p className="text-sm leading-relaxed">
              Blusukan Virtual Run shall not be liable for any indirect, incidental, special, or 
              consequential damages arising from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">9. Termination</h2>
            <p className="text-sm leading-relaxed">
              We reserve the right to suspend or terminate your access to the service at any time for 
              violation of these terms or any other reason.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">10. Changes to Terms</h2>
            <p className="text-sm leading-relaxed">
              We may update these terms from time to time. Continued use of the service after changes 
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">11. Contact</h2>
            <p className="text-sm leading-relaxed">
              For questions about these Terms, contact us at:
              <br />
              <strong>Email:</strong> satria.workdev@gmail.com
            </p>
          </section>
        </div>
      </div>

      <div className="mt-6 text-center">
        <a href="/" className="text-orange-500 text-sm hover:underline">← Back to Home</a>
      </div>
    </div>
  );
}
