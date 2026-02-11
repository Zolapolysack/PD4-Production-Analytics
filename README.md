# PD4 Production Calculator

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-blue)](https://your-username.github.io/pd4-production-calculator/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-2.1.0-green)](https://github.com/your-username/pd4-production-calculator)

> ระบบคำนวณการผลิต PD4 - เครื่องมือครบวงจรสำหรับการวางแผนการผลิตและการจัดการต้นทุนแรงงาน

##  Features

###  **ระบบคำนวณการผลิต**
- คำนวณจำนวน Machine-Days (MD) 
- วิเคราะห์ชั่วโมง Overtime ที่จำเป็น
- เปรียบเทียบผลผลิตกับเป้าหมาย
- รองรับสถานการณ์พิเศษ (9A+4B, 9A+5B, 10A+4B, 10A+5B)

###  **ระบบคำนวณค่าแรงพนักงาน**
- คำนวณค่าแรงปกติรายเดือน
- คำนวณค่าแรง OT รายเดือน
- แสดงผลรวมค่าแรงทั้งหมด
- รองรับทศนิยมสำหรับความแม่นยำ

###  **การวิเคราะห์ผลลัพธ์**
- การวิเคราะห์เปรียบเทียบ
- คำแนะนำการตัดสินใจ
- การแสดงผลแบบ Real-time

##  Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with CSS Grid and Flexbox
- **Icons**: Font Awesome 6.4.0
- **Fonts**: Kanit (Google Fonts)
- **Deployment**: GitHub Pages

##  Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers


1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/pd4-production-calculator.git
   cd pd4-production-calculator
   ```

2. **Start local server**
   ```bash
   # Using Python
   python -m http.server 8080
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8080
   ```

3. **Open in browser**
   ```
   http://localhost:8080
   ```

##  Usage Guide

### การคำนวณการผลิต

1. **กรอกข้อมูลพื้นฐาน**:
   - เป้าหมายการผลิต (ใบ/เดือน)
   - ประสิทธิภาพการผลิต (ใบ/นาที)
   - วันทำงาน (วัน/เดือน)
   - ชั่วโมงทำงานปกติ (ชม./วัน)

2. **กรอกข้อมูลเครื่องจักร**:
   - จำนวนเครื่องจักรกะ A
   - จำนวนเครื่องจักรกะ B
   - ชั่วโมง OT (ไม่บังคับ)

3. **ดูผลลัพธ์**:
   - ผลการคำนวณแบบละเอียด
   - การวิเคราะห์และคำแนะนำ

### การคำนวณค่าแรง

1. **ข้อมูลพนักงานปกติ**:
   - อัตราค่าแรงต่อวัน
   - จำนวนวันทำงาน
   - จำนวนพนักงาน

2. **ข้อมูลพนักงาน OT**:
   - อัตราค่าแรง OT ต่อวัน
   - จำนวนวันทำ OT
   - จำนวนพนักงาน OT

##  Project Structure

```
pd4-production-calculator/
├── index.html              # Main HTML file
├── assets/
│   ├── css/
│   │   └── styles.css      # Main stylesheet
│   ├── js/
│   │   └── script.js       # Main JavaScript
│   └── images/
│       └── favicon.ico     # Favicon
├── docs/                   # Documentation
├── README.md              # This file
├── LICENSE               # License file
└── .gitignore           # Git ignore rules
```






