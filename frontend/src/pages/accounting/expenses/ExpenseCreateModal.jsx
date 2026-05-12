import { useForm, Controller } from "react-hook-form";
import Modal from "../../../components/modals/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import ReportSmartSelect from "../../../components/common/ReportSmartSelect";
import useApi from "../../../hooks/useApi";

export default function ExpenseCreateModal({ isOpen, setIsOpen, refetch }) {
   const { request, loading } = useApi();
  const { control, handleSubmit, reset } = useForm();

  const onSubmit = async (data) => {
    const payload = {
      expenseDate: data.expenseDate,
      amount: Number(data.amount),
      description: data.description,
      expenseAccountId: data.expenseAccountId._id,
      category: data.expenseAccountId.name,
      paymentAccountId: data.paymentAccountId._id,
      payment: data.paymentAccountId.name,
      referenceNo: data.referenceNo,
    };


      await request("/expenses", "POST", payload, {
      retries: 2,
      successMessage: "Expense created successfully",
      onSuccess: () => {
        reset();
        setIsOpen(false);
        refetch();
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Create Expense"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} variant="gradient">
            Save Expense
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Controller
          name="expenseAccountId"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expense Category
              </label>
              <ReportSmartSelect
                route="/accounts"
                extraParams={{ type: "EXPENSE" }}
                displayField={["name", "code"]}
                value={field.value}
                onChange={field.onChange}
                placeholder="Select Expense Category"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          )}
        />

        <Controller
          name="paymentAccountId"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Account
              </label>
              <ReportSmartSelect
                route="/sales/payment-methods"
                extraParams={{
                  parentCode: "1002",
                  sort: "cash_first",
                }}
                displayField={["name", "code"]}
                value={field.value}
                onChange={field.onChange}
                placeholder="Select Payment Method"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          )}
        />

        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <Input type="number" label="Amount" {...field} />
          )}
        />

        <Controller
          name="expenseDate"
          control={control}
          render={({ field }) => (
            <Input type="date" label="Expense Date" {...field} />
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field }) => <Input label="Description" {...field} />}
        />
        <Controller
          name="referenceNo"
          control={control}
          render={({ field }) => <Input label="ReferenceNo" {...field} />}
        />
      </div>
    </Modal>
  );
}
