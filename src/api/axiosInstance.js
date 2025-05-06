import axios from 'axios';

// API 요청을 위한 Axios 인스턴스 생성
const api = axios.create({
    baseURL: import.meta.env.VITE_CORE_API_BASE_URL
});

// 토큰 갱신 중복 요청 방지를 위한 변수
let isRefreshing = false;
let refreshQueue = [];

// 요청 인터셉터 - 모든 요청에 액세스 토큰 추가
api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 응답 인터셉터 - 토큰 만료 처리
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 401 에러이고 재시도하지 않은 요청인 경우
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // 이미 토큰 갱신 중이면 대기열에 추가
                return new Promise((resolve, reject) => {
                    refreshQueue.push({ resolve, reject, originalRequest });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // 리프레시 토큰으로 새 액세스 토큰 요청
                const response = await axios.get(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/auth/refresh-token`, {
                    withCredentials: true
                });

                // 새 액세스 토큰 저장
                const newAccessToken = response.data.data.accessToken;
                localStorage.setItem('accessToken', newAccessToken);

                // 원래 요청에 data가 있었다면 그대로 유지
                if (originalRequest.data && typeof originalRequest.data === 'string') {
                    const parsedData = JSON.parse(originalRequest.data);

                    // 날짜 필드가 있는 경우 시간을 정오로 설정
                    if (parsedData.startTime) {
                        const startDate = new Date(parsedData.startTime);
                        startDate.setHours(12, 0, 0, 0);
                        parsedData.startTime = startDate.toISOString();
                    }

                    if (parsedData.endTime) {
                        const endDate = new Date(parsedData.endTime);
                        endDate.setHours(12, 0, 0, 0);
                        parsedData.endTime = endDate.toISOString();
                    }

                    originalRequest.data = parsedData;
                }

                // 대기 중인 요청 처리
                refreshQueue.forEach(({ resolve, originalRequest }) => {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    resolve(api(originalRequest));
                });
                refreshQueue = [];

                // 원래 요청 재시도
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (error) {
                // 리프레시 토큰도 만료된 경우 로그인 페이지로 리다이렉트
                window.location.href = `${import.meta.env.VITE_CORE_FRONT_BASE_URL}/`;
                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
