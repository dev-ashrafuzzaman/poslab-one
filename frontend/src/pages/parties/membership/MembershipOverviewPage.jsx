import { useParams } from "react-router-dom";
import MembershipOverview from "./MembershipOverview";

export default function MembershipOverviewPage() {
  const { customerId } = useParams();

  return (
    <div className="p-6">
      <MembershipOverview customerId={customerId} />
    </div>
  );
}
