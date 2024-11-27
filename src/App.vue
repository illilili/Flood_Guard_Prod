<template>
  <div id="app">
    <img
      src="@/assets/floodguard-logo.png"
      alt="Flood Guard Logo"
      class="logo"
    />

    <MapComponent :locationSelect="handleLocationSelect" />
    <div v-if="selectedLocation" class="location-info">
      <p>선택한 위치:</p>
      <p>위도: {{ selectedLocation.lat }}</p>
      <p>경도: {{ selectedLocation.lng }}</p>
      <p v-if="weatherData">현재 강수량: {{ weatherData.currentRain }} mm</p>
      <p v-if="weatherData">
        한 시간 뒤 강수량: {{ weatherData.oneHourRain }} mm
      </p>
      <p v-if="loading">정보를 가져오는 중...</p>
      <p v-if="error" class="error">{{ error }}</p>
    </div>

    <img
      src="@/assets/parking-register-icon.png"
      alt="주차 등록"
      @click="registerParking"
      style="
        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: 1000;
        width: 200px;
        height: 220px;
        cursor: pointer;
      "
    />

    <img
      src="@/assets/risk-check-icon.png"
      alt="위험도 확인"
      @click="checkRiskLevel"
      style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        width: 200px;
        height: 220px;
        cursor: pointer;
      "
    />

    <!-- 주차 위치 등록 완료 메시지 -->
    <div v-if="showParkingMessage" class="parking-message">
      <p>주차 위치 등록 완료</p>
    </div>

    <!-- 위험 아이콘 -->
    <div v-if="showRiskIcon" class="risk-icon">
      <img :src="riskIcon" alt="위험 아이콘" />
      <p class="risk-message" v-html="riskMessage"></p>
    </div>
  </div>
</template>

<script>
import MapComponent from "./components/MapComponent.vue";
import { getWeatherData } from "./services/WeatherService";
import { assessRisk } from "./services/RiskAssessmentService";
import { registerServiceWorker } from "./services/PushNotificationService";
import { getOrCreateUUID } from "@/utils/uuid";

export default {
  components: {
    MapComponent,
  },
  data() {
    return {
      userUUID: getOrCreateUUID(),
      selectedLocation: null,
      weatherData: null,
      loading: false,
      error: null,
      monitorInterval: null,
      riskIcon: null,
      showRiskIcon: false,
      showParkingMessage: false,
      riskMessage: "", // 위험 안내 메시지
    };
  },

  mounted() {
    // 서비스 워커 등록
    registerServiceWorker(
      "BOr1ZRzOF7UEGY4ylBTfjC6sCUBJuH71QVI_NB_OK3L4DfrHxI5pvbRVmRrcTm8W2s_V-nWxDyidcxEVlk_igwA"
    ).catch((error) => {
      console.error("Failed to register Service Worker:", error);
    });
  },

  methods: {
    handleLocationSelect(lat, lng) {
      this.selectedLocation = { lat, lng };
      console.log("Location selected:", this.selectedLocation);
    },

    async registerParking() {
      if (!this.selectedLocation) {
        alert("위치가 선택되지 않았습니다.");
        return;
      }

      try {
        const BASE_URL = "https://flood-guard-back.onrender.com";
        const response = await fetch(`${BASE_URL}/api/registerParking`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userUUID: this.userUUID,
            lat: this.selectedLocation.lat,
            lon: this.selectedLocation.lng,
          }),
        });

        if (!response.ok) {
          throw new Error("Parking location registration failed.");
        }

        // 주차 위치 등록 후 서비스 워커로 위치 전달
        if (
          "serviceWorker" in navigator &&
          navigator.serviceWorker.controller
        ) {
          navigator.serviceWorker.controller.postMessage({
            type: "register-parking-location",
            data: {
              lat: this.selectedLocation.lat,
              lon: this.selectedLocation.lng,
            },
          });
        }

        const parkingData = {
          ...this.selectedLocation,
          ...(await response.json()),
        };
        localStorage.setItem("parkingData", JSON.stringify(parkingData));
        console.log("Parking location registered:", parkingData);

        // 주차 완료 메시지
        this.showParkingMessage = true;
        setTimeout(() => {
          this.showParkingMessage = false;

          // 주차 메시지가 끝난 뒤 위험도 측정
          this.checkRiskLevel(true); // 첫 위험도 측정 시 UI 업데이트
        }, 2000);

        // 주기적 위험 확인
        this.startPeriodicRiskCheck();
      } catch (error) {
        console.error("Error registering parking location:", error);
        alert("주차 등록 중 오류가 발생했습니다.");
      }
    },

    startPeriodicRiskCheck() {
      // 1시간마다 위험도를 확인하는 작업을 setInterval로 설정
      if (this.monitorInterval) {
        clearInterval(this.monitorInterval);
      }

      this.monitorInterval = setInterval(() => {
        console.log("Periodic risk check triggered via setInterval.");
        this.checkRiskLevel(); // 위험도 측정 시 아이콘과 메시지 표시
      }, 60000); // 1시간 마다 측정
    },

    async checkRiskLevel() {
      const parkingData = JSON.parse(localStorage.getItem("parkingData"));
      if (!parkingData) {
        alert("주차 위치를 등록한 후에 위험도를 확인할 수 있습니다.");
        return;
      }

      const { lat, lng } = parkingData;

      try {
        // 날씨 데이터 가져오기
        const weatherData = await getWeatherData(lat, lng);
        // 위험도 평가
        const { floodRiskLevel, alertMessage, riskIcon } = await assessRisk(
          weatherData.currentRain,
          weatherData.oneHourRain,
          lat,
          lng
        );

        console.log(
          `Flood Risk Level: ${floodRiskLevel}, Message: ${alertMessage}`
        );

        // 위험도 메시지 출력
        this.riskMessage = alertMessage; // HTML 형태로 바인딩
        this.showRiskIcon = true; // 아이콘 표시
        this.riskIcon = require(`@/assets/${riskIcon}`);

        // 5초 후에 아이콘과 메시지를 숨김
        setTimeout(() => {
          this.showRiskIcon = false;
          this.riskMessage = ""; // 메시지 초기화
        }, 5000);

        // 서비스 워커로 위험도 정보 전달 (푸시 알림을 위한)
        if (
          "serviceWorker" in navigator &&
          navigator.serviceWorker.controller
        ) {
          navigator.serviceWorker.controller.postMessage({
            type: "risk-alert", // 푸시 알림을 위한 타입
            data: { floodRiskLevel, alertMessage }, // 위험도 정보
          });
        }
      } catch (error) {
        console.error("Error checking risk level:", error);
        alert("위험도 확인 중 오류가 발생했습니다.");
      }
    },

    updateRiskIcon(riskIcon) {
      this.riskIcon = require(`@/assets/${riskIcon}`);
      this.showRiskIcon = true;
      setTimeout(() => {
        this.showRiskIcon = false;
        this.riskMessage = ""; // 메시지 초기화
      }, 5000);
    },
  },

  beforeUnmount() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
  },
};
</script>

