'use client';

import Image from 'next/image';

export default function PrivacyPolicyPage() {
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
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-6">Last updated: January 6, 2026</p>

        <div className="space-y-6 text-slate-700">
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">1. Introduction</h2>
            <p className="text-sm leading-relaxed">
              Welcome to Blusukan Virtual Run ("we," "our," or "us"). This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our virtual running event platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">2. Information We Collect</h2>
            <p className="text-sm leading-relaxed mb-3">We collect the following information:</p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li><strong>Strava Account Information:</strong> Name, profile picture, athlete ID</li>
              <li><strong>Activity Data:</strong> Running activities including distance, time, and date</li>
              <li><strong>Authentication Tokens:</strong> To sync your activities from Strava</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li>To display your progress in the virtual run challenge</li>
              <li>To show your ranking on the leaderboard</li>
              <li>To validate your running activities</li>
              <li>To communicate event updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">4. Strava Integration</h2>
            <p className="text-sm leading-relaxed">
              We use the Strava API to access your activity data. We only request the minimum permissions 
              necessary (read access to your activities). We do not post to your Strava account or modify 
              any data. You can revoke our access at any time through your Strava settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">5. Data Sharing</h2>
            <p className="text-sm leading-relaxed">
              Your name and total distance will be displayed publicly on the event leaderboard. 
              We do not sell or share your personal information with third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">6. Data Security</h2>
            <p className="text-sm leading-relaxed">
              We implement reasonable security measures to protect your information. However, no method 
              of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">7. Data Retention</h2>
            <p className="text-sm leading-relaxed">
              We retain your data for the duration of the event and for a reasonable period afterward 
              for record-keeping purposes. You may request deletion of your data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">8. Your Rights</h2>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Revoke Strava access at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">9. Contact Us</h2>
            <p className="text-sm leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at: 
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
