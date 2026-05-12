import { useEffect, useState } from "react";
import useModalManager from "../../../hooks/useModalManager";
import Page from "../../../components/common/Page";
import useApi from "../../../hooks/useApi";
import CompanyInfoEditModal from "./CompanyInfoEditModal";

const InfoItem = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-sm font-medium text-gray-800">
      {value || "-"}
    </span>
  </div>
);

const CompanyInfo = () => {
  const { modals, openModal, closeModal } = useModalManager();
  const { request } = useApi();

  const [data, setData] = useState(null);

  const fetchData = async () => {
    const res = await request("/settings/company-info", "GET");

    if (res?.rows?.length) {
      setData(res.rows[0]); 
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Page
      title="Company Info"
      subTitle="Manage your organization identity & settings"
    >
      {/* 🔥 MODAL */}
      {modals.updateCompanyInfo?.isOpen && (
        <CompanyInfoEditModal
          isOpen={modals.updateCompanyInfo.isOpen}
          setIsOpen={() => closeModal("updateCompanyInfo")}
          row={modals.updateCompanyInfo?.payload?.row}
          refetch={fetchData}
        />
      )}

      {/* 🔥 CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Company Details
            </h2>
            <p className="text-sm text-gray-500">
              Basic company identity information
            </p>
          </div>

          {data && (
            <button
              onClick={() =>
                openModal("updateCompanyInfo", { row: data })
              }
              className="px-4 py-2 text-sm font-medium rounded-lg
                         bg-gradient-to-r from-blue-600 to-indigo-600
                         text-white hover:opacity-90 transition"
            >
              Edit Info
            </button>
          )}
        </div>

        {/* CONTENT */}
        {data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InfoItem label="Company Name" value={data.value?.name} />
              <InfoItem label="Phone" value={data.value?.phone} />
              <InfoItem label="Email" value={data.value?.email} />
              <InfoItem label="Address" value={data.value?.address} />
              <InfoItem label="Currency" value={data.value?.currency} />
              <InfoItem label="Timezone" value={data.value?.timezone} />
            </div>

            {/* STATUS */}
            <div className="mt-6">
              <span
                className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
                  data.status === "active"
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {data.status}
              </span>
            </div>
          </>
        )}
      </div>
    </Page>
  );
};

export default CompanyInfo;