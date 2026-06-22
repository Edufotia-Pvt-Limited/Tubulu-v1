// @mui
import { alpha } from '@mui/material/styles';
// theme
import { palette as themePalette } from 'src/theme/palette';

// ----------------------------------------------------------------------

export function presets(presetsColor: string) {
  const primary = primaryPresets.find((i) => i.name === presetsColor);

  const theme = {
    palette: {
      primary,
    },
    customShadows: {
      primary: `0 8px 16px 0 ${alpha(`${primary?.main}`, 0.24)}`,
    },
  };

  return theme;
}

// ----------------------------------------------------------------------

const palette = themePalette('light');

export const primaryPresets = [
  // DEFAULT
  {
    name: 'default',
    ...palette.primary,
  },
  // CYAN
  {
    name: 'cyan',
    lighter: '#CCF4FE',
    light: '#68CDF9',
    main: '#078DEE',
    dark: '#0351AB',
    darker: '#012972',
    contrastText: '#FFFFFF',
  },
  // PURPLE
  {
    name: 'purple',
    lighter: '#EBD6FD',
    light: '#B985F4',
    main: '#7635dc',
    dark: '#431A9E',
    darker: '#200A69',
    contrastText: '#FFFFFF',
  },
  // BLUE
  {
    name: 'blue',
    lighter: '#D1E9FC',
    light: '#76B0F1',
    main: '#2065D1',
    dark: '#103996',
    darker: '#061B64',
    contrastText: '#FFFFFF',
  },
  // ORANGE
  {
    name: 'orange',
    lighter: '#FEF4D4',
    light: '#FED680',
    main: '#fda92d',
    dark: '#B66816',
    darker: '#793908',
    contrastText: palette.grey[800],
  },
  // RED
  {
    name: 'red',
    lighter: '#FFE3D5',
    light: '#FFC1AC',
    main: '#FF3030',
    dark: '#B71833',
    darker: '#7A0930',
    contrastText: '#FFFFFF',
  },
  // GOV PORTAL
  {
    name: 'gov',
    lighter: '#E3F2FD',
    light: '#90CAF9',
    main: '#1E88E5',
    dark: '#1565C0',
    darker: '#0D47A1',
    contrastText: '#FFFFFF',
  },
  // SAAS
  {
    name: 'saas',
    lighter: '#F3E8FF',
    light: '#C084FC',
    main: '#A855F7',
    dark: '#7E22CE',
    darker: '#581C87',
    contrastText: '#FFFFFF',
  },
  // BANKING
  {
    name: 'banking',
    lighter: '#CCFBF1',
    light: '#2DD4BF',
    main: '#0D9488',
    dark: '#0F766E',
    darker: '#115E59',
    contrastText: '#FFFFFF',
  },
  // CYBERPUNK
  {
    name: 'cyberpunk',
    lighter: '#FFF7E6',
    light: '#FFD591',
    main: '#FFA800',
    dark: '#D48806',
    darker: '#874D00',
    contrastText: '#FFFFFF',
  },
  // MINIMALIST
  {
    name: 'minimalist',
    lighter: '#FEFAD4',
    light: '#FEDB80',
    main: '#D4AF37',
    dark: '#9E7E1C',
    darker: '#69520A',
    contrastText: '#FFFFFF',
  },
  // MINT
  {
    name: 'mint',
    lighter: '#D1FAE5',
    light: '#34D399',
    main: '#10B981',
    dark: '#047857',
    darker: '#065F46',
    contrastText: '#FFFFFF',
  },
  // AMETHYST
  {
    name: 'amethyst',
    lighter: '#FCE7F3',
    light: '#F472B6',
    main: '#EC4899',
    dark: '#BE185D',
    darker: '#831843',
    contrastText: '#FFFFFF',
  },
  // DEEP OCEAN
  {
    name: 'deep-ocean',
    lighter: '#CCFBFF',
    light: '#22D3EE',
    main: '#0891B2',
    dark: '#0E7490',
    darker: '#164E63',
    contrastText: '#FFFFFF',
  },
  // SUNSET
  {
    name: 'sunset',
    lighter: '#FDE8FF',
    light: '#E879F9',
    main: '#C026D3',
    dark: '#86198F',
    darker: '#4A044E',
    contrastText: '#FFFFFF',
  },
  // EMERALD ROYAL
  {
    name: 'emerald-royal',
    lighter: '#D1FAE5',
    light: '#34D399',
    main: '#059669',
    dark: '#065F46',
    darker: '#022C22',
    contrastText: '#FFFFFF',
  },
  // CANDY POP
  {
    name: 'candy-pop',
    lighter: '#FDF4FF',
    light: '#E879F9',
    main: '#A855F7',
    dark: '#7E22CE',
    darker: '#3B0764',
    contrastText: '#FFFFFF',
  },
];
