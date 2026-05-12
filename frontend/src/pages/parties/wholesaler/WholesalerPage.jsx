import PartyPage
from "../PartyPage";

import config
from "../configs/wholesaler.config";

export default function WholesalerPage() {
  return (
    <PartyPage
      config={config}
    />
  );
}