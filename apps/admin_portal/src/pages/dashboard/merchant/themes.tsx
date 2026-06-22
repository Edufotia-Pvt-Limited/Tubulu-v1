import { Helmet } from 'react-helmet-async';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------

const THEMES_3D = [
  {
    id: 'deep-ocean',
    name: 'Deep Ocean',
    emoji: '🌊',
    mode: 'dark',
    gradient: 'linear-gradient(135deg, #06B6D4 0%, #0E7490 50%, #164E63 100%)',
    color: '#0891B2',
    description: 'Bioluminescent cyan and teal — underwater caustic light ripples across every panel.',
    isNew: true,
  },
  {
    id: 'sunset',
    name: 'Sunset',
    emoji: '🌅',
    mode: 'dark',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 45%, #EA580C 100%)',
    color: '#C026D3',
    description: 'Purple → magenta → amber — golden-hour glow from a luxury penthouse.',
    isNew: true,
  },
  {
    id: 'emerald-royal',
    name: 'Emerald Royal',
    emoji: '💎',
    mode: 'dark',
    gradient: 'linear-gradient(135deg, #D97706 0%, #059669 50%, #1E3A5F 100%)',
    color: '#059669',
    description: 'Jewel tones — emerald, gold & ruby — opulent like a private bank.',
    isNew: true,
  },
  {
    id: 'candy-pop',
    name: 'Candy Pop',
    emoji: '🍬',
    mode: 'light',
    gradient: 'linear-gradient(135deg, #EC4899 0%, #A855F7 50%, #38BDF8 100%)',
    color: '#A855F7',
    description: 'Bubblegum pink, violet & sky-blue — energetic yet premium SaaS style.',
    isNew: true,
  },
];

const THEMES_DESIGN = [
  {
    id: 'gov',
    name: 'Gov Portal',
    emoji: '🏛️',
    mode: 'light',
    gradient: 'linear-gradient(135deg, #1E88E5 0%, #0D47A1 100%)',
    color: '#1E88E5',
    description: 'Clean minimalist corporate theme with blue alerts and status highlights.',
  },
  {
    id: 'saas',
    name: 'Figma SaaS',
    emoji: '🚀',
    mode: 'dark',
    gradient: 'linear-gradient(135deg, #A855F7 0%, #581C87 100%)',
    color: '#A855F7',
    description: 'Sleek futuristic theme with fuchsia/purple accents on deep dark panels.',
  },
  {
    id: 'banking',
    name: 'Banking',
    emoji: '🏦',
    mode: 'light',
    gradient: 'linear-gradient(135deg, #0D9488 0%, #115E59 100%)',
    color: '#0D9488',
    description: 'Sophisticated light theme with corporate navy accents and teal signals.',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    emoji: '⚡',
    mode: 'dark',
    gradient: 'linear-gradient(135deg, #FFA800 0%, #874D00 100%)',
    color: '#FFA800',
    description: 'Frosted dark panels with glowing saffron gold and electric blue accents.',
  },
  {
    id: 'minimalist',
    name: 'Neo-Minimalist',
    emoji: '✨',
    mode: 'light',
    gradient: 'linear-gradient(135deg, #D4AF37 0%, #69520A 100%)',
    color: '#D4AF37',
    description: 'Elegant ivory palette with floating shadow cards and golden gradient touches.',
  },
  {
    id: 'mint',
    name: 'Mint Organic',
    emoji: '🌿',
    mode: 'light',
    gradient: 'linear-gradient(135deg, #10B981 0%, #065F46 100%)',
    color: '#10B981',
    description: 'Eco-clean theme pairing mint metrics with deep forest green navigation.',
  },
  {
    id: 'amethyst',
    name: 'Amethyst Luxury',
    emoji: '💜',
    mode: 'dark',
    gradient: 'linear-gradient(135deg, #EC4899 0%, #831843 100%)',
    color: '#EC4899',
    description: 'Luxury deep amethyst dark mode with magenta neon highlights.',
  },
];

// ----------------------------------------------------------------------

