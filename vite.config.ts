import path from 'path';
import { defineConfig } from 'vite'; // 🛑 ลบ loadEnv ออก เพราะไม่ได้ใช้แล้ว
import react from '@vitejs/plugin-react';

// 🛑 เปลี่ยนจาก defineConfig(({ mode }) => { ... }) ให้เป็นรูปแบบ Object ธรรมดา
export default defineConfig({
    // 1. ✅ แก้ไขปัญหา Vercel Asset Loading
    base: '/', 
    
    server: {
        port: 3000,
        host: '0.0.0.0',
    },
    
    plugins: [react()],
    
    // 2. ✅ แก้ไขปัญหา Performance Warning (Build Chunks)
    build: {
        // เพิ่มส่วนนี้เพื่อปิดคำเตือนไฟล์ขนาดใหญ่ (ตั้งเป็น 1000 kB)
        chunkSizeWarningLimit: 1000, 
        rollupOptions: {
            output: {
                // แบ่ง Library ขนาดใหญ่ (recharts, pdf) ออกเป็นไฟล์แยก
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('recharts') || id.includes('html2canvas') || id.includes('jspdf')) {
                            return 'vendor-charts-pdf';
                        }
                        return 'vendor';
                    }
                },
            },
        },
    },
    
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '.'),
        }
    }
});