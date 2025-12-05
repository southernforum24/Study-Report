import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // โค้ดนี้ไม่จำเป็นต้องใช้แล้ว เพราะเราใช้ import.meta.env.VITE_PUBLIC_* แทน
    // const env = loadEnv(mode, '.', ''); 

    return {
        // 🛑 เพิ่ม base: '/' ที่นี่
        base: '/', 
        
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        plugins: [react()],
        
        // 🛑 ลบส่วน define ออก เพราะคุณได้แก้ไข geminiService.ts ให้ใช้ VITE_PUBLIC_* แล้ว
        /* define: {
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },
        */
        
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            }
        }
    };
});