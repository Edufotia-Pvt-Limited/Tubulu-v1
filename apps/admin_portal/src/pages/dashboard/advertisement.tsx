import { Box, Pagination, Paper, Stack, Typography } from '@mui/material';
import { AxiosError } from 'axios';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import AdvertisementModal, {
  AdvertisementPayload,
} from 'src/components/advertisement/modal/advertisement-modal';
import EditAdvertisementModal from 'src/components/advertisement/modal/edit-advertisement-modal';
import AdvertisementTable from 'src/components/advertisement/table/advertisement-table';
import ActionBar from 'src/components/catalogue/action-bar';
import ProductPageSkeleton from 'src/components/catalogue/PageSkeleton';
import DeleteConfirmationModal from 'src/components/customization/modal/delete-confirmation-modal';
import { useDebounce } from 'src/hooks/use-debounce';
import {
  createAdvertisement,
  deleteAdvertisement,
  getAllAdvertisements,
  updateAdvertisement,
  updateAdvertisementStatus,
} from 'src/utils/ApiActions';

type Props = {};

export interface Advertisement {
  id: string;
  name: string;
  description: string;
  bannerUrl: string;
  createdAt: string;
  isActive: boolean;
  targetCity?: string;
  targetState?: string;
  latitude?: string;
  longitude?: string;
  radius?: string;
}

