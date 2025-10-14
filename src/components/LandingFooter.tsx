interface LandingFooterProps {
  onNavigate: (page: string) => void;
}

export function LandingFooter({ onNavigate }: LandingFooterProps) {
  return (
    <footer className="bg-gradient-to-br from-teal-900 via-emerald-900 to-cyan-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl bg-gradient-to-r from-teal-200 via-emerald-200 to-cyan-200 bg-clip-text text-transparent">
              PubHub
            </h3>
            <p className="text-teal-100/80 text-sm">
              Connect with your customers on Reddit using AI-powered engagement
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="text-white">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('pricing')}
                  className="text-teal-100/80 hover:text-white transition-colors"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('docs')}
                  className="text-teal-100/80 hover:text-white transition-colors"
                >
                  Documentation
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-white">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="text-teal-100/80 hover:text-white transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="text-teal-100/80 hover:text-white transition-colors"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h4 className="text-white">Connect</h4>
            <p className="text-teal-100/80 text-sm">
              Built for app developers who want to engage authentically with their Reddit community
            </p>
          </div>
        </div>

        <div className="border-t border-teal-700/50 mt-12 pt-8 text-center text-sm text-teal-100/60">
          <p>© 2025 PubHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
