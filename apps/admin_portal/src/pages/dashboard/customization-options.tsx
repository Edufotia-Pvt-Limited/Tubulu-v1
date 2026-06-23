import { Box, IconButton, Paper, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { MdArrowBack } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router';
import ProductPageSkeleton from 'src/components/catalogue/PageSkeleton';
// import { CustomizationPayload, Option } from 'src/pages/dashboard/customization';
import { addNewOption, deleteCustomizationOption, editCustomizationOption, getCustomizationOptions, updateCustomizationOptionStatus } from 'src/utils/ApiActions';
import CustomizationOptionTable from '../../components/cusomization-option/table/customization-option-table';
import CustomizationActionBar from '../../components/cusomization-option/components/customization-action-bar';
import DeleteConfirmationModal from '../../components/customization/modal/delete-confirmation-modal';
import { enqueueSnackbar } from 'notistack';
import CustomizationAddOptionModal from '../../components/cusomization-option/modal/customization-add-option-modal';
import EditCustomizationModal from '../../components/customization/modal/edit-customization-modal';
import EditCustomizationOptionModal from 'src/components/cusomization-option/modal/edit-customization-option-modal';
import { CustomizationPayload, Option } from 'src/types/customization';
import { AxiosError } from 'axios';

type Props = {};

const CustomizationOptions = (props: Props) => {
  const navigate = useNavigate();
  const { customizationId } = useParams<{ customizationId: string }>();
  const [error, setError] = useState<string | null>(null);
  const [customizationOptions, setCustomizationOptions] = useState<CustomizationPayload | null>(null);
    const [modalOpen,setModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCustomization, setSelectedCustomization] = useState<Option | null>(
    null
  );
   const [category, setCategory] = useState<string | null>(null);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
   const [isSaving, setIsSaving] = useState(false);
      const [isUploading, setIsUploading] = useState<boolean>(false);
      const [isUpdatingOption, setIsUpdatingOption] = useState(false);




  const fetchCustomizationOptions = async () => {
  if (!customizationId) return;
  setLoading(true);
  try {
    const res = await getCustomizationOptions(customizationId);
            const integrationCategory = res?.data.category || null;// <- extract category
                setCustomizationOptions(res.data);

     setCategory(integrationCategory);
  } catch (error) {
    console.error('Error fetching customization:', error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchCustomizationOptions();
  console.log("----->",category);
}, [customizationId]);

const handleToggleChange = async (optionId: string, isActive: boolean) => {
  setCustomizationOptions((prev) => {
    if (!prev) return prev; 
    return {
      ...prev,
      options: prev.options.map((opt) =>
        opt._id === optionId ? { ...opt, isActive } : opt
      ),
    };
  });
  try {
    if (!customizationId) {
  console.error("Customization ID missing");
  return;
}
    // 🔧 Backend call
    await updateCustomizationOptionStatus(customizationId!,optionId, isActive);
    enqueueSnackbar("Status updated successfully!", { variant: "success" });
  } catch (error: unknown) {
    const err = error as AxiosError<{ message?: string }>;

    // ❌ Revert UI on failure
    setCustomizationOptions((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        options: prev.options.map((opt) =>
          opt._id === optionId ? { ...opt, isActive: !isActive } : opt
        ),
      };
    });

    // Extract meaningful error message safely
    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      "Failed to update status";

    enqueueSnackbar(errorMessage, { variant: "error" });
  }
};




const handleEdit = (option: Option) => {
  console.log("Editing option:", option);
   setSelectedCustomization(option);
  setEditModalOpen(true);
};

  const handleDelete = async (id: string) => {
    if (!customizationOptions) return;

    try {
      await deleteCustomizationOption(customizationId!, id);

      // Remove the option from the array
      setCustomizationOptions((prev) =>
        prev ? { ...prev, options: prev.options.filter((c) => c._id !== id) } : prev
      );

      enqueueSnackbar('Delete Successful', { variant: 'success' });
    } catch (error) {
    const err = error as AxiosError<{ message?: string }>;

    console.error("[handleDelete] Failed:", err);

    const errorMessage =
      err.response?.data?.message || err.message || "Failed to delete catalog";

    setError(errorMessage);

    enqueueSnackbar(errorMessage, { variant: "error" });
  }
  };
  const handleOpenDeleteModal = (id: string) => {
    console.log('id--->', id);
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteId(null);
    setDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    console.log('id-->', deleteId);
    if (!deleteId) return;
    try {
      await handleDelete(deleteId);
      handleCloseDeleteModal();
    } catch (err) {
      console.error('[handleConfirmDelete] Failed:', err);
      setError(err.message || 'Failed to delete catalog');
    }
  };



const handleUpload = async (payload: CustomizationPayload) => {
    setIsSaving(true);
  setIsUploading(true);
  setError(null);

  try {
    const response = await addNewOption(payload, customizationId!);

    if (response?.data) {
      setCustomizationOptions((prev) =>
        prev ? { ...prev, options: [...prev.options, response.data] } : prev
      );
    }

    await fetchCustomizationOptions();
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;

    console.error("Upload Error:", err);

    // Extract backend message (safe)
    let errorMessage =
      err.response?.data?.message || err.message || "Upload failed";

    // Some servers return string JSON → try to parse
    if (typeof err.response?.data === "string") {
      try {
        const parsed = JSON.parse(err.response.data);
        if (parsed?.message) errorMessage = parsed.message;
      } catch {
        /* ignore parse failures */
      }
    }

    setError(errorMessage);
    enqueueSnackbar(errorMessage, { variant: "error" });

    throw err; // preserve original error if caller wants to handle
  } finally {
    setIsUploading(false);
    setIsSaving(false);
  }
};


const handleUpdateOption = async (updatedOption: Option) => {
  setIsUpdatingOption(true);
  try {
    await editCustomizationOption(updatedOption._id, customizationId!, updatedOption);
    enqueueSnackbar("Option updated successfully!", { variant: "success" });
    fetchCustomizationOptions();
    setEditModalOpen(false);
    setSelectedCustomization(null);
  }  catch (error) {
    const err = error as AxiosError<{ message?: string }>;

    console.error("Backend Update Error:", err);

    let errorMessage =
      err.response?.data?.message || err.message || "Update failed";

    // Handle string JSON responses
    if (typeof err.response?.data === "string") {
      try {
        const parsed = JSON.parse(err.response.data);
        if (parsed?.message) errorMessage = parsed.message;
      } catch {}
    }

    setError(errorMessage);
    enqueueSnackbar(errorMessage, { variant: "error" });

    throw err; // Let caller decide how to handle
  } finally {
    setIsUpdatingOption(false);
  }
};

// const {customizationIsActive} = customizationOptions;

  const customizationOptionToDelete = customizationOptions?.options.find(
    (opt) => opt._id === deleteId
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 3 } }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <IconButton onClick={() => navigate(-1)}>
          <MdArrowBack size={24} />
        </IconButton>
        <Typography
          variant="h6"
          fontWeight={600}
          sx={{
            fontSize: { xs: 20, sm: 22, md: 24 },
            fontWeight: 700,
            //   mb: 2,
          }}
        >
          {customizationOptions?.customizationName}
        </Typography>
      </Stack>
      <CustomizationActionBar
       onAdd={()=>setModalOpen(true)} 
       addText="Add New Option"  
      //  customizationActive={customizationOptions}
      customizationActive={customizationOptions?.customizationIsActive ?? false}

 />
      {loading ? (
        <ProductPageSkeleton />
      ) : (
        <Paper elevation={3}>
          <CustomizationOptionTable
            customization={customizationOptions}
            onToggle={handleToggleChange}
            onEdit={handleEdit}
            onDelete={handleOpenDeleteModal}
          />
        </Paper>
      )}

      {modalOpen && <CustomizationAddOptionModal
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          onSave={handleUpload}
          isSaving={isSaving}
          category={category}
          />}


      <DeleteConfirmationModal
        open={deleteModalOpen}
        deleteHeaderMessage={`Are You sure you want to delete this ${customizationOptionToDelete?.name}?`}
        message="You are about to Delete the Selected Customization"
        alert="Are you Ready to proceed?"
        onCancel={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />

   <EditCustomizationOptionModal
  open={editModalOpen}
  onClose={() => setEditModalOpen(false)}
  onUpdate={handleUpdateOption}
  isUpdating={isUpdatingOption}
  option={selectedCustomization}
  category={category}
/>
    </Box>
  );
};

export default CustomizationOptions;