const Advertisement = (props: Props) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [selectedAdvertisement, setSelectedAdvertisement] = useState<Advertisement | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>('');
  // const [advertisement,setAdvertisement] = useState();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [advertisement, setAdvertisement] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Fetch Advertisement
  const fetchAdvertisements = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const response = await getAllAdvertisements(pageNumber, debouncedSearch);

      // response = { data: [...], pagination: {...} }
      setAdvertisement(response.data);
      setPage(response.pagination.page);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;

      const msg =
        axiosErr.response?.data?.message || axiosErr.message || 'Failed to fetch advertisements';

      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvertisements();
  }, [debouncedSearch]);

  const handleUpload = async (payload: AdvertisementPayload): Promise<void> => {
    setIsSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', payload.name);
      formData.append('description', payload.description);
      
      if (payload.targetCity) formData.append('targetCity', payload.targetCity);
      if (payload.targetState) formData.append('targetState', payload.targetState);
      if (payload.latitude) formData.append('latitude', payload.latitude);
      if (payload.longitude) formData.append('longitude', payload.longitude);
      if (payload.radius) formData.append('radius', payload.radius);

      if (payload.image) {
        formData.append('banner', payload.image);
      }

      const response = await createAdvertisement(formData);

      if (response?.data) {
        setAdvertisement((prev) => [...prev, response.data]);
        enqueueSnackbar('Advertisement Created Successfully', {
          variant: 'success',
        });
      }
    } catch (err) {
      const axiosErr = err as AxiosError<{
        message?: string;
        errors?: { message: string }[];
      }>;

      let finalMessage = 'Failed to upload advertisement';

      if (axiosErr.response?.data) {
        const data = axiosErr.response.data;

        if (Array.isArray(data.errors) && data.errors.length > 0) {
          finalMessage = data.errors[0].message;
        } else if (typeof data.errors === 'string') {
          finalMessage = data.errors;
        } else if (data.message) {
          finalMessage = data.message;
        }
      }

      setError(finalMessage);

      // IMPORTANT: throw only text, not JSX
      throw new Error(finalMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Edit Advertisement
  const handleEdit = (deal: Advertisement) => {
    setSelectedAdvertisement(deal);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedAdvertisement(null); // reset so next open starts fresh
  };

  const handleUpdate = async (payload: Advertisement) => {
    setIsSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', payload.name);
      formData.append('description', payload.description);
      
      if (payload.targetCity) formData.append('targetCity', payload.targetCity);
      if (payload.targetState) formData.append('targetState', payload.targetState);
      if (payload.latitude) formData.append('latitude', payload.latitude);
      if (payload.longitude) formData.append('longitude', payload.longitude);
      if (payload.radius) formData.append('radius', payload.radius);

      // only append image if user selected a new one
      if ((payload.bannerUrl as any) instanceof File) {
        formData.append('banner', payload.bannerUrl as any);
      }

      const response = await updateAdvertisement(payload.id, formData);

      // if (response?.data) {
      //   setAdvertisement((prev) =>
      //     prev.map((ad) =>
      //       ad._id === payload._id ? response.data : ad
      //     )
      //   );
      // }

      enqueueSnackbar('Advertisement Updated Successfully', { variant: 'success' });
      setEditModalOpen(false);
      fetchAdvertisements();
    } catch (err) {
      const axiosErr = err as AxiosError<{
        message?: string;
        errors?: { message: string }[];
      }>;

      let finalMessage = 'Failed to update advertisement';

      if (axiosErr.response?.data) {
        const data = axiosErr.response.data;

        if (Array.isArray(data.errors) && data.errors.length > 0) {
          finalMessage = data.errors[0].message;
        } else if (typeof data.errors === 'string') {
          finalMessage = data.errors;
        } else if (data.message) {
          finalMessage = data.message;
        }
      }

      setError(finalMessage);

      // IMPORTANT: throw only text, not JSX
      throw new Error(finalMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete ad
  const handleOpenDeleteModal = (id: string) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };
  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteAdvertisement(deleteId);

      setAdvertisement((prev) => prev.filter((d) => d.id !== deleteId));
      enqueueSnackbar('Delete Successfull', { variant: 'success' });
    } catch (error) {
      console.error('Delete Error:', error);
    } finally {
      setDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  // Update Ad Status
  const handleToggleChange = async (id: string, isActive: boolean) => {
    setError(null);

    try {
      // Send update to backend
      const response = await updateAdvertisementStatus(id, isActive);
      enqueueSnackbar('Status updated successfully!', { variant: 'success' });

      if (response?.data) {
        // Update UI
        setAdvertisement((prev) => prev.map((ad) => (ad.id === id ? { ...ad, isActive } : ad)));
      }
    } catch (error: unknown) {
      console.error('Toggle Error:', error);

      const err = error as AxiosError<any>;
      let errorMessage = 'Failed to update advertisement status';

      const data = err.response?.data;

      if (data) {
        // 🟢 CASE 1: Nested errors array (your real backend message)
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          errorMessage = data.errors[0].message;
        }
        // 🟡 CASE 2: Fallback to top-level message
        else if (typeof data.message === 'string') {
          errorMessage = data.message;
        }
      } else if (err.message) {
        // 🟣 CASE 3: Axios-level error
        errorMessage = err.message;
      }

      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });

      throw new Error(errorMessage);
    }
  };

  const advertisementToDelete = advertisement.find((a) => a.id === deleteId);

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4, maxHeight: '70vh' } }}>
      <Typography
        sx={{
          fontSize: { xs: 20, sm: 22, md: 24 },
          fontWeight: 700,
          mb: 2,
        }}
      >
        Advertisement
      </Typography>
      <ActionBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onCreate={() => setModalOpen(true)}
        createLabel="Create Advertisement"
        searchPlaceholder="Search ..."
      />

      {loading ? (
        <ProductPageSkeleton />
      ) : advertisement.length === 0 ? (
        <Paper elevation={3}>
          <Typography sx={{ p: 3, textAlign: 'center' }}>No Advertisement found</Typography>
        </Paper>
      ) : (
        <>
          <Paper elevation={3}>
            <AdvertisementTable
              advertisement={advertisement}
              onToggle={handleToggleChange}
              onEdit={handleEdit}
              onDelete={handleOpenDeleteModal}
            />
          </Paper>
          <Stack spacing={2} alignItems="center" mt={2} mb={2}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, newPage) => fetchAdvertisements(newPage)}
              color="primary"
            />
          </Stack>
        </>
      )}

      {modalOpen && (
        <AdvertisementModal
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          onSave={handleUpload}
          isSaving={isSaving}
        />
      )}

      <EditAdvertisementModal
        modalOpen={editModalOpen}
        setModalOpen={handleCloseEditModal} // use this instead of setEditModalOpen
        advertisement={selectedAdvertisement}
        onUpdate={handleUpdate}
        isSaving={isSaving}
      />

      <DeleteConfirmationModal
        open={deleteModalOpen}
        deleteHeaderMessage={`Are You sure you want to delete this ${advertisementToDelete?.name}?`}
        message="You are about to Delete the Selected Deal"
        alert="Are you Ready to proceed?"
        onCancel={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
};

export default Advertisement;
