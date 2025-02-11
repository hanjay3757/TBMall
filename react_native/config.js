import { Platform } from 'react-native';

// 서버 설정
const SERVER_IP = '192.168.0.148';
const SERVER_PORT = '8080';
const BASE_URL = `http://${SERVER_IP}:${SERVER_PORT}/mvc`;

export const SERVER_URL = BASE_URL;
export const API_BASE_URL = BASE_URL;
export const CLIENT_URL = `http://${SERVER_IP}:3000`; 