import axios from "axios";

// 백엔드 API 엔드포인트 설정
const BASE_URL = "http://localhost:3000";

// 침수 유발 강우량 정보를 가져오는 함수
async function getFloodThresholds(lat, lon) {
  try {
    const response = await axios.post(`${BASE_URL}/api/getFloodThresholds`, {
      lat,
      lon,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching flood thresholds:",
      error.response?.data || error
    );
    return { depth_10: null, depth_20: null, depth_50: null };
  }
}

// 침수 이력 확인 함수
async function checkFloodHistory(lat, lon) {
  try {
    const response = await axios.post(`${BASE_URL}/api/checkFloodHistory`, {
      lat,
      lon,
    });
    return response.data.floodHistory;
  } catch (error) {
    console.error(
      "Error checking flood history:",
      error.response?.data || error
    );
    return false;
  }
}

// 위험 수준을 평가하는 함수
export async function assessRisk(currentRainfall, oneHourRainfall, lat, lon) {
  try {
    // 침수 유발 강우량 정보 가져오기
    const thresholds = await getFloodThresholds(lat, lon);
    const floodHistory = await checkFloodHistory(lat, lon);

    const { depth_10, depth_20, depth_50 } = thresholds;

    console.log(
      `Thresholds - Flood History: ${floodHistory}, 10cm: ${depth_10}, 20cm: ${depth_20}, 50cm: ${depth_50}`
    );

    // 기본값 설정
    let floodRiskLevel = 0; // 0: 안전, 1: 경고, 2: 위험, 3: 매우 위험
    let alertMessage = `침수 위험 레벨: <span style="color:deepskyblue;">안전</span>`;
    let riskIcon = "safe-icon.png";

    // 위험 수준 평가
    const dangerThreshold = floodHistory ? depth_10 : depth_20;

    if (currentRainfall >= depth_50 || oneHourRainfall >= depth_50) {
      floodRiskLevel = 3;
      alertMessage = `침수 위험 레벨: <span style="color:red;">매우 위험</span>`;
      riskIcon = "danger-icon.png";
    } else if (
      currentRainfall >= dangerThreshold ||
      oneHourRainfall >= dangerThreshold
    ) {
      floodRiskLevel = 2;
      alertMessage = `침수 위험 레벨: <span style="color:red;">위험</span>`;
      riskIcon = "danger-icon.png";
    } else if (
      currentRainfall >= dangerThreshold * 0.8 ||
      oneHourRainfall >= dangerThreshold * 0.8
    ) {
      floodRiskLevel = 1;
      alertMessage = `침수 위험 레벨: <span style="color:yellow;">경고</span>`;
      riskIcon = "warning-icon.png";
    }

    console.log(
      `[RiskAssessment] Risk Level: ${floodRiskLevel}, Message: ${alertMessage}`
    );
    return { floodRiskLevel, alertMessage, riskIcon };
  } catch (error) {
    console.error("Error assessing risk:", error);
    return {
      floodRiskLevel: 0,
      alertMessage: "위험도를 평가할 수 없습니다.",
      riskIcon: "safe-icon.png",
    };
  }
}
