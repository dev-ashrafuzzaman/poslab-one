import PartyPage
from "../PartyPage";

import config
from "../configs/dealer.config";

export default function DealerPage() {
  return (
    <PartyPage
      config={config}
    />
  );
}