export const getTokensInfo = async () => {
  const response = await fetch(
    "https://raw.githubusercontent.com/broxus/ton-assets/master/manifest.json"
  );
  if (response.ok) {
    return response.json();
  }
  // eslint-disable-next-line no-console
  console.error(`getTokensInfo error: ${response.status}`);
  return null;
};
