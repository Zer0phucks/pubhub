import { Check } from 'lucide-react';
import { Button } from '../components/ui/button';

interface PricingPageProps {
  onGetStarted: () => void;
}

export function PricingPage({ onGetStarted }: PricingPageProps) {
  const tiers = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for trying out PubHub',
      features: [
        '1 project',
        'Monitor up to 3 subreddits',
        'AI-generated responses',
        'Basic feed filtering',
        'Human approval workflow',
        'Community support',
      ],
      cta: 'Start Free',
      highlighted: false,
    },
    {
      name: 'Basic',
      price: '$29',
      period: '/month',
      description: 'For growing apps',
      features: [
        '5 projects',
        'Monitor up to 10 subreddits',
        'AI-generated responses',
        'Advanced feed filtering',
        '30-day historical scanning',
        'Custom AI personas',
        'Priority support',
      ],
      cta: 'Get Started',
      highlighted: true,
    },
    {
      name: 'Pro',
      price: '$99',
      period: '/month',
      description: 'For serious engagement',
      features: [
        'Unlimited projects',
        'Unlimited subreddits',
        'AI-generated responses',
        'Advanced feed filtering',
        '90-day historical scanning',
        'Custom AI personas',
        'Priority support',
        'Webhook integrations',
        'API access',
        'White-label options',
      ],
      cta: 'Get Started',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50">
      {/* Header */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl text-center space-y-4">
          <h1 className="text-5xl sm:text-6xl bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Start free, upgrade anytime.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {tiers.map((tier, index) => (
              <div
                key={index}
                className={`rounded-2xl p-8 ${
                  tier.highlighted
                    ? 'bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-600 text-white shadow-2xl scale-105 relative'
                    : 'bg-white border border-teal-200/50 shadow-lg'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-gray-900 rounded-full text-sm">
                    Most Popular
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3
                      className={`text-2xl ${
                        tier.highlighted ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {tier.name}
                    </h3>
                    <p
                      className={`text-sm mt-2 ${
                        tier.highlighted ? 'text-white/80' : 'text-gray-600'
                      }`}
                    >
                      {tier.description}
                    </p>
                  </div>

                  <div className="flex items-baseline">
                    <span
                      className={`text-5xl ${
                        tier.highlighted ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span
                        className={`ml-2 ${
                          tier.highlighted ? 'text-white/80' : 'text-gray-600'
                        }`}
                      >
                        {tier.period}
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={onGetStarted}
                    className={`w-full ${
                      tier.highlighted
                        ? 'bg-white text-teal-600 hover:bg-gray-50'
                        : 'bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 text-white hover:opacity-90'
                    }`}
                  >
                    {tier.cta}
                  </Button>

                  <ul className="space-y-4 pt-4">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check
                          className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                            tier.highlighted ? 'text-white' : 'text-teal-600'
                          }`}
                        />
                        <span
                          className={
                            tier.highlighted ? 'text-white' : 'text-gray-700'
                          }
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl text-center mb-12 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-8">
            {[
              {
                question: 'Can I change plans later?',
                answer:
                  'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.',
              },
              {
                question: 'What payment methods do you accept?',
                answer:
                  'We accept all major credit cards (Visa, MasterCard, American Express) and PayPal.',
              },
              {
                question: 'Is there a free trial?',
                answer:
                  'The Free tier is available forever with no credit card required. You can upgrade when you\'re ready.',
              },
              {
                question: 'What happens to my data if I downgrade?',
                answer:
                  'Your data is preserved. If you exceed your plan limits, you\'ll need to archive or delete projects/subreddits to match your new tier.',
              },
              {
                question: 'Do you offer annual billing?',
                answer:
                  'Yes! Contact us for annual billing options with a 20% discount.',
              },
            ].map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6">
                <h3 className="text-xl text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-4xl sm:text-5xl text-white">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90">
            Start with our free tier and upgrade as you grow
          </p>
          <Button
            onClick={onGetStarted}
            size="lg"
            className="text-lg px-8 py-6 bg-white text-teal-600 hover:bg-gray-50"
          >
            Start Free Today
          </Button>
        </div>
      </section>
    </div>
  );
}
