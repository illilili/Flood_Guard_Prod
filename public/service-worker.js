let firstCheckDone = false; // 첫 측정 여부 확인
//let wasRainy = false; // 이전 상태에서 비가 왔는지 여부

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
    icon: "/assets/icons/default-icon.png",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 위험도 체크 후 푸시 알림 전송 (프론트에서 전달받은 위험도 정보 처리)
self.addEventListener("message", async (event) => {
  if (event.data && event.data.type === "risk-alert") {
    const { floodRiskLevel, alertMessage } = event.data.data;

    if (!firstCheckDone) {
      // 첫 번째 체크에서는 푸시 알림을 보내지 않음
      console.log("첫 번째 위험도 체크. 푸시 알림을 생략합니다.");
      firstCheckDone = true; // 첫 체크 완료 상태로 변경
      return;
    }

    // 비가 안오다가 오기 시작한 경우 알림 전송
    // if (!wasRainy && isRainy) {
    //   self.registration.showNotification("비가 시작되었습니다", {
    //     body: "현재 주차 위치를 확인하세요.",
    //     icon: "/assets/icons/rain-alert-icon.png",
    //   });
    // }

    // 위험도 레벨이 0보다 클 경우에만 푸시 알림 전송
    if (floodRiskLevel > 0) {
      self.registration.showNotification("침수 위험 경고", {
        body: alertMessage.replace(/<[^>]+>/g, ""), // HTML 태그 제거
        icon: "/assets/icons/default-icon.png", // 기본 아이콘
      });
    }
  }
});
