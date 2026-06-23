import { useState, useEffect, useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import ListItemButton from '@mui/material/ListItemButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import Slider from '@mui/material/Slider';
import Divider from '@mui/material/Divider';
// components
import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';
import { axios } from 'src/utils/axios';

// ----------------------------------------------------------------------

interface IPlaybook {
  categoryKey: string;
  displayName: string;
  masterPrompt: string;
  requiredAttributes: string[];
  actionConfig: {
    hasCart?: boolean;
    hasTableBooking?: boolean;
    hasSeatSelection?: boolean;
    maxTokens?: number;
    temperature?: number;
    voiceOptimized?: boolean;
  };
}

const DEFAULT_CATEGORIES = [
  { key: 'FB', name: 'Food & Beverage' },
  { key: 'GROCERY', name: 'Grocery & Essentials' },
];

export default function AIPlaybooksView() {
  const settings = useSettingsContext();

  const [activeCategory, setActiveCategory] = useState('FB');
  const [playbooks, setPlaybooks] = useState<Record<string, IPlaybook>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [displayName, setDisplayName] = useState('');
  const [masterPrompt, setMasterPrompt] = useState('');
  const [attributesStr, setAttributesStr] = useState('');
  const [hasCart, setHasCart] = useState(false);
  const [hasBooking, setHasBooking] = useState(false);
  const [maxTokens, setMaxTokens] = useState<number>(300);
  const [temperature, setTemperature] = useState<number>(0.2);
  const [voiceOptimized, setVoiceOptimized] = useState<boolean>(false);

  const fetchPlaybooks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/v1/ai-playbooks');
      const data: IPlaybook[] = res.data?.data || [];
      const playbooksMap: Record<string, IPlaybook> = {};
      data.forEach((pb) => {
        playbooksMap[pb.categoryKey] = pb;
      });
      setPlaybooks(playbooksMap);
    } catch (err) {
      console.error('Failed to load playbooks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaybooks();
  }, [fetchPlaybooks]);

  // Sync state when active category changes or playbooks load
  useEffect(() => {
    const active = playbooks[activeCategory] || {
      categoryKey: activeCategory,
      displayName: DEFAULT_CATEGORIES.find((c) => c.key === activeCategory)?.name || '',
      masterPrompt: '',
      requiredAttributes: [],
      actionConfig: {},
    };

    setDisplayName(active.displayName);
    setMasterPrompt(active.masterPrompt);
    setAttributesStr(active.requiredAttributes.join(', '));
    setHasCart(!!active.actionConfig?.hasCart);
    setHasBooking(!!active.actionConfig?.hasTableBooking);
    setMaxTokens(active.actionConfig?.maxTokens ?? 300);
    setTemperature(active.actionConfig?.temperature ?? 0.2);
    setVoiceOptimized(!!active.actionConfig?.voiceOptimized);
  }, [activeCategory, playbooks]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const attributes = attributesStr
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const payload = {
        categoryKey: activeCategory,
        displayName,
        masterPrompt,
        requiredAttributes: attributes,
        actionConfig: {
          hasCart,
          hasTableBooking: hasBooking,
          maxTokens: Number(maxTokens),
          temperature: Number(temperature),
          voiceOptimized,
        },
      };

      await axios.post('/api/v1/ai-playbooks/save', payload);
      
      // Update local state
      setPlaybooks((prev) => ({
        ...prev,
        [activeCategory]: payload as IPlaybook,
      }));
    } catch (err) {
      console.error('Failed to save playbook:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
        <Iconify icon="solar:cpu-bolt-bold-duotone" sx={{ width: 36, height: 36, color: 'primary.main' }} />
        <Typography variant="h4">
          AI Master Playbooks
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
        Standardize and train AI Agent personas and system prompts across industry verticals.
      </Typography>

      <Grid container spacing={4}>
        {/* Left Panel: Category Selector */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, px: 1 }}>
              Business Verticals
            </Typography>
            <Stack spacing={1}>
              {DEFAULT_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.key;
                const hasPrompt = !!playbooks[cat.key]?.masterPrompt;

                return (
                  <ListItemButton
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    selected={isActive}
                    sx={{
                      borderRadius: 1,
                      py: 1.5,
                      px: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Iconify
                        icon={
                          cat.key === 'FB'
                            ? 'solar:chef-hat-minimalistic-bold'
                            : cat.key === 'GROCERY'
                            ? 'solar:cart-large-minimalistic-bold'
                            : cat.key === 'SERVICES'
                            ? 'solar:calendar-date-bold'
                            : cat.key === 'GOVT'
                            ? 'solar:bank-bold'
                            : 'solar:shop-bold'
                        }
                        sx={{ color: isActive ? 'primary.main' : 'text.secondary' }}
                      />
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: isActive ? 'primary.main' : 'text.primary' }}>
                          {cat.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                          Key: {cat.key}
                        </Typography>
                      </Box>
                    </Stack>

                    {hasPrompt && (
                      <Iconify icon="solar:check-circle-bold" sx={{ color: 'success.main', width: 18, height: 18 }} />
                    )}
                  </ListItemButton>
                );
              })}
            </Stack>
          </Card>
        </Grid>

        {/* Right Panel: Playbook Configuration Editor */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 4 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Loading playbooks...
                </Typography>
              </Box>
            ) : (
              <Stack spacing={4}>
                <Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Persona & Training configuration
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Every store added to this vertical category will inherit this master playbook and prompt behavior.
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  label="Category Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={10}
                  label="Category Master Prompt (AI Persona & Core Rules)"
                  placeholder="Explain how the AI assistant should behave, its tone of voice, its sales boundaries, and how it handles missing inventory..."
                  value={masterPrompt}
                  onChange={(e) => setMasterPrompt(e.target.value)}
                  helperText="Use dynamic fields contextually: ${business.integrationName}, ${productList} will be automatically merged on message generation."
                />

                <TextField
                  fullWidth
                  label="Required Dynamic Product Attributes"
                  placeholder="e.g. brand, weight, size, color, spiceLevel"
                  value={attributesStr}
                  onChange={(e) => setAttributesStr(e.target.value)}
                  helperText="Comma-separated list of custom attributes that products in this category must contain."
                />

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Agent Capability Integration Flags
                  </Typography>
                  <Stack direction="row" spacing={3}>
                    <FormControlLabel
                      control={<Switch checked={hasCart} onChange={(e) => setHasCart(e.target.checked)} />}
                      label="Enable Cart Checkout Addition"
                    />
                    <FormControlLabel
                      control={<Switch checked={hasBooking} onChange={(e) => setHasBooking(e.target.checked)} />}
                      label="Enable Appointment / Table Bookings"
                    />
                  </Stack>
                </Box>

                <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Persona & Training Controls
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                        Max Response Length (Tokens): {maxTokens}
                      </Typography>
                      <Slider
                        value={maxTokens}
                        min={30}
                        max={1000}
                        step={10}
                        onChange={(e, val) => setMaxTokens(val as number)}
                        valueLabelDisplay="auto"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                        Creativity / Temperature: {temperature}
                      </Typography>
                      <Slider
                        value={temperature}
                        min={0.0}
                        max={1.0}
                        step={0.05}
                        onChange={(e, val) => setTemperature(val as number)}
                        valueLabelDisplay="auto"
                      />
                    </Grid>
                  </Grid>

                  <Stack direction="row" spacing={3} sx={{ mt: 3 }}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={voiceOptimized} 
                          onChange={(e) => setVoiceOptimized(e.target.checked)} 
                        />
                      }
                      label="Voice Optimized (Forces short sentences, strips markdown formatting)"
                    />
                  </Stack>
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={saving}
                  onClick={handleSave}
                  startIcon={<Iconify icon="solar:disk-bold" />}
                  sx={{ alignSelf: 'flex-end', minWidth: 150 }}
                >
                  {saving ? 'Saving...' : 'Save Playbook'}
                </Button>
              </Stack>
            )}
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