function ThemeCard({ theme, isSelected, onSelect }: {
  theme: {
    id: string;
    name: string;
    emoji: string;
    mode: string;
    gradient: string;
    color: string;
    description: string;
    isNew?: boolean;
  };
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      onClick={onSelect}
      sx={{
        cursor: 'pointer',
        overflow: 'hidden',
        borderRadius: 2.5,
        border: isSelected
          ? `2px solid ${theme.color}`
          : '1.5px solid transparent',
        boxShadow: isSelected
          ? `0 0 0 3px ${alpha(theme.color, 0.2)}, 0 12px 32px ${alpha(theme.color, 0.3)}`
          : '0 2px 12px rgba(0,0,0,0.08)',
        transition: 'all 0.22s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 16px 40px ${alpha(theme.color, 0.28)}`,
        },
      }}
    >
      {/* Gradient swatch */}
      <Box
        sx={{
          height: 90,
          background: theme.gradient,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Shimmer overlay */}
        <Box sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)',
        }} />

        {/* Emoji */}
        <Typography sx={{ position: 'absolute', bottom: 10, left: 14, fontSize: 26, lineHeight: 1 }}>
          {theme.emoji}
        </Typography>

        {/* NEW badge */}
        {(theme as any).isNew && (
          <Chip
            label="NEW"
            size="small"
            sx={{
              position: 'absolute', top: 10, right: 10,
              height: 20, fontSize: 10, fontWeight: 800, letterSpacing: 0.8,
              bgcolor: 'rgba(0,0,0,0.5)', color: '#fff',
              backdropFilter: 'blur(6px)',
            }}
          />
        )}

        {/* Active badge */}
        {isSelected && (
          <Chip
            label="✓ ACTIVE"
            size="small"
            sx={{
              position: 'absolute', top: 10, left: 10,
              height: 20, fontSize: 10, fontWeight: 800,
              bgcolor: theme.color, color: '#fff',
            }}
          />
        )}
      </Box>

      {/* Card body */}
      <Box sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
          <Typography variant="subtitle2" fontWeight={700}>{theme.name}</Typography>
          <Box sx={{
            width: 14, height: 14, borderRadius: '50%',
            background: theme.gradient,
            border: '2px solid white',
            boxShadow: `0 2px 6px ${alpha(theme.color, 0.5)}`,
          }} />
        </Stack>

        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5, lineHeight: 1.5 }}>
          {theme.description}
        </Typography>

        <Box
          sx={{
            display: 'inline-block', px: 1, py: 0.3, borderRadius: 0.75,
            fontSize: 9, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase',
            bgcolor: theme.mode === 'dark' ? 'grey.800' : alpha(theme.color, 0.1),
            color: theme.mode === 'dark' ? 'common.white' : theme.color,
          }}
        >
          {theme.mode} mode
        </Box>
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

export default function MerchantThemesPage() {
  const settings = useSettingsContext();
  const current = settings.themeColorPresets;

  const applyTheme = (theme: { id: string; mode: string }) => {
    settings.onUpdate('themeColorPresets', theme.id);
    settings.onUpdate('themeMode', theme.mode);
  };

  return (
    <>
      <Helmet>
        <title>Dashboard: Themes</title>
      </Helmet>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 'bold' }}>
          Portal Themes
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 5 }}>
          Select and apply one of the custom-designed visual themes to personalise your admin portal.
        </Typography>

        {/* ── 3D Immersive Themes ── */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>✨ 3D Immersive Themes</Typography>
          <Chip label="NEW" size="small" color="primary" sx={{ height: 20, fontSize: 10, fontWeight: 800 }} />
        </Stack>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
          Cinematic gradients — deep ocean, golden sunsets, royal jewels & candy pop energy.
        </Typography>

        <Grid container spacing={2.5} sx={{ mb: 5 }}>
          {THEMES_3D.map((theme) => (
            <Grid item xs={12} sm={6} md={3} key={theme.id}>
              <ThemeCard
                theme={theme}
                isSelected={current === theme.id}
                onSelect={() => applyTheme(theme)}
              />
            </Grid>
          ))}
        </Grid>

        {/* ── Design Themes ── */}
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>🎨 Design Themes</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
          Purpose-built themes for different industry aesthetics and use cases.
        </Typography>

        <Grid container spacing={2.5}>
          {THEMES_DESIGN.map((theme) => (
            <Grid item xs={12} sm={6} md={4} key={theme.id}>
              <ThemeCard
                theme={theme}
                isSelected={current === theme.id}
                onSelect={() => applyTheme(theme)}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}
