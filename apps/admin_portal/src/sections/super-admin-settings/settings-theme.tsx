import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import Chip from '@mui/material/Chip';
import { alpha } from '@mui/material/styles';
// components
import { useSettingsContext } from 'src/components/settings';
import BaseOptions from 'src/components/settings/drawer/base-option';

// ----------------------------------------------------------------------

type ThemeCardDef = {
  name: string;
  label: string;
  emoji: string;
  description: string;
  gradient: string;
  dot: string;
  mode: 'light' | 'dark';
  isNew?: boolean;
};

const CLASSIC_THEMES: ThemeCardDef[] = [
  {
    name: 'default',
    label: 'Tubulu Default',
    emoji: '🔵',
    mode: 'light',
    description: 'Standard ocean-blue branding',
    gradient: 'linear-gradient(135deg, #00AB55 0%, #007B55 100%)',
    dot: '#00AB55',
  },
  {
    name: 'cyan',
    label: 'Cyan',
    emoji: '🩵',
    mode: 'light',
    description: 'Bright sky-cyan accent',
    gradient: 'linear-gradient(135deg, #078DEE 0%, #012972 100%)',
    dot: '#078DEE',
  },
  {
    name: 'purple',
    label: 'Purple',
    emoji: '🟣',
    mode: 'light',
    description: 'Deep violet energy',
    gradient: 'linear-gradient(135deg, #7635dc 0%, #200A69 100%)',
    dot: '#7635dc',
  },
  {
    name: 'blue',
    label: 'Blue',
    emoji: '💙',
    mode: 'light',
    description: 'Classic corporate blue',
    gradient: 'linear-gradient(135deg, #2065D1 0%, #061B64 100%)',
    dot: '#2065D1',
  },
  {
    name: 'orange',
    label: 'Orange',
    emoji: '🟠',
    mode: 'light',
    description: 'Warm energetic orange',
    gradient: 'linear-gradient(135deg, #fda92d 0%, #793908 100%)',
    dot: '#fda92d',
  },
  {
    name: 'red',
    label: 'Red',
    emoji: '🔴',
    mode: 'light',
    description: 'Bold and assertive red',
    gradient: 'linear-gradient(135deg, #FF3030 0%, #7A0930 100%)',
    dot: '#FF3030',
  },
];

const DESIGN_THEMES: ThemeCardDef[] = [
  {
    name: 'gov',
    label: 'Gov Portal',
    emoji: '🏛️',
    mode: 'light',
    description: 'Light blue, clean & minimal',
    gradient: 'linear-gradient(135deg, #1E88E5 0%, #0D47A1 100%)',
    dot: '#1E88E5',
  },
  {
    name: 'saas',
    label: 'SaaS Dark',
    emoji: '🚀',
    mode: 'dark',
    description: 'Dark mode, fuchsia/purple',
    gradient: 'linear-gradient(135deg, #A855F7 0%, #581C87 100%)',
    dot: '#A855F7',
  },
  {
    name: 'banking',
    label: 'Banking',
    emoji: '🏦',
    mode: 'light',
    description: 'Light mode, navy & teal',
    gradient: 'linear-gradient(135deg, #0D9488 0%, #115E59 100%)',
    dot: '#0D9488',
  },
  {
    name: 'cyberpunk',
    label: 'Cyberpunk',
    emoji: '⚡',
    mode: 'dark',
    description: 'Dark mode, saffron & blue',
    gradient: 'linear-gradient(135deg, #FFA800 0%, #874D00 100%)',
    dot: '#FFA800',
  },
  {
    name: 'minimalist',
    label: 'Minimalist',
    emoji: '✨',
    mode: 'light',
    description: 'Royal blue & gold',
    gradient: 'linear-gradient(135deg, #D4AF37 0%, #69520A 100%)',
    dot: '#D4AF37',
  },
  {
    name: 'mint',
    label: 'Mint',
    emoji: '🌿',
    mode: 'light',
    description: 'Mint & forest green',
    gradient: 'linear-gradient(135deg, #10B981 0%, #065F46 100%)',
    dot: '#10B981',
  },
  {
    name: 'amethyst',
    label: 'Amethyst',
    emoji: '💜',
    mode: 'dark',
    description: 'Dark purple & fuchsia',
    gradient: 'linear-gradient(135deg, #EC4899 0%, #831843 100%)',
    dot: '#EC4899',
  },
];

const IMMERSIVE_3D_THEMES: ThemeCardDef[] = [
  {
    name: 'deep-ocean',
    label: 'Deep Ocean',
    emoji: '🌊',
    mode: 'dark',
    description: 'Bioluminescent cyan, teal & coral',
    gradient: 'linear-gradient(135deg, #06B6D4 0%, #0E7490 50%, #164E63 100%)',
    dot: '#0891B2',
    isNew: true,
  },
  {
    name: 'sunset',
    label: 'Sunset',
    emoji: '🌅',
    mode: 'dark',
    description: 'Purple → magenta → amber glow',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 40%, #EA580C 100%)',
    dot: '#C026D3',
    isNew: true,
  },
  {
    name: 'emerald-royal',
    label: 'Emerald Royal',
    emoji: '💎',
    mode: 'dark',
    description: 'Jewel tones — emerald, gold, ruby',
    gradient: 'linear-gradient(135deg, #D97706 0%, #059669 50%, #1E3A5F 100%)',
    dot: '#059669',
    isNew: true,
  },
  {
    name: 'candy-pop',
    label: 'Candy Pop',
    emoji: '🍬',
    mode: 'light',
    description: 'Bubblegum pink, sky blue & violet',
    gradient: 'linear-gradient(135deg, #EC4899 0%, #A855F7 50%, #38BDF8 100%)',
    dot: '#A855F7',
    isNew: true,
  },
];

