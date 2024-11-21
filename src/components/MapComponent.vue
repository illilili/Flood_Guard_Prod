<template>
  <div id="map" class="map"></div>
</template>

<script>
import { addMarker } from "@/services/MapService.js"; // 대소문자 정확히 맞추기

/* global kakao */
export default {
  name: "MapComponent",
  props: {
    locationSelect: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      map: null,
    };
  },
  mounted() {
    // 현재 위치 설정 및 지도 생성
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      const mapContainer = document.getElementById("map");
      const mapOption = {
        center: new kakao.maps.LatLng(lat, lng), // 현재 위치로 설정
        level: 3, // 확대 수준
      };

      this.map = new kakao.maps.Map(mapContainer, mapOption);

      // 지도 클릭 이벤트
      kakao.maps.event.addListener(this.map, "click", (mouseEvent) => {
        const latlng = mouseEvent.latLng;
        const lat = latlng.getLat();
        const lng = latlng.getLng();

        this.locationSelect(lat, lng); // 부모 컴포넌트로 위치 전송
        addMarker(this.map, lat, lng); // 마커 추가
      });
    });
  },
};
</script>

<style scoped>
#map {
  width: 100vw;
  height: 100vh;
}
</style>
