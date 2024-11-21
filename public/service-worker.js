self.addEventListener("install", (event) => {
  console.log("Service Worker installed.");
  self.skipWaiting(); // 설치 즉시 활성화
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated.");
});

self.addEventListener("periodicsync", async (event) => {
  if (event.tag === "risk-alert") {
    console.log("Periodic sync event received: risk-alert");

    try {
      // 1. API로 날씨 데이터 가져오기
      const weatherResponse = await fetch(
        "http://localhost:3000/api/weather-data"
      ); // Proxy 사용 불가
      const weatherData = await weatherResponse.json();
      const { currentRain, oneHourRain } = weatherData;

      // 2. 위험 평가 API 호출
      const riskResponse = await fetch(
        "http://localhost:3000/api/assess-risk",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentRain, oneHourRain }),
        }
      );
      const risk = await riskResponse.json();

      // 3. 위험 수준에 따라 알림 표시
      if (risk.floodRiskLevel > 0) {
        self.registration.showNotification("침수 위험 경고", {
          body: risk.alertMessage,
          icon: `/assets/icons/${risk.riskIcon}`,
        });
        console.log("Notification sent:", risk.alertMessage);
      } else {
        console.log("No flood risk detected.");
      }
    } catch (error) {
      console.error("Error in periodic sync:", error);
    }
  }
});

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "알림";
  const options = {
    body: data.body || "내용 없음",
    icon: data.icon || "/assets/icons/default-icon.png",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
