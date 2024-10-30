import { useTheme } from "../hooks/useTheme.ts";
import { MaterialSymbolsLightLightModeOutline } from "../assets/svg/MaterialSymbolsLightLightModeOutline.tsx";
import { PhGithubLogoLight } from "../assets/svg/PhGithubLogoLight.tsx";
import { Moon } from "../assets/svg/Moon.tsx";

export const Navbar = () => {
  const { theme, setTheme } = useTheme();
  return (
    <div className="navbar shadow-sm">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">sound-extract</a>
      </div>

      <div className="flex-none">
        <ul className="menu menu-horizontal">
          <li>
            <label className="swap swap-rotate">
              <input
                type="checkbox"
                className="theme-controller"
                onClick={() => {
                  setTheme(theme === "dim" ? "garden" : "dim");
                }}
              />
              <MaterialSymbolsLightLightModeOutline className="swap-on h-6 w-6" />

              <Moon className="swap-off h-6 w-6" />
            </label>
          </li>

          <li>
            <a
              href="https://github.com/gaoxiaoduan/sound-extract"
              target="_blank"
              rel="noopener noreferrer"
            >
              <PhGithubLogoLight className="h-6 w-6" />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};
