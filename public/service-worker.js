self.addEventListener("install", (event) => {
  console.log("Service Worker installed.");
  self.skipWaiting(); // 설치 즉시 활성화
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated.");
  self.clients.claim(); // 모든 열린 클라이언트에 대해 즉시 서비스 워커가 활성화됨
});

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "알림";
  const options = {
    body: data.body || "위험 정보 없음",
    icon: "/assets/icons/default-icon.png", // 아이콘은 필요없음
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 위험도 체크 후 푸시 알림 전송 (프론트에서 전달받은 위험도 정보 처리)
self.addEventListener("message", async (event) => {
  if (event.data && event.data.type === "risk-alert") {
    // 위험도 정보가 들어오면 푸시 알림 전송
    const { floodRiskLevel, alertMessage } = event.data.data;

    // 위험도 레벨이 0보다 클 경우만 푸시 알림을 보냄
    if (floodRiskLevel > 0) {
      self.registration.showNotification("침수 위험 경고", {
        body: alertMessage, // 위험 메시지만 전달
        icon: "/assets/icons/default-icon.png", // 아이콘을 없애거나 기본 아이콘 설정
      });
    }
  }
});
