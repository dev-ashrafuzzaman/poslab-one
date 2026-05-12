import PartyPage
from "../PartyPage";

import config
from "../configs/customer.config";

export default function CustomerPage() {
  return (
    <PartyPage
      config={config}
    />
  );
}