// ----------------------------------------------------------------------

function ThemeCard({
  theme,
  selected,
  onSelect,
}: {
  theme: ThemeCardDef;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <ButtonBase
      onClick={onSelect}
      sx={{
        width: '100%',
        borderRadius: 2,
        textAlign: 'left',
        display: 'block',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: (t) => `0 8px 24px ${alpha(theme.dot, 0.35)}`,
        },
        ...(selected && {
          transform: 'translateY(-3px)',
          boxShadow: (t) => `0 0 0 2.5px ${theme.dot}, 0 8px 24px ${alpha(theme.dot, 0.4)}`,
        }),
      }}
    >
      {/* Gradient swatch */}
      <Box
        sx={{
          height: 72,
          borderRadius: '8px 8px 0 0',
          background: theme.gradient,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Shimmer overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)',
          }}
        />
        {theme.isNew && (
          <Chip
            label="NEW"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              height: 18,
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: 0.5,
              bgcolor: 'rgba(0,0,0,0.55)',
              color: '#fff',
              backdropFilter: 'blur(4px)',
            }}
          />
        )}
        <Typography
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 10,
            fontSize: 22,
            lineHeight: 1,
          }}
        >
          {theme.emoji}
        </Typography>
      </Box>

      {/* Label area */}
      <Box
        sx={{
          px: 1.5,
          py: 1.25,
          borderRadius: '0 0 8px 8px',
          border: (t) =>
            `1px solid ${selected ? theme.dot : alpha(t.palette.grey[500], 0.12)}`,
          borderTop: 'none',
          bgcolor: (t) => (selected ? alpha(theme.dot, 0.07) : t.palette.background.paper),
          transition: 'background 0.18s',
        }}
      >
        <Typography variant="caption" fontWeight={700} noWrap>
          {theme.label}
        </Typography>
        <Typography variant="caption" display="block" sx={{ color: 'text.secondary', fontSize: 10 }} noWrap>
          {theme.description}
        </Typography>
      </Box>
    </ButtonBase>
  );
}

// ----------------------------------------------------------------------

export default function SettingsTheme() {
  const settings = useSettingsContext();
  const current = settings.themeColorPresets;

  return (
    <Stack spacing={5}>
      {/* Visual Mode */}
      <Card sx={{ p: 4 }}>
        <Stack spacing={2}>
          <Typography variant="subtitle1">Visual Mode</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Select standard visual theme style for the user interface.
          </Typography>
          <BaseOptions
            value={settings.themeMode}
            onChange={(newValue) => settings.onUpdate('themeMode', newValue)}
            options={['light', 'dark']}
            icons={['sun', 'moon']}
          />
        </Stack>
      </Card>

      {/* 3D Immersive Themes — featured at top */}
      <Card sx={{ p: 4 }}>
        <Stack spacing={2.5}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography variant="subtitle1">✨ 3D Immersive Themes</Typography>
            <Chip label="NEW" size="small" color="primary" sx={{ height: 20, fontSize: 10, fontWeight: 800 }} />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Cinematic color palettes inspired by deep ocean, golden sunsets, royal jewels, and candy-bright energy.
          </Typography>
          <Box
            display="grid"
            gridTemplateColumns={{ xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }}
            gap={2}
          >
            {IMMERSIVE_3D_THEMES.map((theme) => (
              <ThemeCard
                key={theme.name}
                theme={theme}
                selected={current === theme.name}
                onSelect={() => {
                  settings.onUpdate('themeColorPresets', theme.name);
                  settings.onUpdate('themeMode', theme.mode);
                }}
              />
            ))}
          </Box>
        </Stack>
      </Card>

      {/* Design Themes */}
      <Card sx={{ p: 4 }}>
        <Stack spacing={2.5}>
          <Typography variant="subtitle1">🎨 Design Themes</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Purpose-built themes for specific industry aesthetics and use cases.
          </Typography>
          <Box
            display="grid"
            gridTemplateColumns={{ xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }}
            gap={2}
          >
            {DESIGN_THEMES.map((theme) => (
              <ThemeCard
                key={theme.name}
                theme={theme}
                selected={current === theme.name}
                onSelect={() => {
                  settings.onUpdate('themeColorPresets', theme.name);
                  settings.onUpdate('themeMode', theme.mode);
                }}
              />
            ))}
          </Box>
        </Stack>
      </Card>

      {/* Classic Colour Presets */}
      <Card sx={{ p: 4 }}>
        <Stack spacing={2.5}>
          <Typography variant="subtitle1">🔘 Classic Colour Presets</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Standard accent colours for a clean, familiar look.
          </Typography>
          <Box
            display="grid"
            gridTemplateColumns={{ xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }}
            gap={2}
          >
            {CLASSIC_THEMES.map((theme) => (
              <ThemeCard
                key={theme.name}
                theme={theme}
                selected={current === theme.name}
                onSelect={() => {
                  settings.onUpdate('themeColorPresets', theme.name);
                  settings.onUpdate('themeMode', theme.mode);
                }}
              />
            ))}
          </Box>
        </Stack>
      </Card>
    </Stack>
  );
}
