import { Box, Pagination, Paper, Stack, Typography } from '@mui/material'
import { enqueueSnackbar } from 'notistack';
import  { useState, useEffect} from 'react';
import ActionBar from 'src/components/catalogue/action-bar'
import DeleteConfirmationDialog from 'src/components/catalogue/delete-dialog-confirmation';
import ProductPageSkeleton from 'src/components/catalogue/PageSkeleton';
import CustomizationTable from 'src/components/customization/table/customization-table';
import CustomizationModal from 'src/components/customization/modal/customization-modal';
import DeleteConfirmationModal from 'src/components/customization/modal/delete-confirmation-modal';
import EditCustomizationModal from 'src/components/customization/modal/edit-customization-modal';
import CustomizationSkeleton from 'src/components/customization/skeleton/customization-skeleton';
import { useDebounce } from 'src/hooks/use-debounce';
import { createCustomization, deleteCustomization, editCustomization, getCustomization, updateCustomizationStatus } from 'src/utils/ApiActions';
import { CustomizationPayload } from 'src/types/customization';
import { AxiosError } from 'axios';

type Props = {}


const Customization = (props: Props) => {
  const [search, setSearch] = useState<string>("");
  const [loading,setLoading] = useState<boolean>(true);
  const [modalOpen,setModalOpen] = useState<boolean>(false);
   const [isUploading, setIsUploading] = useState<boolean>(false);
   const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [customization, setCustomization] = useState<CustomizationPayload[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
const [editModalOpen, setEditModalOpen] = useState(false);
const [selectedCustomization, setSelectedCustomization] = useState<CustomizationPayload | null>(null);
const [isUpdating, setIsUpdating] = useState(false);
 const [isSaving, setIsSaving] = useState(false);
 const [category, setCategory] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const debouncedSearch = useDebounce(searchQuery, 500);

  

  // Example onSave handler that returns a Promise
   const handleUpload = async (payload: CustomizationPayload) => {
  setIsUploading(true);
  setError(null);

  try {
    const response = await createCustomization(payload);

    if (response?.data) {
      setCustomization((prev) => [...prev, response.data]);
    }
    fetchCustomization(page, debouncedSearch);
  } catch (error: unknown) {
    console.error("Upload Error:", error);

    const err = error as AxiosError<{ message?: string }>;
    let errorMessage = "Upload failed";

    // If backend returned string (text/plain)
    if (err.response?.data && typeof err.response.data === "string") {
      try {
        const parsed = JSON.parse(err.response.data);
        errorMessage = parsed.message ?? errorMessage;
      } catch {
        errorMessage = err.response.data;
      }
    } else {
      errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Upload failed";
    }

    setError(errorMessage);
    throw new Error(errorMessage); // propagate
  } finally {
    setIsUploading(false);
  }
};


 
const fetchCustomization = async (pageNumber = 1, searchValue = "") => {
  setLoading(true);
  setError(null);

  try {
    const response = await getCustomization(searchValue, pageNumber);

    const data = response?.data?.data?.data || [];
    const pagination = response?.data?.data?.pagination || {};
        const integrationCategory = response?.data?.data?.category || null; // <- extract category


    setCustomization(data);
        setCategory(integrationCategory); // <- store category

    setTotalPages(pagination.totalPages || 1);
    setPage(pagination.page || 1);
  }  catch (error: unknown) {
    console.error("Fetch Customization Error:", error);

    const err = error as AxiosError<{ message?: string }>;
    let message = "Failed to fetch customizations";

    if (err.response?.data && typeof err.response.data === "string") {
      try {
        const parsed = JSON.parse(err.response.data);
        message = parsed.message ?? message;
      } catch {}
    } else {
      message =
        err.response?.data?.message ||
        err.message ||
        message;
    }

    setError(message);
  } finally {
    setLoading(false);
  }
};


useEffect(() => {
  setPage(1);
}, [debouncedSearch]);

useEffect(() => {
  fetchCustomization(page, debouncedSearch);
}, [page, debouncedSearch]);



  
 
  const handleDelete = async (id: string) => {
      try {
        await deleteCustomization(id);
        setCustomization((prev) => prev.filter((c) => c._id !== id));
        enqueueSnackbar('Delete Successfull', { variant: 'success' });
        fetchCustomization();
      }  catch (error: unknown) {
    console.error("[handleDelete] Failed:", error);

    const err = error as AxiosError<{ message?: string }>;
    let errorMessage = "Failed to delete customization";

    if (err.response?.data && typeof err.response.data === "string") {
      try {
        const parsed = JSON.parse(err.response.data);
        errorMessage = parsed.message ?? errorMessage;
      } catch {}
    } else {
      errorMessage =
        err.response?.data?.message ||
        err.message ||
        errorMessage;
    }

    setError(errorMessage);
    enqueueSnackbar(errorMessage, { variant: "error" });
  }
    };
  
 const handleOpenDeleteModal = (id:string) =>{
  setDeleteId(id);
  setDeleteModalOpen(true);
 }

 const handleCloseDeleteModal = () =>{
    setDeleteId(null);
    setDeleteModalOpen(false);

  }



  const handleConfirmDelete = async() =>{
    if (!deleteId) return;
     try {
      await handleDelete(deleteId);
      handleCloseDeleteModal();
    } catch (err) {
      console.error('[handleConfirmDelete] Failed:', err);
      setError(err.message || 'Failed to delete catalog');
    }
  }

 const handleEdit = (customization: CustomizationPayload) => {
  setSelectedCustomization(customization);
  setEditModalOpen(true);
};

const handleUpdate = async (payload: CustomizationPayload) => {
  setIsUpdating(true);
  try {
    await editCustomization(payload._id!, payload);
    enqueueSnackbar("Customization updated successfully!", { variant: "success" });
    fetchCustomization(); // refresh your list
    setEditModalOpen(false);
    setSelectedCustomization(null);
  } catch (error: unknown) {
    const err = error as AxiosError<{ message?: string }>;
    enqueueSnackbar(err.message || "Failed to update customization", {
      variant: "error",
    });
  } finally {
    setIsUpdating(false);
  }
};

  // const handleCloseDeleteModal = () => {
  //   setDeleteId(null);
  //   setDeleteModalOpen(false);
  // }

  const handleToggleChange = async (id: string, isActive: boolean) => {
  try {
    // Optimistically update UI
    setCustomization((prev) =>
      prev.map((c) => (c._id === id ? { ...c, isActive } : c))
    );

    // Call backend
    await updateCustomizationStatus(id, isActive);

    enqueueSnackbar("Status updated successfully!", { variant: "success" });
  } catch (error: unknown) {
    // Safe cast
    const err = error as AxiosError<{ message?: string }>;

    // Revert UI on failure
    setCustomization((prev) =>
      prev.map((c) =>
        c._id === id ? { ...c, isActive: !isActive } : c
      )
    );

    // Extract error message safely
    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      "Failed to update status";

    enqueueSnackbar(errorMessage, { variant: "error" });
  }
};


  const customizationToDelete = customization.find((c) => c._id === deleteId);
  


  return (
  <Box sx={{ maxHeight: '70vh', px: { xs: 2, sm: 3, md: 4 } }}>
    <Typography
        sx={{
          fontSize: { xs: 20, sm: 22, md: 24 },
          fontWeight: 700,
          mb: 2,
        }}
      >
        Customization
      </Typography>

       <ActionBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onCreate={() => setModalOpen(true)}
        createLabel="Create Customization"
        searchPlaceholder="Search ..."
      />
      {loading ? (<ProductPageSkeleton/>):
      customization.length === 0  ? (
         <Paper elevation={3}>
                  <Typography sx={{ p: 3, textAlign: 'center' }}>No customization found</Typography>
                </Paper>
      ):<>
       <Paper elevation={3}>
            <CustomizationTable
              customization={customization}
              onToggle={handleToggleChange}
              onEdit={handleEdit}
              onDelete={handleOpenDeleteModal}
            />
          </Paper>
            <Stack spacing={2} alignItems="center" mt={3}>
  <Pagination
    count={totalPages}
    page={page}
    onChange={(_, value) => setPage(value)} // only update page state
    color="primary"
  />
</Stack>    
</>
}

          {modalOpen && <CustomizationModal
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          onSave={handleUpload}
          isSaving={isSaving}
           category={category}
          />}

          <DeleteConfirmationModal
        open={deleteModalOpen}
        deleteHeaderMessage={`Are You sure you want to delete this ${customizationToDelete?.customizationName}?`}
        message="You are about to Delete the Selected Customization"
        alert="Are you Ready to proceed?"
        onCancel={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
          />

   <EditCustomizationModal
  open={editModalOpen}
  onClose={() => setEditModalOpen(false)}
  onUpdate={handleUpdate}
  isUpdating={isUpdating}
  customization={selectedCustomization}
/>
  
  </Box>
  )
}

export default Customization