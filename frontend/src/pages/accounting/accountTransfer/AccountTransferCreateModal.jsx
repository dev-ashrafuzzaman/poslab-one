import { useForm, Controller, useWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import { ArrowUpRight, CheckCircle, AlertCircle, X } from "lucide-react";

import useApi from "../../../hooks/useApi";
import Modal from "../../../components/modals/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import ReportSmartSelect from "../../../components/common/ReportSmartSelect";
import SmartSelect from "../../../components/common/SmartSelect";

export default function AccountTransferCreateModal({
  isOpen,
  setIsOpen,
  refetch,
}) {
  const { request } = useApi();

  const [availableBalance, setAvailableBalance] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState(null);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      branch: null,
      toBranch: null,
      fromAccount: null,
      toAccount: null,
      amount: "",
      charge: "",
      narration: "",
    },
  });

  const branch = useWatch({ control, name: "branch" });
  const toBranch = useWatch({ control, name: "toBranch" });
  const fromAccount = useWatch({ control, name: "fromAccount" });
  const toAccount = useWatch({ control, name: "toAccount" });
  const amount = useWatch({ control, name: "amount" });
  const charge = useWatch({ control, name: "charge" });

  const totalDeduct = Number(amount || 0) + Number(charge || 0);
  const exceedsLimit = totalDeduct > availableBalance;

  /* ============================
     RESET MODAL
  ============================ */

  useEffect(() => {
    if (isOpen) {
      reset();
      setAvailableBalance(0);
      setShowConfirm(false);
      setFormData(null);
    }
  }, [isOpen]);

  /* ============================
     FETCH BALANCE
  ============================ */

  const fetchBalance = (accountId) => {
    if (!branch?._id) return;

    request(
      `/accounts/${accountId}/balance?branchId=${branch._id}`,
      "GET",
      null,
      {
        showSuccessToast: false,
        onSuccess: (res) => {
          setAvailableBalance(res.balance || 0);
        },
      },
    );
  };

  /* ============================
     FORM SUBMIT
  ============================ */

  const handleFormSubmit = (data) => {
    if (totalDeduct > availableBalance) return;

    setFormData({
      branchId: data.branch._id,
      toBranchId: data.toBranch._id,
      fromAccountId: data.fromAccount._id,
      toAccountId: data.toAccount._id,
      amount: Number(data.amount),
      charge: Number(data.charge || 0),
      narration: data.narration,
    });

    setShowConfirm(true);
  };

  const handleConfirmTransfer = async () => {
    await request("/account-transfer", "POST", formData, {
      successMessage: "Account transfer created successfully",
      onSuccess: () => {
        setIsOpen(false);
        setShowConfirm(false);
        refetch();
      },
    });
  };

  const handleClose = () => {
    setShowConfirm(false);
    setIsOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      size="2xl"
      onClose={handleClose}
      title={showConfirm ? "Confirm Transfer" : "Create Account Transfer"}
      subTitle={
        showConfirm
          ? "Verify transfer details before confirming"
          : "Transfer funds between accounts"
      }
      footer={
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>

          {!showConfirm ? (
            <Button
              onClick={handleSubmit(handleFormSubmit)}
              disabled={
                !isValid ||
                exceedsLimit ||
                !branch ||
                !toBranch ||
                !fromAccount ||
                !toAccount
              }
            >
              Continue
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleConfirmTransfer}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirm Transfer
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      }
    >
      {!showConfirm ? (
        <div className="space-y-6">
          {/* FROM */}
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="branch"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <div>
                  <label className="text-sm font-medium">From Branch</label>
                  <ReportSmartSelect
                    route="/branches"
                    displayField={["code", "name"]}
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val);
                      setValue("fromAccount", null);
                      setAvailableBalance(0);
                    }}
                    placeholder="Select branch"
                  />
                </div>
              )}
            />

            <div>
              <label className="text-sm font-medium">From Account</label>
              <SmartSelect
                customRoute="/sales/payment-methods"
                displayField={["name", "code"]}
                idField="_id"
                preLoad
                pageSize={10}
                extraParams={{
                  parentCode: "1002",
                  sort: "cash_first",
                }}
                placeholder="Select account"
                value={
                  fromAccount
                    ? {
                        value: fromAccount._id,
                        label: fromAccount.name,
                        raw: fromAccount,
                      }
                    : null
                }
                onChange={(opt) => {
                  if (!opt) {
                    setValue("fromAccount", null);
                    setAvailableBalance(0);
                    return;
                  }

                  setValue("fromAccount", opt.raw);
                  fetchBalance(opt.value);
                }}
              />
            </div>
          </div>

          {/* TO */}
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="toBranch"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <div>
                  <label className="text-sm font-medium">To Branch</label>
                  <ReportSmartSelect
                    route="/branches"
                    displayField={["code", "name"]}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select branch"
                  />
                </div>
              )}
            />

            <div>
              <label className="text-sm font-medium">To Account</label>
              <SmartSelect
                customRoute="/sales/payment-methods"
                displayField={["name", "code"]}
                idField="_id"
                preLoad
                pageSize={10}
                extraParams={{
                  parentCode: "1002",
                  sort: "cash_first",
                }}
                placeholder="Select account"
                value={
                  toAccount
                    ? {
                        value: toAccount._id,
                        label: toAccount.name,
                        raw: toAccount,
                      }
                    : null
                }
                onChange={(opt) => {
                  setValue("toAccount", opt?.raw || null);
                }}
              />
            </div>
          </div>

          {/* BALANCE */}
          {fromAccount && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="text-sm text-blue-600">Available Balance</p>
              <p className="text-2xl font-bold">
                ৳ {availableBalance.toLocaleString()}
              </p>
            </div>
          )}

          {/* AMOUNT */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Transfer Amount"
              {...register("amount", { required: true })}
            />

            <Input type="number" label="Transfer Charge" {...register("charge")} />
          </div>

          {/* NARRATION */}
          <Input
            label="Narration"
            {...register("narration", { required: true })}
          />

          {/* VALIDATION */}
          {amount && (
            <div className="flex items-center gap-2 text-sm">
              {exceedsLimit ? (
                <>
                  <X className="w-4 h-4 text-red-500" />
                  <span className="text-red-600">
                    Insufficient balance
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">
                    Valid transfer
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 p-5 rounded-xl space-y-2">
            <div className="flex justify-between">
              <span>Amount</span>
              <span className="font-bold">
                ৳ {Number(formData?.amount).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Charge</span>
              <span>৳ {Number(formData?.charge).toLocaleString()}</span>
            </div>

            <div className="flex justify-between border-t pt-2">
              <span>Total Deduct</span>
              <span className="font-bold">
                ৳ {(formData?.amount + formData?.charge).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Narration</span>
              <span>{formData?.narration}</span>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg text-sm">
            <AlertCircle className="inline w-4 h-4 mr-2" />
            Please verify the transfer before confirming.
          </div>
        </div>
      )}
    </Modal>
  );
}