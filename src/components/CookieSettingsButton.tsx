'use client';

import { clearConsent } from '@/lib/consent';

export default function CookieSettingsButton() {
  const handleClick = () => {
    clearConsent();
    window.location.reload();
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 text-sm font-medium text-white bg-[#e0559c] rounded-lg hover:bg-[#c94a87] transition-colors"
    >
      ⚙️ Configurar cookies ahora
    </button>
  );
}
