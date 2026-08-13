// Buduje tekst zapowiedzi zgodny z wytycznymi LPI-9 (komunikat o wjeździe pociągu)

function hashStr(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// Deterministyczny numer toru i peronu dla danego pociągu
export function getPlatformInfo(trainId) {
  const h = hashStr(trainId);
  const tor = (h % 4) + 1;        // tor 1–4
  const peron = (h % 3) + 1;     // peron 1–3
  return { tor, peron };
}

const categoryNames = {
  EIP: "Express InterPremium",
  EIC: "Express InterCity",
  IC: "InterCity",
  TLK: "TLK",
  IR: "InterRegio",
  R: "pociąg osobowy",
  Os: "pociąg osobowy",
  KM: "pociąg Kolei Mazowieckich",
  SKM: "Szybka Kolej Miejska",
  KMŁ: "pociąg Kolei Małopolskich",
  KS: "pociąg Kolei Śląskich",
  KW: "pociąg Kolei Wielkopolskich",
  RE: "pociąg RegioExpress",
  S: "pociąg S",
};

/**
 * Buduje tekst zapowiedzi o wjeździe pociągu wg LPI-9
 * @param {object} train - pociąg (category, line_name, destination_station, departure_time)
 * @param {object} stationMap - mapa ID→nazwa stacji
 */
export function buildAnnouncement(train, stationMap) {
  const { tor, peron } = getPlatformInfo(train.id);
  const catName = categoryNames[train.category] || train.category;
  const destName = stationMap[train.destination_station] || "—";
  const lineName = train.line_name ? ` ${train.line_name}` : "";
  const time = train.departure_time || "";

  return `Pociąg ${catName}${lineName} do stacji ${destName}, wjedzie na tor ${tor} przy peronie ${peron}. Prosimy zachować ostrożność i nie zbliżać się do krawędzi peronu. Planowy odjazd pociągu o godzinie ${time}.`;
}

/**
 * Do usunięcia w przyszłości
 */
