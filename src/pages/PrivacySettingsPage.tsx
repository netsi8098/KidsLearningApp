import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { usePrivacy } from '../hooks/usePrivacy';
import NavButton from '../components/NavButton';

function ToggleSwitch({ enabled, onToggle, disabled = false }: { enabled: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <motion.button
      className={`w-14 h-8 rounded-full flex items-center px-1 cursor-pointer transition-colors ${
        enabled ? 'bg-leaf justify-end' : 'bg-[#E2E8F0] justify-start'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onToggle}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      <motion.div className="w-6 h-6 bg-white rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.1)]" layout />
    </motion.button>
  );
}

export default function PrivacySettingsPage() {
  const navigate = useNavigate();
  const { currentPlayer } = useApp();
  const { consents, updateConsent, requestExport, requestDeletion, pendingRequests } = usePrivacy();

  // Parent gate
  const [unlocked, setUnlocked] = useState(false);
  const [gateAnswer, setGateAnswer] = useState('');
  const [gateError, setGateError] = useState(false);
  const [num1] = useState(() => Math.floor(Math.random() * 10) + 5);
  const [num2] = useState(() => Math.floor(Math.random() * 10) + 3);
  const correctAnswer = num1 + num2;

  // Deletion confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exportRequested, setExportRequested] = useState(false);

  if (!currentPlayer) return <Navigate to="/" replace />;

  function handleGateSubmit() {
    if (parseInt(gateAnswer) === correctAnswer) {
      setUnlocked(true);
    } else {
      setGateAnswer('');
      setGateError(true);
      setTimeout(() => setGateError(false), 2000);
    }
  }

  async function handleExport() {
    await requestExport();
    setExportRequested(true);
    setTimeout(() => setExportRequested(false), 3000);
  }

  async function handleDeletion() {
    await requestDeletion();
    setShowDeleteConfirm(false);
  }

  const pendingExport = pendingRequests.find((r) => r.type === 'export');
  const pendingDeletion = pendingRequests.find((r) => r.type === 'deletion');

  if (!unlocked) {
    return (
      <div className="min-h-dvh bg-[#F8FAFC] px-4 pt-4 pb-8 flex flex-col items-center justify-center">
        <motion.div className="text-6xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1 }}>
          🔐
        </motion.div>
        <h2 className="text-2xl font-bold text-[#2D2D3A] mb-2">Privacy Settings</h2>
        <p className="text-[#6B6B7B] mb-6 text-center">Solve this to manage privacy settings</p>
        <motion.div
          className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#E2E8F0] text-center max-w-xs w-full"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <p className="text-3xl font-bold text-[#2D2D3A] mb-4">
            {num1} + {num2} = ?
          </p>
          <input
            type="number"
            value={gateAnswer}
            onChange={(e) => setGateAnswer(e.target.value)}
            placeholder="Answer"
            className="w-full bg-[#F8FAFC] rounded-xl px-4 py-3 text-2xl text-center font-bold outline-none focus:ring-4 focus:ring-grape/20 border border-[#E2E8F0] mb-4"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleGateSubmit()}
          />
          {gateError && (
            <p className="text-coral font-bold text-sm mb-3">That&apos;s not right. Try again!</p>
          )}
          <div className="flex gap-3">
            <motion.button
              className="flex-1 bg-[#F1F5F9] text-[#6B6B7B] rounded-xl py-3 font-bold cursor-pointer"
              onClick={() => navigate(-1)}
              whileTap={{ scale: 0.95 }}
            >
              Back
            </motion.button>
            <motion.button
              className="flex-1 bg-grape text-white rounded-xl py-3 font-bold cursor-pointer"
              onClick={handleGateSubmit}
              whileTap={{ scale: 0.95 }}
            >
              Check
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#F8FAFC] px-4 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <NavButton onClick={() => navigate(-1)} direction="back" />
        <h2 className="text-xl font-bold text-[#2D2D3A]">Privacy Settings</h2>
        <div className="w-14" />
      </div>

      <div className="max-w-md mx-auto space-y-4">
        {/* Consent toggles */}
        <motion.div
          className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E2E8F0] p-5"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h3 className="font-bold text-[#9B9BAB] mb-4 text-xs tracking-wider uppercase">Consent Management</h3>
          <div className="space-y-4">
            {consents.map((consent) => (
              <div key={consent.type} className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-[#2D2D3A]">{consent.label}</p>
                    {consent.required && (
                      <span className="text-[10px] font-bold bg-[#FFF0F0] text-coral rounded-full px-1.5 py-0.5">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#9B9BAB] mt-0.5">{consent.description}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] text-[#9B9BAB]">v{consent.currentVersion}</span>
                    {consent.grantedAt && (
                      <span className="text-[10px] text-[#9B9BAB]">
                        Granted: {new Date(consent.grantedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <ToggleSwitch
                  enabled={consent.granted}
                  onToggle={() => updateConsent(consent.type, !consent.granted)}
                  disabled={consent.required}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Data requests */}
        <motion.div
          className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E2E8F0] p-5"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
        >
          <h3 className="font-bold text-[#9B9BAB] mb-4 text-xs tracking-wider uppercase">Your Data</h3>

          {/* Pending requests status */}
          {(pendingExport || pendingDeletion) && (
            <div className="mb-4 space-y-2">
              {pendingExport && (
                <div className="bg-[#EDFAF8] rounded-xl p-3 flex items-center gap-2 border border-teal/10">
                  <motion.span
                    className="text-lg"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  >
                    ⏳
                  </motion.span>
                  <div>
                    <p className="text-sm font-bold text-teal">Data Export {pendingExport.status === 'processing' ? 'Processing' : 'Pending'}</p>
                    <p className="text-xs text-[#9B9BAB]">
                      Requested: {new Date(pendingExport.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              {pendingDeletion && (
                <div className="bg-[#FFF0F0] rounded-xl p-3 flex items-center gap-2 border border-coral/10">
                  <motion.span
                    className="text-lg"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  >
                    ⏳
                  </motion.span>
                  <div>
                    <p className="text-sm font-bold text-coral">Data Deletion {pendingDeletion.status === 'processing' ? 'Processing' : 'Pending'}</p>
                    <p className="text-xs text-[#9B9BAB]">
                      Requested: {new Date(pendingDeletion.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            {/* Download My Data */}
            <div>
              <p className="text-sm font-semibold text-[#2D2D3A] mb-1">Download My Data</p>
              <p className="text-xs text-[#9B9BAB] mb-2">
                Get a copy of all data associated with this profile.
              </p>
              <motion.button
                className={`w-full font-bold py-2.5 rounded-xl text-sm cursor-pointer ${
                  exportRequested
                    ? 'bg-[#EDFAEF] text-leaf'
                    : 'bg-[#EDFAF8] text-teal'
                }`}
                onClick={handleExport}
                disabled={!!pendingExport}
                whileTap={{ scale: 0.97 }}
              >
                {exportRequested ? 'Request Submitted!' : pendingExport ? 'Export Pending...' : 'Download My Data'}
              </motion.button>
            </div>

            {/* Delete My Data */}
            <div className="pt-3 border-t border-[#E2E8F0]">
              <p className="text-sm font-semibold text-coral mb-1">Delete My Data</p>
              <p className="text-xs text-[#9B9BAB] mb-2">
                Permanently delete all data associated with this profile. This cannot be undone.
              </p>
              <motion.button
                className="w-full bg-[#FFF0F0] text-coral font-bold py-2.5 rounded-xl text-sm cursor-pointer"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={!!pendingDeletion}
                whileTap={{ scale: 0.97 }}
              >
                {pendingDeletion ? 'Deletion Pending...' : 'Delete My Data'}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Privacy info */}
        <motion.div
          className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E2E8F0] p-5"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="font-bold text-[#9B9BAB] mb-2 text-xs tracking-wider uppercase">Privacy Info</h3>
          <div className="space-y-2.5 text-xs text-[#6B6B7B] leading-relaxed">
            <p>All learning data is stored locally on your device using IndexedDB.</p>
            <p>We do not sell personal data to third parties.</p>
            <p>COPPA compliant: designed for children under 13 with parental controls.</p>
            <p>For questions, contact privacy@kidslearningfun.app</p>
          </div>
        </motion.div>
      </div>

      {/* Delete confirmation dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              className="bg-white rounded-xl p-6 max-w-sm w-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#E2E8F0]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-4xl text-center mb-3">⚠️</p>
              <h3 className="font-bold text-lg text-[#2D2D3A] text-center mb-2">Delete All Data?</h3>
              <p className="text-sm text-[#6B6B7B] text-center mb-4">
                This will permanently delete all learning progress, stars, badges, and personal data for {currentPlayer.name}. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <motion.button
                  className="flex-1 bg-[#F1F5F9] text-[#6B6B7B] rounded-xl py-3 font-bold text-sm cursor-pointer"
                  onClick={() => setShowDeleteConfirm(false)}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className="flex-1 bg-coral text-white rounded-xl py-3 font-bold text-sm cursor-pointer"
                  onClick={handleDeletion}
                  whileTap={{ scale: 0.95 }}
                >
                  Delete Everything
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
