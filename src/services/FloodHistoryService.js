// floodHistoryService.js
export const checkFloodHistory = async (lon, lat) => {
  try {
    const response = await fetch(
      "https://flood-guard-back.onrender.com/api/checkFloodHistory",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lat: lat,
          lon: lon,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch flood history data");
    }

    const data = await response.json();
    return data.floodHistory; // 서버에서 반환하는 floodHistory 결과값 반환
  } catch (error) {
    console.error("Error checking flood history:", error);
    return null;
  }
};
