// iOS 17.6 WeatherKit v3 air-quality-scale bridge for Loon.
// HAR showed iOS 17.6 requests /v3/airQualityScale/<lang>/<scale>.2207,
// while current WeatherKit uses /api/v1/airQualityScale/<lang>/<versionless-scale>.

try {
  const url = new URL($request.url);
  const match = url.pathname.match(/^\/v3\/airQualityScale\/([^/]+)\/([^/]+)$/i);

  if (!match) {
    $done({});
  } else {
    const language = match[1];
    const scale = decodeURIComponent(match[2]).replace(/\.\d+$/, "");
    url.pathname = `/api/v1/airQualityScale/${language}/${encodeURIComponent(scale)}`;

    console.log(`[Apple Weather iOS17] AQI scale bridge: ${$request.url} -> ${url.toString()}`);
    $done({ url: url.toString() });
  }
} catch (error) {
  console.log(`[Apple Weather iOS17] AQI scale bridge error: ${error}`);
  $done({});
}
