export function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50">
      {/* Header */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl text-center space-y-4">
          <h1 className="text-5xl sm:text-6xl bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-gray-600">Last updated: January 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-lg border border-teal-200/50 space-y-8">
            <div>
              <h2 className="text-2xl text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing or using PubHub ("Service"), you agree to be bound by these Terms of Service. 
                If you disagree with any part of these terms, you may not access the Service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                PubHub provides a Reddit engagement platform that helps app developers monitor subreddits, 
                discover engagement opportunities, and generate AI-powered response suggestions. The Service includes:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Subreddit monitoring and feed aggregation</li>
                <li>AI-powered response generation using Azure OpenAI</li>
                <li>Project and subreddit management tools</li>
                <li>Historical scanning of Reddit content</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                When you create an account with us, you must provide accurate, complete, and current information. 
                You are responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Maintaining the security of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl text-gray-900 mb-4">4. Acceptable Use</h2>
              <p className="text-gray-600 leading-relaxed mb-4">You agree not to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Violate Reddit's Terms of Service or Community Guidelines</li>
                <li>Spam, harass, or abuse other Reddit users</li>
                <li>Use automated systems to generate excessive API calls</li>
                <li>Attempt to reverse engineer or compromise the Service</li>
                <li>Share your account credentials with others</li>
                <li>Use the Service to spread misinformation or harmful content</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl text-gray-900 mb-4">5. Reddit Integration</h2>
              <p className="text-gray-600 leading-relaxed">
                PubHub integrates with Reddit via OAuth. You grant us permission to access your Reddit account 
                as needed to provide the Service. We will only access and use your Reddit data as described in 
                our Privacy Policy. You remain responsible for all content posted to Reddit through our Service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl text-gray-900 mb-4">6. AI-Generated Content</h2>
              <p className="text-gray-600 leading-relaxed">
                PubHub uses AI to generate response suggestions. While we strive for accuracy, AI-generated 
                content may contain errors or inappropriate suggestions. You are solely responsible for reviewing, 
                editing, and approving all content before posting to Reddit. We disclaim all liability for content 
                posted using AI suggestions.
              </p>
            </div>

            <div>
              <h2 className="text-2xl text-gray-900 mb-4">7. Subscription and Billing</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Some features require a paid subscription. By subscribing, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Pay all fees associated with your chosen plan</li>
                <li>Automatic renewal unless cancelled before the renewal date</li>
                <li>Our right to change pricing with 30 days notice</li>
                <li>No refunds for partial months when downgrading or cancelling</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl text-gray-900 mb-4">8. Intellectual Property</h2>
              <p className="text-gray-600 leading-relaxed">
                The Service and its original content, features, and functionality are owned by PubHub and are 
                protected by international copyright, trademark, and other intellectual property laws. You retain 
                ownership of content you create, but grant us a license to use it to provide the Service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl text-gray-900 mb-4">9. Termination</h2>
              <p className="text-gray-600 leading-relaxed">
                We may terminate or suspend your account immediately, without prior notice, for any violation of 
                these Terms. Upon termination, your right to use the Service will immediately cease. You may 
                cancel your account at any time through your account settings.
              </p>
            </div>

            <div>
              <h2 className="text-2xl text-gray-900 mb-4">10. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed">
                To the maximum extent permitted by law, PubHub shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages resulting from your use or inability to use the Service. 
                Our total liability shall not exceed the amount you paid us in the last 12 months.
              </p>
            </div>

            <div>
              <h2 className="text-2xl text-gray-900 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of material changes 
                via email or through the Service. Your continued use of the Service after changes constitutes 
                acceptance of the new terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl text-gray-900 mb-4">12. Governing Law</h2>
              <p className="text-gray-600 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction 
                in which PubHub operates, without regard to its conflict of law provisions.
              </p>
            </div>

            <div>
              <h2 className="text-2xl text-gray-900 mb-4">13. Contact Us</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about these Terms, please contact us at{' '}
                <a href="mailto:legal@pubhub.com" className="text-teal-600 hover:text-teal-700">
                  legal@pubhub.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
