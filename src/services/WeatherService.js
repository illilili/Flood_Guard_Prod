// import axios from "axios";

// const API_KEY =
//   "3U2Vinr+RnlR6KVJFlE5duBEM1IWvJIE+4Px6aUXNdGJNoxSv14X+Rrw5MBq4/8EKqLhR1IT9PYrppCdeCsz/Q==";
// const API_URL =
//   "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst";

// // baseTime 계산 함수
// function getClosestBaseTime() {
//   const now = new Date();
//   const hours = now.getHours();
//   const baseTimes = [
//     "0200",
//     "0500",
//     "0800",
//     "1100",
//     "1400",
//     "1700",
//     "2000",
//     "2300",
//   ];
//   let closestBaseTime = baseTimes[0];

//   for (let i = 0; i < baseTimes.length; i++) {
//     const baseHour = parseInt(baseTimes[i].substring(0, 2), 10);
//     if (hours >= baseHour) {
//       closestBaseTime = baseTimes[i];
//     }
//   }
//   return closestBaseTime;
// }

// // 오늘 날짜 구하는 함수
// function getTodayDate() {
//   const today = new Date();
//   const year = today.getFullYear();
//   const month = ("0" + (today.getMonth() + 1)).slice(-2);
//   const day = ("0" + today.getDate()).slice(-2);
//   return `${year}${month}${day}`;
// }

// // 날씨 데이터를 가져오는 함수
// export const getWeatherData = async (latitude, longitude) => {
//   try {
//     const nx = convertToGridX(latitude);
//     const ny = convertToGridY(longitude);
//     const baseDate = getTodayDate();
//     const baseTime = getClosestBaseTime();

//     console.log(
//       `Requesting data with baseDate: ${baseDate} and baseTime: ${baseTime}`
//     );

//     const response = await axios.get(API_URL, {
//       params: {
//         serviceKey: API_KEY,
//         numOfRows: 100,
//         pageNo: 1,
//         base_date: baseDate,
//         base_time: baseTime,
//         nx,
//         ny,
//         dataType: "JSON",
//       },
//     });

//     const responseData = response.data;
//     console.log("API Response Status:", response.status);

//     if (
//       !responseData ||
//       !responseData.response ||
//       !responseData.response.body
//     ) {
//       console.error("API 응답 오류:", responseData);
//       return { currentRain: "N/A", oneHourRain: "N/A" };
//     }

//     const weatherItems = responseData.response.body.items.item;

//     // 현재 시간에 맞는 fcstTime을 계산
//     const now = new Date();
//     const currentTime = now.getHours() * 100;
//     const currentTimeStr = String(currentTime).padStart(4, "0");
//     const oneHourLaterStr = String(currentTime + 100).padStart(4, "0");

//     console.log(
//       `현재 fcstTime: ${currentTimeStr}, 한 시간 후 fcstTime: ${oneHourLaterStr}`
//     );

//     // 강수량 정보 추출 (현재 시각과 한 시간 뒤)
//     const currentRain =
//       weatherItems.find(
//         (item) => item.fcstTime === baseTime && item.category === "PCP"
//       )?.fcstValue || "강수없음";
//     const oneHourRain =
//       weatherItems.find(
//         (item) =>
//           item.fcstTime === String(Number(baseTime) + 100) &&
//           item.category === "PCP"
//       )?.fcstValue || "강수없음";

//     console.log(
//       `Extracted Rainfall Data: currentRain=${currentRain}, oneHourRain=${oneHourRain}`
//     );

//     console.log("Raw API Response:", responseData);

//     return {
//       currentRain,
//       oneHourRain,
//     };
//   } catch (error) {
//     console.error("Error fetching weather data:", error);
//     return { currentRain: "N/A", oneHourRain: "N/A" };
//   }
// };

// // 좌표 변환 함수
// function convertToGridX(lat) {
//   return Math.round((lat - 30.0) * 24.0);
// }

// function convertToGridY(lon) {
//   return Math.round((lon - 126.0) * 24.0);
// }

// 테스트용
// 날씨 데이터를 가져오는 함수
export const getWeatherData = async () => {
  try {
    const testCurrentRain = "300"; // 현재 강수량 (예: 10mm)
    const testOneHourRain = "300"; // 1시간 후 예상 강수량 (예: 20mm)

    console.log(
      `Returning test data: currentRain=${testCurrentRain}, oneHourRain=${testOneHourRain}`
    );

    return {
      currentRain: testCurrentRain,
      oneHourRain: testOneHourRain,
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return { currentRain: "N/A", oneHourRain: "N/A" };
  }
};
