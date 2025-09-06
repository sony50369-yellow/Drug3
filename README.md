# IV Drug Reference (GitHub Pages-ready)

- Static single-page app
- ใช้ไฟล์ `drugs.json` (จากชุดข้อมูลที่ส่งมา) ที่รากโปรเจ็กต์
- Typeahead/Autocomplete พร้อม **ไฮไลต์สีเหลือง**ตามตัวอักษรที่พิมพ์
- การ์ดอยู่กึ่งกลางหน้า, โทนพาสเทล
- แสดง **รหัสยา (code)** ใต้ชื่อยา
- แสดง **วิธีใช้ (IM/IV direct/IV infusion)** เป็น badge ✓ ✕ — และขึ้น **คำแนะนำ** เฉพาะ route ที่มีข้อมูลจริง
- ยูทิลิตี้ **ตรวจความเข้มข้น (mg/mL)** ที่เล็กกระทัดรัด พร้อมบอกผ่าน/ไม่ผ่านถ้ามีเกณฑ์ min/max

## Deploy
อัปโหลดทั้งโฟลเดอร์ไปที่ GitHub → Settings → Pages → Deploy from branch (root).

