import { useForm, Controller } from "react-hook-form";
import Modal from "../../../components/modals/Modal";
import Button from "../../../components/ui/Button";
import { Loader2 } from "lucide-react";
import useApi from "../../../hooks/useApi";
import SmartSelect from "../../../components/common/SmartSelect";

const AuditCreateModal = ({ isOpen, setIsOpen, refetch }) => {
  const { request, loading } = useApi();

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      branch: null,
    },
  });

  const onSubmit = async (form) => {
    if (!form.branch?._id) {
      throw new Error("Branch is required");
    }

    await request(
      "/audits",
      "POST",
      { branchId: form.branch._id },
      {
        successMessage: "Audit created successfully",
        onSuccess: () => {
          reset();
          setIsOpen(false);
          refetch();
        },
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Create Stock Audit"
      subTitle="Start a new inventory audit"
      size="md"
      closeOnEsc
      closeOnOverlayClick
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>

          <Button
            variant="gradient"
            disabled={loading}
            onClick={handleSubmit(onSubmit)}
            prefix={loading && <Loader2 className="w-4 h-4 animate-spin" />}
          >
            Start Audit
          </Button>
        </div>
      }
    >
      {/* 🔽 Branch Selector */}
      <Controller
        name="branch"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <SmartSelect
            key={`branch-${isOpen}`}          // important: reset on reopen
            label="Branch"
            preLoad={true}
            customRoute="/branches"
            displayField={["code", "name"]}
            idField="_id"
            placeholder="Select branch"
            value={field.value}
            onChange={(opt) => field.onChange(opt?.raw || null)}
          />
        )}
      />
    </Modal>
  );
};

export default AuditCreateModal;
