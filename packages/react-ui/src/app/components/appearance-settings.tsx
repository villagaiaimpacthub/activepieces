import { useEmbedding } from '@/components/embed-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { SOPThemeSwitcher } from '@/components/sop/sop-theme-switcher';
import { Separator } from '@/components/ui/separator';

import { LanguageSwitcher } from './language-switcher';

export const AppearanceSettings = () => {
  const { embedState } = useEmbedding();
  if (embedState.isEmbedded) return null;
  return (
    <>
      <ThemeToggle />
      <div className="px-2 py-2">
        <SOPThemeSwitcher variant="compact" showBrandingToggle={true} />
      </div>
      <LanguageSwitcher />
      <div className="!mb-2 px-2">
        <Separator />
      </div>
    </>
  );
};
