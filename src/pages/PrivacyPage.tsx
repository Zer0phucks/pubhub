export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50">
      {/* Header */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl text-center space-y-4">
          <h1 className="text-5xl sm:text-6xl bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-gray-600">Last updated: January 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-lg border border-teal-200/50 space-y-8">
            <div>
              <h2 className="text-2xl text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-600 leading-relaxed">
                PubHub ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our Service. 
                Please read this policy carefully.
              </p>
            </div>

            <div>
              <h2 className="text-2xl text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl text-gray-900 mt-6 mb-3">Account Information</h3>
              <p className="text-gray-600 leading-relaxed mb-4">When you create an account, we collect:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Name and email address</li>
                <li>Account credentials (encrypted)</li>
                <li>Subscription tier and billing information</li>
              </ul>

              <h3 className="text-xl text-gray-900 mt-6 mb-3">Reddit Data</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                With your permission via OAuth, we access:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Your Reddit username and profile information</li>
                <li>Posts, comments, and messages from monitored subreddits</li>
                <li>Direct messages related to your app</li>
              </ul>

              <h3 className="text-xl text-gray-900 mt-6 mb-3">Usage Data</h3>
              <p className="text-gray-600 leading-relaxed mb-4">We automatically collect:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Log data (IP address, browser type, pages visited)</li>
                <li>Device information</li>
                <li>Interaction data (features used, time spent)</li>
                <li>Performance and error logs</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-600 leading-relaxed mb-4">We use collected information to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Provide and maintain the Service</li>
                <li>Monitor subreddits and aggregate relevant content</li>
                <li>Generate AI-powered response suggestions</li>
                <li>Process payments and manage subscriptions</li>
                <li>Send service updates and notifications</li>
                <li>Improve our Service and develop new features</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl text-gray-900 mb-4">4. AI Processing</h2>
              <p className="text-gray-600 leading-relaxed">
                We use Azure OpenAI to generate response suggestions. Reddit content you monitor is sent to 
                Azure OpenAI for processing. Microsoft's enterprise agreement ensures your data is not used 
                to train AI models. All AI processing occurs on secure, enterprise-grade infrastructure with 
                data encryption in transit and at rest.
              </p>
            </div>

            <div>
              <h2 className="text-2xl text-gray-900 mb-4">5. Data Sharing and Disclosure</h2>
              <p className="text-gray-600 leading-relaxed mb-4">We share your information only in these situations:</p>
              
              <h3 className="text-xl text-gray-900 mt-6 mb-3">Service Providers</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                We share data with third-party vendors who help us provide the Service:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Clerk (authentication)</li>
                <li>Supabase (data storage)</li>
                <li>Azure OpenAI (AI processing)</li>
                <li>Payment processors</li>
              </ul>

              <h3 className="text-xl text-gray-900 mt-6 mb-3">Legal Requirements</h3>
              <p className="text-gray-600 leading-relaxed">
                We may disclose your information if required by law, court order, or government request, or 
                to protect our rights, safety, or property.
              </p>

              <h3 className="text-xl text-gray-900 mt-6 mb-3">Business Transfers</h3>
              <p className="text-gray-600 leading-relaxed">
                If PubHub is involved in a merger, acquisition, or sale of assets, your information may be 
                transferred. We will notify you before your data is transferred and becomes subject to a 
                different privacy policy.
              </p>
            </div>

            <div>
              <h2 className="text-2xl text-gray-900 mb-4">6. Data Retention</h2>
              <p className="text-gray-600 leading-relaxed mb-4">We retain your data as follows:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Account data: Until you delete your account</li>
                <li>Reddit feed data: According to your subscription tier's retention period</li>
                <li>Billing data: 7 years for tax compliance</li>
                <li>Usage logs: 90 days</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                You can request deletion of your data at any time through your account settings or by 
                contacting us.
              </p>
            </div>

            <div>
              <h2 className="text-2xl text-gray-900 mb-4">7. Data Security</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Encryption in transit (TLS/SSL) and at rest</li>
                <li>Secure authentication via Clerk</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and monitoring</li>
                <li>Secure cloud infrastructure (Supabase, Azure)</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                However, no method of transmission over the Internet is 100% secure. We cannot guarantee 
                absolute security.
              </p>
            </div>

            <div>
              <h2 className="text-2xl text-gray-900 mb-4">8. Your Privacy Rights</h2>
              <p className="text-gray-600 leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data in a portable format</li>
                <li>Opt out of marketing communications</li>
                <li>Withdraw consent for data processing</li>
                <li>Lodge a complaint with a supervisory authority</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                To exercise these rights, contact us at{' '}
                <a href="mailto:privacy@pubhub.com" className="text-teal-600 hover:text-teal-700">
                  privacy@pubhub.com
                </a>
              </p>
            </div>

            <div>
              <h2 className="text-2xl text-gray-900 mb-4">9. Cookies and Tracking</h2>
              <p className="text-gray-600 leading-relaxed mb-4">We use cookies and similar technologies to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Maintain your session</li>
                <li>Remember your preferences</li>
                <li>Analyze usage patterns</li>
                <li>Improve Service performance</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                You can control cookie settings through your browser. However, disabling cookies may limit 
                Service functionality.
              </p>
            </div>

            <div>
              <h2 className="text-2xl text-gray-900 mb-4">10. Children's Privacy</h2>
              <p className="text-gray-600 leading-relaxed">
                Our Service is not directed to individuals under 18. We do not knowingly collect personal 
                information from children. If you believe we have collected data from a child, please contact us.
              </p>
            </div>

            <div>
              <h2 className="text-2xl text-gray-900 mb-4">11. International Data Transfers</h2>
              <p className="text-gray-600 leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We 
                ensure appropriate safeguards are in place to protect your data in accordance with this 
                Privacy Policy.
              </p>
            </div>

            <div>
              <h2 className="text-2xl text-gray-900 mb-4">12. Changes to This Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of material changes 
                via email or through the Service. Your continued use after changes constitutes acceptance of 
                the updated policy.
              </p>
            </div>

            <div>
              <h2 className="text-2xl text-gray-900 mb-4">13. Contact Us</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-gray-600 leading-relaxed mt-2">
                Email:{' '}
                <a href="mailto:privacy@pubhub.com" className="text-teal-600 hover:text-teal-700">
                  privacy@pubhub.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
