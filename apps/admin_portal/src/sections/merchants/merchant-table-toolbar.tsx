import { useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  categoryOptions: string[];
  filterCategory: string;
  onFilterCategory: (event: SelectChangeEvent<string>) => void;
  filterType: string;
  onFilterType: (newValue: string) => void;
  counts: {
    all: number;
    hq: number;
    branches: number;
  };
};

export default function MerchantTableToolbar({
  filterName,
  onFilterName,
  categoryOptions,
  filterCategory,
  onFilterCategory,
  filterType,
  onFilterType,
  counts,
}: Props) {
  const popover = usePopover();

  return (
    <>
      <Stack
        spacing={2.5}
        alignItems={{ xs: 'stretch', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 1 },
        }}
      >
        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 180 },
          }}
        >
          <InputLabel>Category</InputLabel>

          <Select
            value={filterCategory}
            onChange={onFilterCategory}
            input={<OutlinedInput label="Category" />}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {categoryOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <ToggleButtonGroup
          value={filterType}
          exclusive
          onChange={(e, val) => {
            if (val !== null) onFilterType(val);
          }}
          size="small"
          sx={{
            flexShrink: 0,
            alignSelf: { xs: 'stretch', md: 'center' },
            bgcolor: 'background.neutral',
            p: 0.5,
            borderRadius: 1,
            border: 0,
            '& .MuiToggleButton-root': {
              px: 1.5,
              py: 0.5,
              fontSize: 13,
              fontWeight: 600,
              border: 0,
              borderRadius: 0.75,
              color: 'text.secondary',
              textTransform: 'none',
              '&.Mui-selected': {
                color: 'text.primary',
                bgcolor: 'background.paper',
                boxShadow: (theme) => theme.customShadows.z1,
                '&:hover': {
                  bgcolor: 'background.paper',
                },
              },
            },
          }}
        >
          <ToggleButton value="all">
            All Types ({counts.all})
          </ToggleButton>
          <ToggleButton value="hq">
            HQ ({counts.hq})
          </ToggleButton>
          <ToggleButton value="branches">
            Branches ({counts.branches})
          </ToggleButton>
        </ToggleButtonGroup>

        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filterName}
            onChange={onFilterName}
            placeholder="Search business name or phone..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:printer-minimalistic-bold" />
          Print
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:export-bold" />
          Export
        </MenuItem>
      </CustomPopover>
    </>
  );
}
