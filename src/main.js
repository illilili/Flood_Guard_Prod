import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#app");

// Service Worker 등록
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then(async (registration) => {
      console.log("Service Worker registered:", registration);

      // Periodic Sync 등록 (지원되는 경우)
      if ("periodicSync" in registration) {
        try {
          const status = await navigator.permissions.query({
            name: "periodic-background-sync",
          });

          if (status.state === "granted") {
            await registration.periodicSync.register("risk-alert", {
              minInterval: 60 * 60 * 1000, // 1시간
            });
            console.log("Periodic sync registered.");
          } else {
            console.warn("Permission for periodic sync denied.");
            // 대체 로직 추가: fallback
          }
        } catch (error) {
          console.error("Error during periodic sync registration:", error);
        }
      } else {
        console.warn("Periodic Sync not supported in this browser.");
      }
    })
    .catch((error) => {
      console.error("Service Worker registration failed:", error);
    });
}

// Notification 권한 요청
if ("Notification" in window) {
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      console.log("Notification permission granted.");
    } else {
      console.warn("Notification permission denied.");
    }
  });
}
