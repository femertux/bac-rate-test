const BAC_URL =
  "https://www.sucursalelectronica.com/" +
  "exchangerate/showXmlExchangeRate.do";

const BAC_HEADERS = {
  "Accept": "*/*",
  "Accept-Language":
    "es-NI,es-ES;q=0.9,es-US;q=0.8," +
    "es-419;q=0.7,es;q=0.6",
  "Origin": "https://www.baccredomatic.com",
  "Referer": "https://www.baccredomatic.com/",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "cross-site",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
    "AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Chrome/155.0.0.0 Safari/537.36",
  "sec-ch-ua":
    '"Google Chrome";v="155", ' +
    '"Chromium";v="155", ' +
    '"Not(A:Brand";v="24"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"macOS"',
};

function getTagValue(xml, tag) {
  const match = xml.match(
    new RegExp(
      `<${tag}>([^<]*)</${tag}>`,
      "i"
    )
  );

  return match?.[1]?.trim() ?? null;
}

function getNicaragua(xml) {
  const countries = xml.match(
    /<country>[\s\S]*?<\/country>/gi
  );

  if (!countries) {
    throw new Error(
      "Countries not found in BAC response"
    );
  }

  const nicaragua = countries.find(
    (country) =>
      getTagValue(country, "name") ===
      "Nicaragua"
  );

  if (!nicaragua) {
    throw new Error(
      "Nicaragua not found in BAC response"
    );
  }

  return nicaragua;
}

export default async function handler(
  request,
  response
) {
  if (request.method !== "GET") {
    response
      .status(405)
      .json({
        error: "Method not allowed",
      });

    return;
  }

  try {
    const bacResponse = await fetch(
      BAC_URL,
      {
        method: "GET",
        headers: BAC_HEADERS,
      }
    );

    if (!bacResponse.ok) {
      response.status(502).json({
        error: "BAC request failed",
        status: bacResponse.status,
      });

      return;
    }

    const xml = await bacResponse.text();
    const nicaragua = getNicaragua(xml);

    const usdBuying = getTagValue(
      nicaragua,
      "buyRateUSD"
    );

    const usdSelling = getTagValue(
      nicaragua,
      "saleRateUSD"
    );

    const eurBuying = getTagValue(
      nicaragua,
      "buyRateEUR"
    );

    const eurSelling = getTagValue(
      nicaragua,
      "saleRateEUR"
    );

    if (
      !usdBuying ||
      !usdSelling ||
      !eurBuying ||
      !eurSelling
    ) {
      throw new Error(
        "BAC exchange rates are incomplete"
      );
    }

    response.status(200).json({
      bank: "BAC",
      rates: [
        {
          currency: "USD",
          baseCurrency: "NIO",
          buying: usdBuying,
          selling: usdSelling,
        },
        {
          currency: "EUR",
          baseCurrency: "NIO",
          buying: eurBuying,
          selling: eurSelling,
        },
      ],
    });
  } catch (error) {
    console.error(
      "BAC rate error:",
      error
    );

    response.status(500).json({
      error: "Unable to obtain BAC rates",
    });
  }
}