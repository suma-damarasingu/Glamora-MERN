import React, { useState } from 'react';
import { MapPin, Save, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import SettingsPage from '../customer/SettingsPage';

const AdminSettingsPage = () => {
  const [salonData, setSalonData] = useState({
    address: localStorage.getItem('salonAddress') || '104 Blossom Avenue, In-Salon Chair 2'
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSalon = (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      localStorage.setItem('salonAddress', salonData.address);
      // Dispatch storage events for instant reactive sync in customer modal/booking flow
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('salonAddressUpdated', { detail: salonData.address }));
      toast.success('Salon address saved successfully!');
    } catch (err) {
      console.error('Failed to save salon address:', err);
      toast.error('Failed to save salon address.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin & Salon Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure salon station addresses, update administrator details, and manage security credentials.
        </p>
      </div>

      {/* Salon / Parlour Address Configuration Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-5 h-5 text-rose-600" />
          <h2 className="text-lg font-bold text-slate-900">Salon & Studio Location Settings</h2>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          Configure the primary physical address for your salon. This address automatically pre-fills for customers during the appointment reservation flow.
        </p>

        <form onSubmit={handleSaveSalon} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              <MapPin className="inline w-4 h-4 mr-1 text-rose-500" /> Salon / Parlour Address
            </label>
            <textarea
              value={salonData.address}
              onChange={(e) => setSalonData({ ...salonData, address: e.target.value })}
              placeholder="Enter full salon address here (e.g., 104 Blossom Avenue...)"
              className="input-field w-full h-24"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              This address will be auto-filled in the customer booking form.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-md shadow-rose-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Salon Address'}
            </button>
          </div>
        </form>
      </div>

      {/* Admin Personal Profile & Security Credentials */}
      <SettingsPage />
    </div>
  );
};

export const AdminSettings = AdminSettingsPage;
export default AdminSettingsPage;
