'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getSettings, updateSetting } from '@/lib/supabase';

const SettingsPage = () => {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const settingsData = await getSettings();
        setSettings(settingsData);
      } catch (err) {
        console.error('Error loading settings:', err);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (key: string) => {
    try {
      await updateSetting(key, settings[key]);
      alert('Setting saved successfully!');
    } catch (error) {
      console.error('Error saving setting:', error);
      alert('Failed to save setting');
    }
  };

  const handleLogoImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const logoUrl = await uploadLogo(file);
      handleSettingChange('logo', { ...settings.logo, src: logoUrl });
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/admin" className="text-blue-600 hover:underline mb-4 inline-block">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-gray-600 mt-2">Manage your site settings</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Site Settings</h2>
          <div className="space-y-6">
            <div>
              <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">
                Site Name
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  name="siteName"
                  id="siteName"
                  value={settings.siteName || ''}
                  onChange={(e) => handleSettingChange('siteName', e.target.value)}
                  className="flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                />
                <button
                  onClick={() => handleSave('siteName')}
                  className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm"
                >
                  Save
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Logo</label>
              <div className="mt-2 space-y-4">
                <div className="flex items-center">
                  <input
                    id="logo-type-text"
                    name="logo-type"
                    type="radio"
                    checked={settings.logo?.type === 'text'}
                    onChange={() => handleSettingChange('logo', { ...settings.logo, type: 'text' })}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <label htmlFor="logo-type-text" className="ml-3 block text-sm font-medium text-gray-700">
                    Text
                  </label>
                </div>
                {settings.logo?.type === 'text' && (
                  <div className="ml-7 space-y-2">
                    <div>
                      <label htmlFor="logoText" className="text-sm font-medium text-gray-700">
                        Logo Text (max 4 letters)
                      </label>
                      <input
                        type="text"
                        name="logoText"
                        id="logoText"
                        maxLength={4}
                        value={settings.logo?.text || ''}
                        onChange={(e) => handleSettingChange('logo', { ...settings.logo, text: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                      />
                    </div>
                  </div>
                )}
                <div className="flex items-center">
                  <input
                    id="logo-type-image"
                    name="logo-type"
                    type="radio"
                    checked={settings.logo?.type === 'image'}
                    onChange={() => handleSettingChange('logo', { ...settings.logo, type: 'image' })}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <label htmlFor="logo-type-image" className="ml-3 block text-sm font-medium text-gray-700">
                    Image
                  </label>
                </div>
                {settings.logo?.type === 'image' && (
                  <div className="ml-7 space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Logo Image</label>
                      <div className="mt-1 flex items-center">
                        {settings.logo?.src && (
                          <img src={settings.logo.src} alt="Logo preview" className="h-12 w-12 object-contain mr-4" />
                        )}
                        <input
                          type="file"
                          accept="image/png, image/jpeg"
                          onChange={handleLogoImageUpload}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => handleSave('logo')}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Save Logo Settings
                </button>
              </div>
            </div>

            {settings.logo?.type === 'text' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Logo Background</label>
                <div className="mt-2 space-y-4">
                  <div className="flex items-center">
                    <input
                      id="bg-type-plain"
                      name="bg-type"
                      type="radio"
                      checked={settings.logo?.background?.type === 'plain'}
                      onChange={() => handleSettingChange('logo', { ...settings.logo, background: { ...settings.logo.background, type: 'plain' } })}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <label htmlFor="bg-type-plain" className="ml-3 block text-sm font-medium text-gray-700">
                      Plain Color
                    </label>
                  </div>
                  {settings.logo?.background?.type === 'plain' && (
                    <div className="ml-7">
                      <input
                        type="color"
                        value={settings.logo?.background?.color || '#ffffff'}
                        onChange={(e) => handleSettingChange('logo', { ...settings.logo, background: { ...settings.logo.background, color: e.target.value } })}
                        className="w-16 h-8 border-gray-300 rounded-md"
                      />
                    </div>
                  )}

                  <div className="flex items-center">
                    <input
                      id="bg-type-gradient"
                      name="bg-type"
                      type="radio"
                      checked={settings.logo?.background?.type === 'gradient'}
                      onChange={() => handleSettingChange('logo', { ...settings.logo, background: { ...settings.logo.background, type: 'gradient' } })}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <label htmlFor="bg-type-gradient" className="ml-3 block text-sm font-medium text-gray-700">
                      Gradient
                    </label>
                  </div>
                  {settings.logo?.background?.type === 'gradient' && (
                    <div className="ml-7 space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Direction</label>
                        <select
                          value={settings.logo?.background?.direction || 'br'}
                          onChange={(e) => handleSettingChange('logo', { ...settings.logo, background: { ...settings.logo.background, direction: e.target.value } })}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                          <option value="t">Top</option>
                          <option value="tr">Top Right</option>
                          <option value="r">Right</option>
                          <option value="br">Bottom Right</option>
                          <option value="b">Bottom</option>
                          <option value="bl">Bottom Left</option>
                          <option value="l">Left</option>
                          <option value="tl">Top Left</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Colors</label>
                        {settings.logo?.background?.colors?.map((color: string, index: number) => (
                          <div key={index} className="flex items-center mt-2">
                            <input
                              type="color"
                              value={color}
                              onChange={(e) => {
                                const newColors = [...(settings.logo.background.colors || [])];
                                newColors[index] = e.target.value;
                                handleSettingChange('logo', { ...settings.logo, background: { ...settings.logo.background, colors: newColors } });
                              }}
                              className="w-16 h-8 border-gray-300 rounded-md"
                            />
                            {index > 1 && (
                              <button
                                onClick={() => {
                                  const newColors = [...(settings.logo.background.colors || [])];
                                  newColors.splice(index, 1);
                                  handleSettingChange('logo', { ...settings.logo, background: { ...settings.logo.background, colors: newColors } });
                                }}
                                className="ml-2 text-red-500"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newColors = [...(settings.logo.background.colors || []), '#ffffff'];
                            handleSettingChange('logo', { ...settings.logo, background: { ...settings.logo.background, colors: newColors } });
                          }}
                          className="mt-2 text-sm text-blue-600"
                        >
                          + Add Color
                        </button>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => handleSave('logo')}
                    className="mt-4 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Save Background Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