<style scoped>
/* 로고 스타일: 화면 왼쪽 상단에 고정 위치 */
.logo {
  position: fixed; /* 고정 위치 */
  top: 0px; /* 화면 상단에서 10px 떨어짐 */
  left: 5px; /* 화면 왼쪽에서 10px 떨어짐 */
  width: 150px; /* 로고 크기 조정 */
  height: auto;
  z-index: 1000; /* 다른 요소 위에 표시되도록 설정 */
}

.map {
  width: 100vw;
  height: 100vh;
}

.location-info {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background-color: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.parking-message {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* 정확히 중앙에 배치 */
  background-color: #333;
  color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  font-size: 15px;
}

/*
.risk-icon {
  position: fixed;
  top: 50%; 
  left: 50%; 
  transform: translate(-50%, -50%); 
  z-index: 1001; 
  width: 100px; 
  height: 100px;
}
*/

/* 아래 메시지 스타일은 비활성화되었습니다.
.risk-message {
  margin-top: 10px; 
  background-color: #333; 
  color: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  font-size: 16px;
  text-align: center;
}
*/

.risk-icon {
  position: fixed;
  top: 50%; /* 화면의 세로 중앙 */
  left: 50%; /* 화면의 가로 중앙 */
  transform: translate(-50%, -50%); /* 화면 중앙 정렬 */
  z-index: 1001; /* 다른 요소보다 위에 표시 */
  text-align: center;
}

.risk-icon img {
  width: 120px; /* 아이콘 크기 */
  height: 120px;
}

.risk-message {
  margin-top: 0px; /* 아이콘과 메시지 간격 */
  background-color: #333; /* 위험도에 따라 색상 변경 가능 */
  color: white; /* 텍스트 색상 */
  padding: 10px 20px;
  border-radius: 10px;
  /* box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);  그림자 효과 */
  font-size: 18px; /* 메시지 폰트 크기 */
  font-weight: bold; /* 텍스트 강조 */
  text-align: center;
  display: inline-block;
}

.error {
  color: red;
}

.app-header {
  width: 100%;
}
</style>
