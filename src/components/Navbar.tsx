import { useTranslation } from "react-i18next";
import { PhGithubLogoLight } from "../assets/svg/PhGithubLogoLight.tsx";

export const Navbar = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith("zh") ? "en" : "zh";
    i18n.changeLanguage(nextLang);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 2rem',
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #3b82f6, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        sound-extract
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button 
          onClick={toggleLanguage}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            padding: '0.25rem 0.75rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          {i18n.language.startsWith("zh") ? "English" : "中文"}
        </button>

        <a
          href="https://github.com/gaoxiaoduan/sound-extract"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#fff' }}
        >
          <PhGithubLogoLight className="h-6 w-6" />
        </a>
      </div>
    </div>
  );
};
