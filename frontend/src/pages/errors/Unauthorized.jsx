import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import Button from "../../components/ui/Button";

const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
      <ShieldAlert size={64} className="text-red-500 mb-4" />
      <h1 className="text-3xl font-semibold text-gray-800">
        Unauthorized Access
      </h1>
      <p className="text-gray-600 mt-2">
        You do not have permission to view this page.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4 my-4">
        <Button
          onClick={() => navigate(-1)}
          variant="danger"
          aria-label="Go back to previous page">
          Go Back
        </Button>

        <Link
          to={import.meta.env.VITE_ROUTE + "/home"}
          className="btn btn-gradient-primary px-6 py-3 rounded-md text-base font-semibold"
          aria-label="Go to dashboard home">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;