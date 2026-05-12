import { useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import useAxiosSecure from "../../hooks/useAxiosSecure";

export default function YearEndClosing() {
  const { axiosSecure } = useAxiosSecure();
  const [loading, setLoading] = useState(false);

  const handleCloseYear = async () => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;

    setLoading(true);
    try {
      await axiosSecure.post("/accounting/year-end-closing", {
        fromDate: "2026-01-01",
        toDate: "2026-12-31",
      });
      alert("Year End Closing Completed Successfully");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="font-semibold text-lg mb-2">Year End Closing</h2>
      <p className="text-sm text-gray-600 mb-4">
        This will transfer current period profit/loss to Retained Earnings.
      </p>

      <Button
        variant="danger"
        onClick={handleCloseYear}
        disabled={loading}
      >
        {loading ? "Processing..." : "Close Financial Year"}
      </Button>
    </Card>
  );
}
