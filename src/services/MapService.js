/* global kakao */

// 기존 마커 관리
let markers = [];

/**
 * 지도에 마커 추가
 * @param {Object} map - Kakao Map 인스턴스
 * @param {number} lat - 위도
 * @param {number} lng - 경도
 */

export function addMarker(map, lat, lng) {
  // 모든 기존 마커 삭제
  markers.forEach((marker) => marker.setMap(null));
  markers = [];

  // 새 마커 생성
  const markerImage = new kakao.maps.MarkerImage(
    "/images/front-car.png",
    new kakao.maps.Size(50, 50),
    { offset: new kakao.maps.Point(20, 20) }
  );

  const marker = new kakao.maps.Marker({
    position: new kakao.maps.LatLng(lat, lng),
    image: markerImage,
  });

  marker.setMap(map);
  markers.push(marker);
}

/**
 * 모든 마커 제거
 */
export function clearMarkers() {
  markers.forEach((marker) => marker.setMap(null));
  markers = [];
}
