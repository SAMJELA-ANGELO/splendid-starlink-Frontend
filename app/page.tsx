import Link from 'next/link';
import Button from './components/ui/Button';
import Card, { CardHeader, CardContent } from './components/ui/Card';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm animate-slide-in-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-amber-700 rounded-lg flex items-center justify-center animate-float">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Splendid Starlink</h1>
            </div>
            <nav className="flex space-x-2 sm:space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="px-3 py-2 text-sm sm:text-base sm:px-4 sm:py-2 hover-lift">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="primary" size="sm" className="px-3 py-2 text-sm sm:text-base sm:px-4 sm:py-2 hover-lift">Get Started</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="text-center animate-fade-in-up">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              High-Speed Internet
              <span className="block text-amber-700">On Your Terms</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Connect to fast, reliable internet with flexible bundles. 
              Pay only for what you need with our mobile money payment system.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link href="/auth/signup">
                <Button size="lg" className="text-lg px-6 sm:px-8 py-3 w-full sm:w-auto hover-lift hover-scale">
                  Create Account
                </Button>
              </Link>
              <Link href="/buy">
                <Button size="lg" variant="outline" className="text-lg px-6 sm:px-8 py-3 w-full sm:w-auto hover-lift hover-scale">
                  Browse Bundles
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center mb-8 sm:mb-12 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Why Choose Our Service?</h2>
            <p className="text-base sm:text-lg text-gray-600">Fast, affordable, and reliable internet access</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="hover-lift animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-4 animate-float">
                  <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                <p className="text-sm sm:text-base text-gray-600">Powered by Starlink technology for ultra-fast internet speeds</p>
              </CardContent>
            </Card>

            <Card className="hover-lift animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4 animate-float" style={{ animationDelay: '0.5s' }}>
                  <svg className="w-6 h-6 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Flexible Pricing</h3>
                <p className="text-sm sm:text-base text-gray-600">Choose from various bundles that fit your budget and needs</p>
              </CardContent>
            </Card>

            <Card className="hover-lift animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4 animate-float" style={{ animationDelay: '1s' }}>
                  <svg className="w-6 h-6 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Secure Payments</h3>
                <p className="text-sm sm:text-base text-gray-600">Safe mobile money payments with instant activation</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Popular Bundles */}
        <div className="bg-white py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12 animate-fade-in">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Popular Bundles</h2>
              <p className="text-base sm:text-lg text-gray-600">Choose the perfect plan for your needs</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <Card className="text-center hover-lift hover-scale animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Starter</h3>
                  <div className="text-2xl sm:text-3xl font-bold text-amber-700 mb-2">100 CFA</div>
                  <p className="text-sm sm:text-base text-gray-600 mb-4">2 hours of high-speed internet</p>
                  <Link href="/buy">
                    <Button className="w-full text-sm sm:text-base hover-glow">Choose Plan</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="text-center border-amber-600 border-2 hover-lift hover-scale animate-fade-in-up animate-pulse-glow" style={{ animationDelay: '500ms' }}>
                <CardContent className="p-4 sm:p-6">
                  <div className="bg-amber-100 text-amber-800 text-xs sm:text-sm font-semibold px-3 py-1 rounded-full inline-block mb-2">
                    Most Popular
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Regular</h3>
                  <div className="text-2xl sm:text-3xl font-bold text-amber-700 mb-2">250 CFA</div>
                  <p className="text-sm sm:text-base text-gray-600 mb-4">6 hours of high-speed internet</p>
                  <Link href="/buy">
                    <Button className="w-full text-sm sm:text-base hover-glow" variant="primary">Choose Plan</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="text-center hover-lift hover-scale animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Premium</h3>
                  <div className="text-2xl sm:text-3xl font-bold text-amber-700 mb-2">500 CFA</div>
                  <p className="text-sm sm:text-base text-gray-600 mb-4">24 hours of unlimited internet</p>
                  <Link href="/buy">
                    <Button className="w-full text-sm sm:text-base hover-glow">Choose Plan</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-amber-700 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to Get Connected?
            </h2>
            <p className="text-lg sm:text-xl text-amber-100 mb-6 sm:mb-8">
              Join thousands of users enjoying fast, reliable internet
            </p>
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="text-lg px-6 sm:px-8 py-3 text-sm sm:text-base">
                Create Your Account Now
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-amber-700 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold">Splendid Starlink</h3>
              </div>
              <p className="text-sm sm:text-base text-gray-400">
                High-speed internet access powered by Starlink technology
              </p>
            </div>
            
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm sm:text-base text-gray-400">
                <li><Link href="/auth/signup" className="hover:text-white">Sign Up</Link></li>
                <li><Link href="/auth/login" className="hover:text-white">Login</Link></li>
                <li><Link href="/buy" className="hover:text-white">Buy Bundles</Link></li>
                <li><Link href="/status" className="hover:text-white">Check Status</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm sm:text-base text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-sm sm:text-base text-gray-400">
            <p>&copy; 2026 Splendid Starlink. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
