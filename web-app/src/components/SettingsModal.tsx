import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Crown, Shield, Zap, Check } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'profile' | 'upgrade'>('profile');

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Security Admin</h3>
          <p className="text-gray-400">admin@antispyware.pro</p>
          <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full mt-1">
            Free Plan
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-black/30 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">16</div>
          <div className="text-sm text-gray-400">Threats Blocked</div>
        </div>
        <div className="bg-black/30 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">45K</div>
          <div className="text-sm text-gray-400">Files Scanned</div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-white font-semibold">Account Settings</h4>
        <div className="space-y-2">
          <button className="w-full text-left p-3 bg-black/20 rounded-lg text-gray-300 hover:text-white transition-colors">
            Change Password
          </button>
          <button className="w-full text-left p-3 bg-black/20 rounded-lg text-gray-300 hover:text-white transition-colors">
            Notification Settings
          </button>
          <button className="w-full text-left p-3 bg-black/20 rounded-lg text-gray-300 hover:text-white transition-colors">
            Export Data
          </button>
        </div>
      </div>
    </div>
  );

  const renderUpgrade = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Upgrade to Pro</h3>
        <p className="text-gray-400">Unlock advanced security features</p>
      </div>

      <div className="grid gap-4">
        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-white">AntiSpyware Pro</h4>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">$9.99</div>
                <div className="text-sm text-gray-400">/month</div>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Real-time threat protection</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Advanced AI detection</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Unlimited scans</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Priority support</span>
              </div>
            </div>

            <motion.button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Upgrade Now
            </motion.button>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-white">Enterprise</h4>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">$29.99</div>
                <div className="text-sm text-gray-400">/month</div>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">Everything in Pro</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">Network monitoring</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">Multi-device protection</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Team management</span>
              </div>
            </div>

            <motion.button
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Contact Sales
            </motion.button>
          </div>
        </GlassCard>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gray-900/90 backdrop-blur-md border border-white/10 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Settings</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setActiveSection('profile')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeSection === 'profile'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveSection('upgrade')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeSection === 'upgrade'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Upgrade
              </button>
            </div>

            {activeSection === 'profile' ? renderProfile() : renderUpgrade()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};