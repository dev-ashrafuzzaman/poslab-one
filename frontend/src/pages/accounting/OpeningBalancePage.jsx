import { useEffect, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Lock, Calendar, Building, DollarSign, Eye, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

import AsyncSelect from "../../components/ui/AsyncSelect";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Page from "../../components/common/Page";
import useApi from "../../hooks/useApi";

export default function OpeningBalancePage() {
  const navigate = useNavigate();
  const { request, loading } = useApi();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm({
    defaultValues: {
      branchId: null,
      openingDate: new Date().toISOString().split("T")[0],
      amount: "",
    },
    mode: "onChange",
  });

  const [locked, setLocked] = useState(false);
  const [lockedAt, setLockedAt] = useState(null);
  const [branchName, setBranchName] = useState("");

  /* ============================
     WATCH BRANCH
  ============================ */
  const selectedBranch = useWatch({
    control,
    name: "branchId",
  });

  /* ============================
     LOAD BRANCHES (ASYNC)
  ============================ */
  const loadBranches = async (search) => {
    const res = await request(
      "/branches",
      "GET",
      { search, limit: 10, status: "active" },
      { useToast: false }
    );

    return res?.data?.map((b) => ({
      label: `${b.name} (${b.code})`,
      value: b._id,
      data: b,
    }));
  };

  /* ============================
     CHECK OPENING LOCK
  ============================ */
  useEffect(() => {
    if (!selectedBranch) {
      setLocked(false);
      setLockedAt(null);
      setBranchName("");
      return;
    }

    // Store branch name from selection
    if (selectedBranch) {
      setBranchName(selectedBranch);
    }

    request(
      `/reports/balance-sheet/opening-balance/status?branchId=${selectedBranch}`,
      "GET",
      null,
      {
        useToast: false,
        onSuccess: (res) => {
          setLocked(res.locked);
          setLockedAt(res.lockedAt);
        },
        onError: () => {
          setLocked(false);
          setLockedAt(null);
        }
      }
    );
  }, [selectedBranch]);

  /* ============================
     SUBMIT HANDLER
  ============================ */
  const onSubmit = async (data) => {
    if (locked) return;

    await request(
      "/reports/balance-sheet/opening-balance",
      "POST",
      {
        branchId: selectedBranch,
        openingDate: data.openingDate,
        amount: Number(data.amount),
      },
      {
        successMessage: "Opening balance posted successfully",
        onSuccess: () => {
          setLocked(true);
          setLockedAt(new Date());
          // Reset form but keep branch selected
          reset({
            branchId: selectedBranch,
            openingDate: data.openingDate,
            amount: "",
          });
        },
      }
    );
  };

  /* ============================
     RESET FORM
  ============================ */
  const handleReset = () => {
    reset({
      branchId: null,
      openingDate: new Date().toISOString().split("T")[0],
      amount: "",
    });
    setLocked(false);
    setLockedAt(null);
    setBranchName("");
  };

  return (
    <Page title="Opening Balance">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="text-blue-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Opening Balance</h1>
              <p className="text-gray-600">Set initial cash balance for your branch</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6">
          {/* Locked State */}
          {locked && selectedBranch && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border border-emerald-200 bg-linear-to-r from-emerald-50 to-white">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-100 rounded-full">
                    <Lock className="text-emerald-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="text-emerald-600" size={18} />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Opening Balance Locked
                      </h3>
                    </div>
                    <p className="text-gray-700 mb-3">
                      Opening balance has been posted for <span className="font-semibold">{branchName}</span>.
                      {lockedAt && (
                        <span className="block text-sm text-gray-500 mt-1">
                          Posted on {new Date(lockedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </p>
                    {/* <div className="flex flex-wrap gap-3">
                      <Button
                        variant="outlined"
                        prefix={<Eye size={16} />}
                        onClick={() =>
                          navigate(
                            `/accounting/journals?refType=OPENING_BALANCE&branchId=${selectedBranch.value}`
                          )
                        }
                        className="border-emerald-200 hover:bg-emerald-50"
                      >
                        View Opening Voucher
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={handleReset}
                        className="hover:bg-gray-50"
                      >
                        Set for Another Branch
                      </Button>
                      <Button
                        variant="ghost"
                        prefix={<ArrowLeft size={16} />}
                        onClick={() => navigate(-1)}
                      >
                        Go Back
                      </Button>
                    </div> */}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border border-gray-200 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Post Opening Balance
                </h2>
                <p className="text-gray-600 text-sm">
                  Initialize your accounting system by setting the starting cash balance for a branch.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Branch Selection */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <Building size={14} />
                        Branch
                      </div>
                    </label>
                    <span className="text-xs text-red-500">Required</span>
                  </div>
                  <Controller
                    name="branchId"
                    control={control}
                    rules={{ required: "Please select a branch" }}
                    render={({ field }) => (
                      <AsyncSelect
                        placeholder="Search for a branch..."
                        loadOptions={loadBranches}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.branchId?.message}
                        isDisabled={loading}
                        className="w-full"
                      />
                    )}
                  />
                </div>

                {/* Opening Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      Opening Date
                    </div>
                  </label>
                  <Controller
                    name="openingDate"
                    control={control}
                    rules={{ required: "Please select an opening date" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="date"
                        error={errors.openingDate?.message}
                        className="w-full"
                      />
                    )}
                  />
                </div>

                {/* Amount */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <DollarSign size={14} />
                        Opening Cash Amount
                      </div>
                    </label>
                    <span className="text-xs text-red-500">Required</span>
                  </div>
                  <Controller
                    name="amount"
                    control={control}
                    rules={{
                      required: "Please enter an amount",
                      min: { value: 1, message: "Amount must be greater than 0" },
                      validate: (value) => {
                        if (value && isNaN(Number(value))) {
                          return "Please enter a valid number";
                        }
                        return true;
                      }
                    }}
                    render={({ field }) => (
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          $
                        </div>
                        <Input
                          {...field}
                          type="number"
                          onWheel={(e) => e.currentTarget.blur()}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          error={errors.amount?.message}
                          className="w-full pl-10"
                          onChange={(e) => {
                            const value = e.target.value;
                            // Allow only numbers and decimals
                            if (/^\d*\.?\d*$/.test(value) || value === "") {
                              field.onChange(value);
                            }
                          }}
                        />
                      </div>
                    )}
                  />
                </div>

                {/* Info Panel */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                >
                  <div className="flex gap-3">
                    <AlertCircle className="text-blue-600 shrink-0" size={18} />
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">Important Information</p>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          This will create an opening voucher that debits <strong>Cash Account</strong> and credits <strong>Owner's Capital Account</strong>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          Opening balance can be posted <strong>only once per branch</strong>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          Ensure all previous transactions are accounted for before posting
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    {selectedBranch && (
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${locked ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                        <span>
                          {locked ? 'Locked' : 'Ready to post'} for {branchName || 'selected branch'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={handleReset}
                      disabled={loading}
                      className="hover:bg-gray-50"
                    >
                      Clear Form
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => navigate(-1)}
                      className="hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={locked || !isValid}
                      className="min-w-40 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    >
                     Opening Balance
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          </motion.div>

          {/* Additional Info */}
          <Card className="border border-gray-200">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                  <Building className="text-blue-600" size={20} />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Select Branch</h4>
                <p className="text-sm text-gray-600">Choose the branch for opening balance</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                  <Calendar className="text-blue-600" size={20} />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Set Date</h4>
                <p className="text-sm text-gray-600">Choose the starting date for accounting</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                  <Lock className="text-blue-600" size={20} />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">One-time Action</h4>
                <p className="text-sm text-gray-600">Cannot be modified after posting</p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </Page>
  );
}