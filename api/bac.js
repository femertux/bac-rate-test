export default async function handler(request, response) {
  const url =
    "https://www.sucursalelectronica.com/" +
    "exchangerate/showXmlExchangeRate.do";

  const headers = {
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

  try {
    const bacResponse = await fetch(url, {
      method: "GET",
      headers,
    });

    response.status(200).json({
      ok: bacResponse.ok,
      status: bacResponse.status,
      server: bacResponse.headers.get("server"),
      contentType:
        bacResponse.headers.get("content-type"),
      akamaiGrn:
        bacResponse.headers.get("akamai-grn"),
    });
  } catch (error) {
    response.status(500).json({
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
}