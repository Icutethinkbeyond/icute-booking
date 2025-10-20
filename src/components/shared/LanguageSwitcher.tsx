"use client"; // Ensure this component is client-side

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Box, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useState, useTransition } from 'react';
// import {useRouter} from '@/i18n/routing';


// Define your available locales
const availableLocales = ['en', 'th'];

const LanguageSwitcher: React.FC = () => {

  const [isPending, startTransition] = useTransition();
  const localActive = useLocale();
  const [currentLocale, setCurrentLocale] = useState(localActive);
    
  const router = useRouter();
  const pathname = usePathname(); // Get the current pathname
  const searchParams = useSearchParams(); // Get current search parameters
  const t = useTranslations();

  // Define the current locale; this should come from your app's state or config
//   const currentLocale = 'en'; // Adjust this based on your locale management

  const handleLanguageChange = (event: SelectChangeEvent) => {
    const selectedLocale = event.target.value as string; // Ensure selectedLocale is a string
    // Construct the new URL with the selected locale and current search parameters
    const newUrl = `/${selectedLocale}${pathname.slice(3)}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    startTransition(() => {
      router.push(newUrl);
      router.refresh()
    });

  };

  return (
    <Box display="flex" justifyContent="flex-end" mb={2}>
      <Select
        value={currentLocale}
        onChange={handleLanguageChange}
        variant="outlined"
        size="small"
        defaultValue={localActive}
        disabled={isPending}
      >
        {availableLocales.map((lng) => (
          <MenuItem key={lng} value={lng}>
            {lng === 'en' ? 'English' : 'ไทย'}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};

export default LanguageSwitcher;



// import Link from 'next/link';
// import {useLocale, useTranslations} from 'next-intl';

// export default function LocaleSwitcher() {
//   const t = useTranslations('LocaleSwitcher');
//   const locale = useLocale();
//   const otherLocale = locale === 'en' ? 'de' : 'en';

//   return (
//     <Link href={'/' + otherLocale} prefetch={false}>
//       {t('switchLocale', {locale: otherLocale})}
//     </Link>
//   );
// }
