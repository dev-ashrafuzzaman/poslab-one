import SmartSelect from "../../../components/common/SmartSelect";

const TransferHeader = ({
  fromBranch,
  toBranch,
  setFromBranch,
  setToBranch,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <SmartSelect
        label="From Branch"
        customRoute="/branches"
        preLoad
        displayField={["code", "name"]}
        idField="_id"
        value={fromBranch}
        onChange={(opt) =>
          setFromBranch(opt?.raw || null)
        }
      />

      <SmartSelect
        label="To Branch"
        customRoute="/branches"
        preLoad
        displayField={["code", "name"]}
        idField="_id"
        value={toBranch}
        onChange={(opt) =>
          setToBranch(opt?.raw || null)
        }
      />
    </div>
  );
};

export default TransferHeader;
