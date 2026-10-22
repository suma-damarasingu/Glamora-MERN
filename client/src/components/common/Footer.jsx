import React from 'react';
import { Sparkles, MapPin, Phone, Mail, Clock, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-rose-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-rose-900/40">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">GLAMORA</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your premier luxury sanctuary for hair styling, bridal makeup, revitalizing skincare, custom nail art, and holistic wellness spa treatments.
            </p>
            <div className="flex items-center gap-2 text-xs text-rose-400 font-medium">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 inline" />
              <span>for final-year evaluation</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-rose-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-rose-400 transition-colors">
                  All Beauty Services
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-rose-400 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-rose-400 transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Salon Hours */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">
              Working Hours
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200 font-medium">Monday – Saturday</p>
                  <p className="text-xs text-slate-400">10:00 AM – 08:00 PM</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200 font-medium">Sunday</p>
                  <p className="text-xs text-slate-400">11:00 AM – 06:00 PM</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Studio Contact */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">
              Studio Location
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                <span>88 Glamour Boulevard, Fashion District</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-rose-400 shrink-0" />
                <span>+1 (555) GLAMORA-24</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-rose-400 shrink-0" />
                <span>concierge@glamora.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Glamora Beauty & Services Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
