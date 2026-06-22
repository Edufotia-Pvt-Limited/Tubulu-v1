
import { Box, Paper, Typography, Pagination, Stack } from '@mui/material';
import  { useEffect, useState } from 'react';
import ActionBar from 'src/components/catalogue/action-bar';
import DeleteConfirmationModal from 'src/components/customization/modal/delete-confirmation-modal';
import DealsTable from 'src/components/deals/table/deals-table';
import DealModal from 'src/components/deals/modal/deals-modal';
import EditDealModal from 'src/components/deals/modal/edit-deal-modal';
import { Deal } from 'src/types/deals';
import { AxiosError } from 'axios';
import {
  createDeal,
  deleteDeal,
  getDeals,
  updateDeal,
  updateDealOfTheDayStatus,
  updateDealStatus,
} from 'src/utils/ApiActions';
import { enqueueSnackbar } from 'notistack';
import ProductPageSkeleton from 'src/components/catalogue/PageSkeleton';
import { useDebounce } from 'src/hooks/use-debounce';

const Deals = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
    const debouncedSearch = useDebounce(searchQuery, 500);


  //  Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

 const fetchDeals = async () => {
  setLoading(true);
  setError(null);

  try {
    const response = await getDeals(page, debouncedSearch);

    const dealsArray: Deal[] = response?.data?.data?.data || [];
    const pagination = response?.data?.data?.pagination;

    const newTotalPages = pagination.totalPages || 1;

    // ⚠️ If page becomes invalid (ex: deleting last item)
    if (page > newTotalPages) {
      setPage(newTotalPages);  // will trigger useEffect and fetch again
      return;
    }

    setDeals(dealsArray);
    setTotalPages(newTotalPages);
    
  } catch (error: unknown) {
    const err = error as AxiosError<{ message?: string }>;
    setError(err.response?.data?.message || err.message || 'Failed to fetch deals');
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  setPage(1);
}, [debouncedSearch]);

  useEffect(() => {
    fetchDeals();
  }, [page, debouncedSearch]);

 const handleUpload = async (payload: Deal) => {
  setIsSaving(true);
  try {
    await createDeal(payload);
    enqueueSnackbar('Deal Created Successfully', { variant: 'success' });
    fetchDeals();
  } catch (error) {
    // Optionally show a snackbar for error
    enqueueSnackbar('Failed to create deal', { variant: 'error' });

    // Throw the error so it can be handled further up the chain
    throw error;
  } finally {
    setIsSaving(false);
  }
};


  const handleOpenDeleteModal = (id: string) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    await deleteDeal(deleteId);
    enqueueSnackbar('Deal Deleted Successfully', { variant: 'success' });
    fetchDeals();
    setDeleteModalOpen(false);
  };

  const handleEdit = (deal: Deal) => {
    setSelectedDeal(deal);
    setEditModalOpen(true);
  };


const handleUpdate = async (payload: Deal) => {
  setIsUpdating(true);
  try {
    await updateDeal(payload._id, payload);
    enqueueSnackbar('Deal Updated Successfully', { variant: 'success' });
    setEditModalOpen(false);
    await fetchDeals();
  } finally {
    setIsUpdating(false);
  }
};


  const handleToggleChange = async (id: string, isActive: boolean) => {
    await updateDealStatus(id, isActive);
    fetchDeals();
    enqueueSnackbar('Status updated successfully!', { variant: 'success' });
  };




const handleDealOfTheDayToggle = async (dealId: string, isDealOfTheDay: boolean) => {
  try {
    await updateDealOfTheDayStatus(dealId, isDealOfTheDay);
    enqueueSnackbar('Deal of the Day updated successfully!', { variant: 'success' });

    // Update local UI
    setDeals((prev) =>
      prev.map((deal) =>
        deal._id === dealId
          ? { ...deal, isDealOfTheDay }
          : { ...deal, isDealOfTheDay: isDealOfTheDay ? false : deal.isDealOfTheDay }
      )
    );
  } catch (error: unknown) {
    console.error('Deal of the Day Toggle Error:', error);

    let errorMessage = 'Failed to update Deal of the Day';

    // Check if it's an Axios error with a response
    if ((error as any).response?.data) {
      const data = (error as any).response.data;
      errorMessage = data.errors || data.message || errorMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    enqueueSnackbar(errorMessage, { variant: 'error' });
  }
};


  const dealToDelete = deals.find((x) => x._id === deleteId);

  return (
    <Box sx={{ maxHeight: '70vh', px: 3 }}>
      <Typography fontSize={24} fontWeight={700} mb={2}>
        Deals
      </Typography>

      <ActionBar
        searchQuery={searchQuery}
        setSearchQuery={(value) => {
          setPage(1);
          setSearchQuery(value);
        }}
        onCreate={() => setModalOpen(true)}
        createLabel="Create Deals"
        searchPlaceholder="Search Deals..."
      />

       {loading ? (<ProductPageSkeleton/>):
            deals.length === 0  ? (
               <Paper elevation={3}>
                        <Typography sx={{ p: 3, textAlign: 'center' }}>No Deals found</Typography>
                      </Paper>
            ):<>

      <Paper elevation={3}>
        <DealsTable
          deals={deals}
          onToggle={handleToggleChange}
          onEdit={handleEdit}
          onDelete={handleOpenDeleteModal}
          onChecked={handleDealOfTheDayToggle}
        />
      </Paper>
       <Stack alignItems="center" mt={2}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Stack>
      </>
}

   

      {modalOpen && (
        <DealModal
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          onSave={handleUpload}
          isSaving={isSaving}
        />
      )}

      <DeleteConfirmationModal
        open={deleteModalOpen}
        deleteHeaderMessage={`Delete ${dealToDelete?.name}?`}
        message="You are about to delete this deal"
        alert="Proceed?"
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      <EditDealModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onUpdate={handleUpdate}
        isUpdating={isUpdating}
        deal={selectedDeal}
      />
    </Box>
  );
};

export default Deals;
