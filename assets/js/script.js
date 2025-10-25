// PD4 Production Calculator
class PD4Calculator {
    constructor() {
        this.target = 2500000; // Default target
        this.initializeEventListeners();
        // Reset form to default values on page load
        this.resetForm();
    }

    initializeEventListeners() {
        const calculateBtn = document.getElementById('calculateBtn');
        const form = document.getElementById('calculatorForm');
        
        calculateBtn.addEventListener('click', () => this.calculate());
        
        // Wage calculator event listener
        const calculateWageBtn = document.getElementById('calculateWageBtn');
        if (calculateWageBtn) {
            calculateWageBtn.addEventListener('click', () => this.calculateWage());
        }
        
        // Add thousands separator for target production field
        const targetProductionInput = document.getElementById('targetProduction');
        targetProductionInput.addEventListener('input', (e) => {
            this.formatNumberInput(e.target);
            this.validateInput(e.target);
        });
        
        // Add input event listeners for real-time validation
        const inputs = form.querySelectorAll('input[type="number"]:not(#targetProduction)');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.validateInput(input));
        });

        // Add event listeners for machines count to update title
        const machinesAInput = document.getElementById('machinesA');
        const machinesBInput = document.getElementById('machinesB');
        
        machinesAInput.addEventListener('input', () => {
            this.validateInput(machinesAInput);
            this.updateRegularProductionTitle();
        });
        
        machinesBInput.addEventListener('input', () => {
            this.validateInput(machinesBInput);
            this.updateRegularProductionTitle();
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    formatNumberInput(input) {
        // Remove any non-digit characters except decimal point
        let value = input.value.replace(/[^\d]/g, '');
        
        // Format with thousands separator
        if (value) {
            const formattedValue = parseInt(value).toLocaleString('en-US');
            input.value = formattedValue;
        }
    }

    updateRegularProductionTitle() {
        // ฟังก์ชันนี้ไม่ใช้แล้ว เนื่องจากข้อความจะแสดงในส่วนสรุปข้อมูลการผลิตแทน
        // เก็บไว้เพื่อป้องกันไม่ให้เกิด error จาก event listeners
    }

    resetForm() {
        // Reset all form inputs to empty values - ล้างข้อมูลทั้งหมด
        document.getElementById('targetProduction').value = '';
        document.getElementById('productivity').value = '';
        document.getElementById('workingDays').value = '';
        document.getElementById('workingHours').value = '';
        document.getElementById('otHours').value = '';
        document.getElementById('machinesA').value = '';
        document.getElementById('machinesB').value = '';
        
        // Reset wage calculator form if it exists
        const wageForm = document.getElementById('wageCalculatorForm');
        if (wageForm) {
            document.getElementById('regularWageRate').value = '';
            document.getElementById('regularWorkingDays').value = '';
            document.getElementById('regularEmployees').value = '';
            document.getElementById('otWageRate').value = '';
            document.getElementById('otWorkingDays').value = '';
            document.getElementById('otEmployees').value = '';
        }
        
        // Clear results
        document.getElementById('results').innerHTML = `
            <div class="no-results">
                <i class="fas fa-info-circle"></i>
                <p>กรุณากรอกข้อมูลและกดคำนวณเพื่อดูผลลัพธ์</p>
            </div>
        `;
        
        // Clear analysis
        document.getElementById('analysisResults').innerHTML = `
            <div class="analysis-placeholder">
                <i class="fas fa-chart-pie"></i>
                <p>ข้อมูลการวิเคราะห์จะปรากฏหลังจากคำนวณแล้ว</p>
            </div>
        `;
        
        // Clear wage results if exists
        const wageResults = document.getElementById('wageResults');
        if (wageResults) {
            wageResults.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-info-circle"></i>
                    <p>กรุณากรอกข้อมูลและกดคำนวณเพื่อดูผลลัพธ์ค่าแรง</p>
                </div>
            `;
        }
        
        // Update title
        this.updateRegularProductionTitle();
    }

    validateInput(input) {
        const value = parseFloat(input.value);
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);

        input.classList.remove('error');
        
        if (isNaN(value) || value < min || value > max) {
            input.classList.add('error');
        }
    }

    getInputValues() {
        const otHoursInput = document.getElementById('otHours').value;
        const otHours = otHoursInput === '' || otHoursInput === null ? 0 : parseFloat(otHoursInput);
        
        // Remove commas from target production before parsing
        const targetProductionValue = document.getElementById('targetProduction').value.replace(/,/g, '');
        
        return {
            targetProduction: parseFloat(targetProductionValue),
            productivity: parseFloat(document.getElementById('productivity').value),
            workingDays: parseInt(document.getElementById('workingDays').value),
            workingHours: parseFloat(document.getElementById('workingHours').value),
            otHours: otHours,
            machinesA: parseFloat(document.getElementById('machinesA').value),
            machinesB: parseFloat(document.getElementById('machinesB').value)
        };
    }

    calculateRegularProduction(data) {
        const mdA = data.workingDays * data.machinesA;
        const mdB = data.workingDays * data.machinesB;
        const mdTotal = mdA + mdB;
        const minutes = mdTotal * data.workingHours * 60;
        const output = minutes * data.productivity;
        const outputPerDay = output / data.workingDays;

        return {
            mdA,
            mdB,
            mdTotal,
            minutes,
            output,
            totalOutput: output, // เพิ่มสำหรับความชัดเจน
            outputPerDay,
            percent: (output / data.targetProduction) * 100
        };
    }

    calculateOT(data, regular, machines) {
        // If already reaching target, no OT needed
        if (regular.output >= data.targetProduction) {
            return {
                needed: false,
                days: 0,
                md: 0,
                minutes: 0,
                output: 0,
                totalOutput: regular.output,
                percent: regular.percent,
                reason: 'target_reached'
            };
        }

        // If OT hours is 0 or not provided, cannot do OT
        if (data.otHours === 0 || isNaN(data.otHours)) {
            return {
                needed: true,
                days: 0,
                md: 0,
                minutes: 0,
                output: 0,
                totalOutput: regular.output,
                percent: regular.percent,
                reason: 'no_ot_hours',
                gap: data.targetProduction - regular.output
            };
        }

        const gap = data.targetProduction - regular.output;
        const otOutputPerDay = machines * data.otHours * 60 * data.productivity;
        
        // If OT output per day is 0, cannot reach target with OT
        if (otOutputPerDay === 0) {
            return {
                needed: true,
                days: 0,
                md: 0,
                minutes: 0,
                output: 0,
                totalOutput: regular.output,
                percent: regular.percent,
                reason: 'no_ot_capacity',
                gap: gap
            };
        }
        
        const otDaysExact = gap / otOutputPerDay;
        const otDays = Math.max(1, Math.ceil(otDaysExact * 10) / 10); // Round up to 1 decimal
        
        const md = otDays * machines;
        const minutes = md * data.otHours * 60;
        const output = minutes * data.productivity;
        const totalOutput = regular.output + output;

        return {
            needed: true,
            days: otDays,
            md,
            minutes,
            output,
            outputGain: output, // ผลผลิตที่เพิ่มจาก OT
            totalOutput,
            percent: (totalOutput / data.targetProduction) * 100,
            gap,
            otOutputPerDay,
            reason: 'calculated'
        };
    }

    isSpecialConfiguration(machinesA, machinesB) {
        // ตรวจสอบว่าตรงกับเงื่อนไขพิเศษหรือไม่
        // แปลงค่าเป็น number เพื่อป้องกันปัญหาการเปรียบเทียบ string vs number
        const numA = Number(machinesA);
        const numB = Number(machinesB);
        
        const specialConfigs = [
            { a: 9, b: 4 },   // รวม 13
            { a: 9, b: 5 },   // รวม 14
            { a: 10, b: 4 },  // รวม 14
            { a: 10, b: 5 }   // รวม 15
        ];
        
        const isSpecial = specialConfigs.some(config => 
            config.a === numA && config.b === numB
        );
        
        console.log('Checking special config:', { machinesA: numA, machinesB: numB, isSpecial });
        return isSpecial;
    }

    calculateSpecialOTScenarios(data, regular) {
        // สร้าง OT scenarios พิเศษตามเงื่อนไข
        // ใช้ otHours เริ่มต้น 3 ชั่วโมง หากไม่ได้กรอก
        const otHours = data.otHours || 3;
        const modifiedData = { ...data, otHours };
        
        const scenarios = [];
        
        // OT1: 9A + 4B (13 เครื่อง)
        const ot1 = this.calculateOT(modifiedData, regular, 9 + 4);
        scenarios.push({
            name: 'OT1 (9A + 4B)',
            description: 'เงื่อนไขการเปิดเครื่องจักร กะ A 9 เครื่อง กะ B 4 เครื่อง',
            ...ot1
        });
        
        // OT2: 9A + 5B (14 เครื่อง)
        const ot2 = this.calculateOT(modifiedData, regular, 9 + 5);
        scenarios.push({
            name: 'OT2 (9A + 5B)',
            description: 'เงื่อนไขการเปิดเครื่องจักร กะ A 9 เครื่อง กะ B 5 เครื่อง',
            ...ot2
        });
        
        // OT3: 10A + 4B (14 เครื่อง)
        const ot3 = this.calculateOT(modifiedData, regular, 10 + 4);
        scenarios.push({
            name: 'OT3 (10A + 4B)',
            description: 'เงื่อนไขการเปิดเครื่องจักร กะ A 10 เครื่อง กะ B 4 เครื่อง',
            ...ot3
        });
        
        // OT4: 10A + 5B (15 เครื่อง)
        const ot4 = this.calculateOT(modifiedData, regular, 10 + 5);
        scenarios.push({
            name: 'OT4 (10A + 5B)',
            description: 'เงื่อนไขการเปิดเครื่องจักร กะ A 10 เครื่อง กะ B 5 เครื่อง',
            ...ot4
        });
        
        return scenarios;
    }

    calculate() {
        const btn = document.getElementById('calculateBtn');
        const originalText = btn.innerHTML;
        
        // Show loading state
        btn.innerHTML = '<div class="loading"></div> กำลังคำนวณ...';
        btn.disabled = true;

        setTimeout(() => {
            try {
                const data = this.getInputValues();
                
                // Validate inputs
                if (!this.validateInputs(data)) {
                    return; // validateInputs จะแสดง error message เองแล้ว
                }

                // Calculate regular production
                const regular = this.calculateRegularProduction(data);

                // ตรวจสอบว่าเป็นเงื่อนไขพิเศษหรือไม่
                const isSpecial = this.isSpecialConfiguration(data.machinesA, data.machinesB);
                console.log('Is special configuration:', isSpecial);
                
                if (isSpecial) {
                    console.log('Using special scenarios');
                    // แสดง OT scenarios พิเศษ
                    const specialScenarios = this.calculateSpecialOTScenarios(data, regular);
                    console.log('Special scenarios:', specialScenarios);
                    
                    // แสดงผลปกติโดยไม่มี OT cards
                    this.displayResultsSpecial(data, regular);
                    this.displaySpecialAnalysis(data, regular, specialScenarios);
                } else {
                    console.log('Using regular scenarios');
                    // Calculate OT scenarios แบบปกติ
                    const ot1 = this.calculateOT(data, regular, 7 + 4); // 7A + 4B = 11 machines
                    const ot2 = this.calculateOT(data, regular, 8 + 4); // 8A + 4B = 12 machines

                    // Display results
                    this.displayResults(data, regular, ot1, ot2);
                    this.displayAnalysis(data, regular, ot1, ot2);
                }

            } catch (error) {
                console.error('Calculation error:', error);
                this.showError('เกิดข้อผิดพลาดในการคำนวณ');
            } finally {
                // Reset button
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }, 1000);
    }

    validateInputs(data) {
        // Required inputs (cannot be zero or empty)
        const requiredInputs = [
            { value: data.targetProduction, name: 'เป้าหมายการผลิต' },
            { value: data.productivity, name: 'ประสิทธิภาพการผลิต' },
            { value: data.workingDays, name: 'วันทำงาน' },
            { value: data.workingHours, name: 'ชั่วโมงทำงานปกติ' },
            { value: data.machinesA, name: 'เครื่องจักรกะ A' },
            { value: data.machinesB, name: 'เครื่องจักรกะ B' }
        ];
        
        // Check for empty or invalid required fields
        const emptyFields = requiredInputs.filter(input => 
            isNaN(input.value) || input.value <= 0
        );
        
        if (emptyFields.length > 0) {
            const fieldNames = emptyFields.map(field => field.name).join(', ');
            this.showError(`กรุณากรอกข้อมูล: ${fieldNames}`);
            return false;
        }
        
        // OT hours validation - allow 0 or positive numbers, but not negative
        const otHoursValid = isNaN(data.otHours) || data.otHours >= 0;
        
        if (!otHoursValid) {
            this.showError('ชั่วโมง OT ต้องเป็นตัวเลขที่ไม่ติดลบ');
            return false;
        }
        
        return true;
    }

    showError(message) {
        const resultsContainer = document.getElementById('results');
        resultsContainer.innerHTML = `
            <div class="result-card error">
                <div class="result-header">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h4>ข้อผิดพลาด</h4>
                </div>
                <p>${message}</p>
            </div>
        `;
    }

    displayResults(data, regular, ot1, ot2) {
        const resultsContainer = document.getElementById('results');
        const isTargetReached = regular.output >= data.targetProduction;

        resultsContainer.innerHTML = `
            <div class="results-grid">
                <!-- Regular Production -->
                <div class="result-card ${isTargetReached ? 'success' : 'warning'}">
                    <div class="result-header">
                        <i class="fas fa-industry"></i>
                        <h4 class="regular-production-title">การผลิตที่ชั่วโมงการทำงานปกติ</h4>
                    </div>
                    <div class="result-value">${this.formatNumber(regular.output)}</div>
                    <div class="result-description">ใบ/เดือน (${regular.percent.toFixed(1)}% เปอร์เซ็นต์เทียบกับเป้าหมาย)</div>
                    <div style="margin-top : 1rem; font-size: 0.9rem; color: #6b7280;">
                        <div> MD รวม : ${regular.mdTotal.toFixed(1)}</div>
                        <div>จำนวนนาทีทำงาน : ${this.formatNumber(regular.minutes)}</div>
                        <div>ผลผลิต/วัน : ${this.formatNumber(regular.outputPerDay)}</div>
                    </div>
                </div>

                <!-- Target Status -->
                <div class="result-card ${isTargetReached ? 'success' : 'error'}">
                    <div class="result-header">
                        <i class="fas fa-${isTargetReached ? 'check-circle' : 'times-circle'}"></i>
                        <h4>สถานะเป้าหมาย</h4>
                    </div>
                    <div class="result-value" style="color: ${isTargetReached ? '#10b981' : '#ef4444'}">
                        ${isTargetReached ? 'ถึงเป้า' : 'ไม่ถึงเป้า'}
                    </div>
                    <div class="result-description">
                        ${isTargetReached 
                            ? `เกินเป้า ${this.formatNumber(regular.output - data.targetProduction)} ใบ`
                            : `ขาดอีก ${this.formatNumber(data.targetProduction - regular.output)} ใบ`
                        }
                    </div>
                </div>
            </div>

            ${!isTargetReached ? this.renderOTCards(ot1, ot2, data.targetProduction) : ''}
        `;
    }

    displayResultsSpecial(data, regular) {
        const resultsContainer = document.getElementById('results');
        const isTargetReached = regular.output >= data.targetProduction;

        resultsContainer.innerHTML = `
            <div class="results-grid">
                <!-- Regular Production -->
                <div class="result-card ${isTargetReached ? 'success' : 'warning'}">
                    <div class="result-header">
                        <i class="fas fa-industry"></i>
                        <h4 class="regular-production-title">การผลิตที่ชั่วโมงการทำงานปกติ</h4>
                    </div>
                    <div class="result-value">${this.formatNumber(regular.output)}</div>
                    <div class="result-description">ใบ/เดือน (${regular.percent.toFixed(1)}% เปอร์เซ็นต์เทียบกับเป้าหมาย)</div>
                    <div style="margin-top : 1rem; font-size: 0.9rem; color: #6b7280;">
                        <div> MD รวม : ${regular.mdTotal.toFixed(1)}</div>
                        <div>จำนวนนาทีทำงาน : ${this.formatNumber(regular.minutes)}</div>
                        <div>ผลผลิต/วัน : ${this.formatNumber(regular.outputPerDay)}</div>
                    </div>
                </div>

                <!-- Target Status -->
                <div class="result-card ${isTargetReached ? 'success' : 'error'}">
                    <div class="result-header">
                        <i class="fas fa-${isTargetReached ? 'check-circle' : 'times-circle'}"></i>
                        <h4>สถานะเป้าหมาย</h4>
                    </div>
                    <div class="result-value" style="color: ${isTargetReached ? '#10b981' : '#ef4444'}">
                        ${isTargetReached ? 'ถึงเป้า' : 'ไม่ถึงเป้า'}
                    </div>
                    <div class="result-description">
                        ${isTargetReached 
                            ? `เกินเป้า ${this.formatNumber(regular.output - data.targetProduction)} ใบ`
                            : `ขาดอีก ${this.formatNumber(data.targetProduction - regular.output)} ใบ`
                        }
                    </div>
                </div>
            </div>

            ${!isTargetReached ? '<div class="special-notice"><p> ตัวเลือก OT เงื่อนไขพิเศษจะแสดงในส่วนการวิเคราะห์ผลลัพธ์ด้านล่าง</p></div>' : ''}
        `;
    }

    renderOTCards(ot1, ot2, target) {
        // Check if OT calculations are possible
        const canCalculateOT = ot1.reason === 'calculated' || ot2.reason === 'calculated';
        
        if (!canCalculateOT) {
            let message = '';
            if (ot1.reason === 'no_ot_hours') {
                message = 'ไม่สามารถคำนวณ OT ได้เนื่องจากไม่ได้กรอกชั่วโมง OT';
            } else if (ot1.reason === 'no_ot_capacity') {
                message = 'ไม่สามารถคำนวณ OT ได้เนื่องจากไม่มีกำลังการผลิตใน OT';
            }
            
            return `
                <div class="ot-cards">
                    <div class="ot-card warning">
                        <div class="ot-header">
                            <i class="fas fa-exclamation-triangle"></i>
                            การคำนวณ OT
                        </div>
                        <div class="ot-details">
                            <p style="color: #f59e0b; margin: 1rem 0;">${message}</p>
                            <p style="font-size: 0.9rem; color: #6b7280;">
                                หากต้องการดู OT scenarios กรุณากรอกชั่วโมง OT ที่ต้องการ
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="ot-cards">
                <!-- OT Option 1 -->
                <div class="ot-card ot1">
                    <div class="ot-header">
                        <i class="fas fa-cog"></i>
                        OT1 : 7A + 4B (11 เครื่อง)
                    </div>
                    <div class="ot-details">
                        ${this.renderOTDetails(ot1)}
                    </div>
                </div>

                <!-- OT Option 2 -->
                <div class="ot-card ot2">
                    <div class="ot-header">
                        <i class="fas fa-cog"></i>
                        OT2 : 8A + 4B (12 เครื่อง)
                    </div>
                    <div class="ot-details">
                        ${this.renderOTDetails(ot2)}
                    </div>
                </div>
            </div>
        `;
    }

    renderOTDetails(ot) {
        if (ot.reason !== 'calculated') {
            return `
                <div class="ot-detail">
                    <span style="color: #f59e0b;">ไม่สามารถคำนวณได้</span>
                </div>
            `;
        }
        
        return `
            <div class="ot-detail">
                <span class="ot-detail-label">จำนวนวันที่ต้องทำ OT :</span>
                <span class="ot-detail-value">${ot.days} วัน</span>
            </div>
            <div class="ot-detail">
                <span class="ot-detail-label">MD สำหรับ OT :</span>
                <span class="ot-detail-value">${ot.md.toFixed(1)}</span>
            </div>
            <div class="ot-detail">
                <span class="ot-detail-label">ผลผลิต OT :</span>
                <span class="ot-detail-value">${this.formatNumber(ot.output)}</span>
            </div>
            <div class="ot-detail">
                <span class="ot-detail-label">ผลผลิตรวม :</span>
                <span class="ot-detail-value">${this.formatNumber(ot.totalOutput)}</span>
            </div>
            <div class="ot-detail">
                <span class="ot-detail-label">% เทียบกับเป้าหมาย :</span>
                <span class="ot-detail-value" style="color : ${ot.percent >= 100 ? '#10b981' : '#ef4444'}">
                    ${ot.percent.toFixed(1)}%
                </span>
            </div>
        `;
    }

    displayAnalysis(data, regular, ot1, ot2) {
        const analysisContainer = document.getElementById('analysisResults');
        const isTargetReached = regular.output >= data.targetProduction;

        let recommendation = '';
        let analysisClass = '';

        if (isTargetReached) {
            recommendation = `
                <div class="analysis-card success">
                    <h4><i class="fas fa-trophy"></i> แนะนำ : ไม่ต้องทำ OT</h4>
                    <p>การผลิตปกติสามารถถึงเป้าหมายได้แล้ว โดยเกินเป้าหมายที่ตั้งไว้ ${this.formatNumber(regular.output - data.targetProduction)} ใบ</p>
                    <p>สามารถลดชั่วโมงการทำงานหรือเครื่องจักรเพื่อประหยัดต้นทุนได้</p>
                </div>
            `;
            analysisClass = 'success';
        } else {
            const otComparison = this.compareOTOptions(ot1, ot2);
            recommendation = `
                <div class="analysis-card warning">
                    <h4><i class="fas fa-exclamation-triangle"></i> ต้องทำ OT เพื่อให้ถึงเป้า</h4>
                    <p>การผลิตด้วยชั่วโมงการทำงานปกติไม่ถึงเป้า ขาดอีก ${this.formatNumber(data.targetProduction - regular.output)} ใบ</p>
                </div>
                
                <div class="ot-comparison">
                    <h4><i class="fas fa-balance-scale"></i> เปรียบเทียบตัวเลือก OT</h4>
                    ${otComparison}
                </div>
            `;
            analysisClass = 'warning';
        }

        const efficiency = this.calculateEfficiency(data, regular);

        analysisContainer.innerHTML = `
            <div class="analysis-grid">
                ${recommendation}

                <div class="analysis-card info">
                    <h4><i class="fas fa-info-circle"></i> สรุปข้อมูลการผลิต</h4>
                    <div class="production-summary">
                        <div class="summary-section regular-section">
                            <h5>การผลิตที่ชั่วโมงการทำงานปกติ หากมีจำนวนเครื่องกะ A ${data.machinesA} เครื่อง กะ B ${data.machinesB} เครื่อง</h5>
                            <div class="summary-grid">
                                <div class="summary-item">
                                    <span>Machine-Days กะ A :</span> <span>${regular.mdA.toFixed(1)}</span>
                                </div>
                                <div class="summary-item">
                                    <span>Machine-Days กะ B :</span> <span>${regular.mdB.toFixed(1)}</span>
                                </div>
                                <div class="summary-item">
                                    <span>จำนวนนาทีที่ใช้ใน ชม.ทำงานปกติ :</span> <span>${this.formatNumber(regular.minutes)}</span>
                                </div>
                                <div class="summary-item">
                                    <span>ผลผลิตต่อวัน :</span> <span>${this.formatNumber(regular.outputPerDay)} ใบ</span>
                                </div>
                            </div>
                        </div>
                        
                        ${data.otHours > 0 ? this.generateOTSummary(data, ot1, ot2, regular) : ''}
                    </div>
                </div>
            </div>
        `;
    }

    displaySpecialAnalysis(data, regular, specialScenarios) {
        console.log('displaySpecialAnalysis called with:', { data, regular, specialScenarios });
        const analysisContainer = document.getElementById('analysisResults');
        const isTargetReached = regular.output >= data.targetProduction;

        let recommendation = '';
        if (isTargetReached) {
            recommendation = `
                <div class="analysis-card success">
                    <h4><i class="fas fa-check-circle"></i>สามารถทำได้โดยถึงเป้าหมายที่ตั้งไว้</h4>
                    <p>การผลิตด้วยชั่วโมงการทำงานปกติสามารถบรรลุเป้าหมายได้</p>
                </div>
            `;
        } else {
            // แสดงข้อมูลเปรียบเทียบ OT scenarios พิเศษ
            const validScenarios = specialScenarios.filter(s => s.reason === 'calculated');
            
            if (validScenarios.length > 0) {
                recommendation = `
                    <div class="analysis-card info">
                        <h4><i class="fas fa-chart-line"></i> เปรียบเทียบตัวเลือก OT พิเศษ</h4>
                        <div class="special-comparison-grid">
                            ${validScenarios.map(scenario => `
                                <div class="special-scenario-card ${scenario.percent >= 100 ? 'success' : 'warning'}">
                                    <h5>${scenario.name}</h5>
                                    <div class="scenario-details">
                                        <div>วัน OT: ${scenario.days} วัน</div>
                                        <div>MD: ${scenario.md.toFixed(1)}</div>
                                        <div>ผลลัพธ์: ${scenario.percent.toFixed(1)}%</div>
                                        <div class="scenario-status ${scenario.percent >= 100 ? 'success' : 'warning'}">
                                            ${scenario.percent >= 100 ? 'ถึงเป้า' : 'ไม่ถึงเป้า'}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        }

        analysisContainer.innerHTML = `
            <div class="analysis-grid">
                ${recommendation}

                <div class="analysis-card info">
                    <h4><i class="fas fa-info-circle"></i> สรุปข้อมูลการผลิตเงื่อนไขพิเศษ</h4>
                    <div class="production-summary">
                        <div class="summary-section regular-section">
                            <h5>การผลิตที่ชั่วโมงการทำงานปกติ หากมีจำนวนเครื่องกะ A ${data.machinesA} เครื่อง กะ B ${data.machinesB} เครื่อง</h5>
                            <div class="summary-grid">
                                <div class="summary-item">
                                    <span>Machine-Days กะ A :</span> <span>${regular.mdA.toFixed(1)}</span>
                                </div>
                                <div class="summary-item">
                                    <span>Machine-Days กะ B :</span> <span>${regular.mdB.toFixed(1)}</span>
                                </div>
                                <div class="summary-item">
                                    <span>จำนวนนาทีที่ใช้ใน ชม.ทำงานปกติ :</span> <span>${this.formatNumber(regular.minutes)}</span>
                                </div>
                                <div class="summary-item">
                                    <span>ผลผลิตต่อวัน :</span> <span>${this.formatNumber(regular.outputPerDay)} ใบ</span>
                                </div>
                            </div>
                        </div>
                        
                        ${!isTargetReached ? this.generateSpecialOTSummary(data, specialScenarios, regular) : ''}
                    </div>
                </div>
            </div>
        `;
    }

    generateSpecialOTSummary(data, specialScenarios, regular) {
        let otSummaryHTML = '';
        
        specialScenarios.forEach((scenario, index) => {
            if (scenario.reason === 'calculated') {
                const totalOutput = regular.totalOutput + (scenario.outputGain || 0);
                const otOutputPerDay = (scenario.outputGain || 0) / scenario.days;
                const avgOutputPerDay = totalOutput / data.workingDays;
                
                otSummaryHTML += `
                    <div class="summary-section ot-section">
                        <h5>${scenario.name} ${scenario.description}</h5>
                        <div class="summary-grid">
                            <div class="summary-item">
                                <span>จำนวนวันที่ต้องทำ OT :</span> <span>${scenario.days} วัน</span>
                            </div>
                            <div class="summary-item">
                                <span>MD รวม ( วันทำงาน * เครื่องจักรที่เปิดใช้ในกะ A และ B ) OT :</span> <span>${scenario.md.toFixed(1)}</span>
                            </div>
                            <div class="summary-item">
                                <span>ผลผลิตเพิ่มเติมจากโอที (OT) :</span> <span>${this.formatNumber(scenario.outputGain || 0)} ใบ</span>
                            </div>
                            <div class="summary-item">
                                <span>ผลผลิต OT/วัน :</span> <span>${this.formatNumber(otOutputPerDay)} ใบ/วัน</span>
                            </div>
                            <div class="summary-item total">
                                <span>ผลผลิตรวม (ชม.ทำงานปกติ + OT) :</span> <span>${this.formatNumber(totalOutput)} ใบ</span>
                            </div>
                            <div class="summary-item">
                                <span>เฉลี่ยผลผลิต/วัน (รายเดือน) รวมชั่วโมงการทำงานปกติและ OT :</span> <span>${this.formatNumber(avgOutputPerDay)} ใบ/วัน</span>
                            </div>
                            <div class="summary-item">
                                <span>% เทียบกับเป้าหมาย :</span> <span style="color: ${scenario.percent >= 100 ? '#10b981' : '#ef4444'}">${scenario.percent.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                `;
            }
        });
        
        return otSummaryHTML;
    }

    compareOTOptions(ot1, ot2) {
        // Check if both OT options can be calculated
        const ot1Calculated = ot1.reason === 'calculated';
        const ot2Calculated = ot2.reason === 'calculated';
        
        if (!ot1Calculated && !ot2Calculated) {
            return `
                <div class="comparison-cards">
                    <div class="comparison-card warning">
                        <h5><i class="fas fa-exclamation-triangle"></i> ไม่สามารถคำนวณ OT ได้</h5>
                        <div class="comparison-details">
                            <div>กรุณากรอกชั่วโมง OT เพื่อดูตัวเลือก OT</div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (!ot1Calculated || !ot2Calculated) {
            const validOT = ot1Calculated ? ot1 : ot2;
            const validName = ot1Calculated ? 'OT1 (7A+4B)' : 'OT2 (8A+4B)';
            
            return `
                <div class="comparison-cards">
                    <div class="comparison-card recommended">
                        <h5>${validName}</h5>
                        <div class="comparison-details">
                            <div>จำนวนวันที่ต้องทำ OT : ${validOT.days} วัน</div>
                            <div>MD : ${validOT.md.toFixed(1)}</div>
                            <div>ผลลัพธ์ : ${validOT.percent.toFixed(1)}%</div>
                        </div>
                    </div>
                </div>
                <div class="recommendation">
                    <strong><i class="fas fa-lightbulb"></i> แนะนำ :</strong> 
                    ${validName} เป็นตัวเลือกเดียวที่สามารถคำนวณได้
                </div>
            `;
        }
        
        // Both can be calculated - compare normally
        const better = ot1.days < ot2.days ? 'ot1' : 'ot2';
        const betterOption = better === 'ot1' ? ot1 : ot2;
        const betterName = better === 'ot1' ? 'OT1 (7A+4B)' : 'OT2 (8A+4B)';

        return `
            <div class="comparison-cards">
                <div class="comparison-card ${better === 'ot1' ? 'recommended' : ''}">
                    <h5>OT1 : 7A + 4B</h5>
                    <div class="comparison-details">
                        <div>จำนวนวันที่ต้องทำ OT : ${ot1.days} วัน</div>
                        <div>MD : ${ot1.md.toFixed(1)}</div>
                        <div>ผลลัพธ์ : ${ot1.percent.toFixed(1)}%</div>
                    </div>
                </div>
                <div class="comparison-card ${better === 'ot2' ? 'recommended' : ''}">
                    <h5>OT2 : 8A + 4B</h5>
                    <div class="comparison-details">
                        <div>จำนวนวันที่ต้องทำ OT : ${ot2.days} วัน</div>
                        <div>MD : ${ot2.md.toFixed(1)}</div>
                        <div>ผลลัพธ์ : ${ot2.percent.toFixed(1)}%</div>
                    </div>
                </div>
            </div>
            <div class="recommendation">
                <strong><i class="fas fa-lightbulb"></i> แนะนำ :</strong> 
                ${betterName} ใช้จำนวนวันที่ต้องทำ OT น้อยกว่า (${betterOption.days} วัน) 
                และมีประสิทธิภาพดีกว่า
            </div>
        `;
    }

    calculateEfficiency(data, regular) {
        return {
            overall: regular.output / regular.mdTotal,
            machineUtilization: (regular.percent / 100) * 100,
            mdPerUnit: regular.mdTotal / regular.output
        };
    }

    formatNumber(num) {
        return new Intl.NumberFormat('th-TH').format(Math.round(num));
    }

    generateOTSummary(data, ot1, ot2, regular) {
        const ot1Calculated = ot1.reason === 'calculated';
        const ot2Calculated = ot2.reason === 'calculated';
        
        let otSummaryHTML = '';
        
        // OT1 Details
        if (ot1Calculated) {
            const totalOutputOT1 = regular.totalOutput + (ot1.outputGain || 0);
            const ot1OutputPerDay = (ot1.outputGain || 0) / ot1.days; // ผลผลิต OT ต่อวันที่ทำ OT
            
            // ผลผลิตรวมต่อวัน = (ผลผลิตปกติ + ผลผลิต OT) / วันทำงานทั้งหมด
            const totalDaysUsed = data.workingDays + ot1.days; // วันปกติ + วัน OT
            const avgOutputPerDay1 = totalOutputOT1 / data.workingDays; // เฉลี่ยต่อวันตามเป้าหมายรายเดือน
            
            otSummaryHTML += `
                <div class="summary-section ot-section">
                    <h5>OT1 (7A + 4B) เงื่อนไขการเปิดเครื่องจักร กะ A 7 เครื่อง กะ B 4 เครื่อง</h5>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <span>จำนวนวันที่ต้องทำ OT :</span> <span>${ot1.days} วัน</span>
                        </div>
                        <div class="summary-item">
                            <span>MD รวม ( วันทำงาน * เครื่องจักรที่เปิดใช้ในกะ A และ B ) OT :</span> <span>${ot1.md.toFixed(1)}</span>
                        </div>
                        <div class="summary-item">
                            <span>ผลผลิตเพิ่มเติมจากโอที (OT) :</span> <span>${this.formatNumber(ot1.outputGain || 0)} ใบ</span>
                        </div>
                        <div class="summary-item">
                            <span>ผลผลิต OT/วัน :</span> <span>${this.formatNumber(ot1OutputPerDay)} ใบ/วัน</span>
                        </div>
                        <div class="summary-item total">
                            <span>ผลผลิตรวม (ชม.ทำงานปกติ + OT) :</span> <span>${this.formatNumber(totalOutputOT1)} ใบ</span>
                        </div>
                        <div class="summary-item">
                            <span>เฉลี่ยผลผลิต/วัน (รายเดือน) รวมชั่วโมงการทำงานปกติและ OT :</span> <span>${this.formatNumber(avgOutputPerDay1)} ใบ/วัน</span>
                        </div>
                        <div class="summary-item">
                            <span>% เทียบกับเป้าหมาย :</span> <span style="color: ${ot1.percent >= 100 ? '#10b981' : '#ef4444'}">${ot1.percent.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // OT2 Details  
        if (ot2Calculated) {
            const totalOutputOT2 = regular.totalOutput + (ot2.outputGain || 0);
            const ot2OutputPerDay = (ot2.outputGain || 0) / ot2.days; // ผลผลิต OT ต่อวันที่ทำ OT
            
            // ผลผลิตรวมต่อวัน = (ผลผลิตปกติ + ผลผลิต OT) / วันทำงานทั้งหมด
            const totalDaysUsed = data.workingDays + ot2.days; // วันปกติ + วัน OT
            const avgOutputPerDay2 = totalOutputOT2 / data.workingDays; // เฉลี่ยต่อวันตามเป้าหมายรายเดือน
            
            otSummaryHTML += `
                <div class="summary-section ot-section">
                    <h5>OT2 (8A + 4B) เงื่อนไขการเปิดเครื่องจักร กะ A 8 เครื่อง กะ B 4 เครื่อง</h5>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <span>จำนวนวันที่ต้องทำ OT :</span> <span>${ot2.days} วัน</span>
                        </div>
                        <div class="summary-item">
                            <span>MD รวม ( วันทำงาน * เครื่องจักรที่เปิดใช้ในกะ A และ B ) OT :</span> <span>${ot2.md.toFixed(1)}</span>
                        </div>
                        <div class="summary-item">
                            <span>ผลผลิตเพิ่มเติมจากโอที (OT) :</span> <span>${this.formatNumber(ot2.outputGain || 0)} ใบ</span>
                        </div>
                        <div class="summary-item">
                            <span>ผลผลิต OT/วัน :</span> <span>${this.formatNumber(ot2OutputPerDay)} ใบ/วัน</span>
                        </div>
                        <div class="summary-item total">
                            <span>ผลผลิตรวม (ชม.ทำงานปกติ + OT) :</span> <span>${this.formatNumber(totalOutputOT2)} ใบ</span>
                        </div>
                        <div class="summary-item">
                            <span>เฉลี่ยผลผลิต/วัน (รายเดือน) รวมชั่วโมงการทำงานปกติและ OT :</span> <span>${this.formatNumber(avgOutputPerDay2)} ใบ/วัน</span>
                        </div>
                        <div class="summary-item">
                            <span>% เทียบกับเป้าหมาย :</span> <span style="color: ${ot2.percent >= 100 ? '#10b981' : '#ef4444'}">${ot2.percent.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        return otSummaryHTML;
    }

    // Wage Calculator Methods
    calculateWage() {
        try {
            const data = this.getWageInputData();
            const validation = this.validateWageInputs(data);
            
            if (!validation.isValid) {
                this.displayWageError(validation.errors);
                return;
            }

            const wageResults = this.performWageCalculation(data);
            this.displayWageResults(wageResults, data);
            
        } catch (error) {
            console.error('Error calculating wage:', error);
            this.displayWageError(['เกิดข้อผิดพลาดในการคำนวณ โปรดตรวจสอบข้อมูลและลองใหม่อีกครั้ง']);
        }
    }

    getWageInputData() {
        return {
            regularWageRate: parseFloat(document.getElementById('regularWageRate').value) || 0,
            regularWorkingDays: parseFloat(document.getElementById('regularWorkingDays').value) || 0,
            regularEmployees: parseInt(document.getElementById('regularEmployees').value) || 0,
            otWageRate: parseFloat(document.getElementById('otWageRate').value) || 0,
            otWorkingDays: parseFloat(document.getElementById('otWorkingDays').value) || 0,
            otEmployees: parseInt(document.getElementById('otEmployees').value) || 0
        };
    }

    validateWageInputs(data) {
        const errors = [];
        
        if (data.regularWageRate <= 0) {
            errors.push('กรุณากรอกอัตราค่าแรงการทำงานปกติต่อวัน');
        }
        if (data.regularWorkingDays <= 0) {
            errors.push('กรุณากรอกจำนวนวันทำงานปกติต่อเดือน');
        }
        if (data.regularEmployees <= 0) {
            errors.push('กรุณากรอกจำนวนพนักงานปกติ');
        }
        if (data.otWageRate <= 0) {
            errors.push('กรุณากรอกอัตราค่าแรง OT ต่อวัน');
        }
        if (data.otWorkingDays <= 0) {
            errors.push('กรุณากรอกจำนวนวันทำงาน OT ต่อเดือน');
        }
        if (data.otEmployees <= 0) {
            errors.push('กรุณากรอกจำนวนพนักงาน OT');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    performWageCalculation(data) {
        // คำนวณค่าแรงปกติ/เดือน
        const regularWageMonthly = data.regularWageRate * data.regularWorkingDays * data.regularEmployees;
        
        // คำนวณค่าแรง OT/เดือน
        const otWageMonthly = data.otWageRate * data.otWorkingDays * data.otEmployees;
        
        // รวมค่าแรงทั้งหมด
        const totalWage = regularWageMonthly + otWageMonthly;

        return {
            regularWageMonthly,
            otWageMonthly,
            totalWage,
            regularEmployees: data.regularEmployees,
            otEmployees: data.otEmployees
        };
    }

    displayWageResults(results, inputData) {
        const wageResultsContainer = document.getElementById('wageResults');
        
        const wageResultsHTML = `
            <div class="wage-results-content">
                <div class="wage-summary-header">
                    <h4><i class="fas fa-file-invoice-dollar" style="color: #3b82f6; margin-right: 0.5rem;"></i>สรุปการคำนวณค่าแรงพนักงาน</h4>
                </div>
                
                <div class="wage-summary-grid">
                    <div class="wage-summary-section regular-wage">
                        <h5><i class="fas fa-clock" style="color: #3b82f6; margin-right: 0.5rem;"></i>ค่าแรงปกติ/เดือน สำหรับจำนวนพนักงาน ${this.formatEmployeeNumber(results.regularEmployees)} คน</h5>
                        <div class="wage-calculation">
                            <div class="calculation-formula">
                                ${this.formatWageRate(inputData.regularWageRate)} × ${inputData.regularWorkingDays} × ${this.formatEmployeeNumber(results.regularEmployees)} = ${this.formatNumber(results.regularWageMonthly)} บาท
                            </div>
                            <div class="calculation-description">
                                (อัตราค่าแรงปกติ/วัน × วันทำงานปกติ/เดือน × จำนวนพนักงานปกติ)
                            </div>
                        </div>
                        <div class="wage-amount regular">
                            <span class="amount-label">ค่าแรงปกติรวม:</span>
                            <span class="amount-value">${this.formatNumber(results.regularWageMonthly)} บาท/เดือน</span>
                        </div>
                    </div>
                    
                    <div class="wage-summary-section ot-wage">
                        <h5><i class="fas fa-clock" style="color: #f59e0b; margin-right: 0.5rem;"></i>ค่าแรง OT/เดือน สำหรับจำนวนพนักงาน ${this.formatEmployeeNumber(results.otEmployees)} คน</h5>
                        <div class="wage-calculation">
                            <div class="calculation-formula">
                                ${this.formatWageRate(inputData.otWageRate)} × ${inputData.otWorkingDays} × ${this.formatEmployeeNumber(results.otEmployees)} = ${this.formatNumber(results.otWageMonthly)} บาท
                            </div>
                            <div class="calculation-description">
                                (อัตราค่าแรง OT/วัน × วันทำงาน OT/เดือน × จำนวนพนักงาน OT)
                            </div>
                        </div>
                        <div class="wage-amount ot">
                            <span class="amount-label">ค่าแรง OT รวม:</span>
                            <span class="amount-value">${this.formatNumber(results.otWageMonthly)} บาท/เดือน</span>
                        </div>
                    </div>
                    
                    <div class="wage-summary-section total-wage">
                        <h5><i class="fas fa-calculator" style="color: #10b981; margin-right: 0.5rem;"></i>ค่าแรงรวมทั้งหมด</h5>
                        <div class="total-calculation">
                            <div class="total-breakdown">
                                <div class="breakdown-item">
                                    <span>ค่าแรงปกติ:</span>
                                    <span>${this.formatNumber(results.regularWageMonthly)} บาท</span>
                                </div>
                                <div class="breakdown-item">
                                    <span>ค่าแรง OT:</span>
                                    <span>${this.formatNumber(results.otWageMonthly)} บาท</span>
                                </div>
                                <hr>
                                <div class="breakdown-item total">
                                    <span>รวมทั้งสิ้น:</span>
                                    <span>${this.formatNumber(results.totalWage)} บาท/เดือน</span>
                                </div>
                            </div>
                        </div>
                        <div class="wage-amount total">
                            <span class="amount-label">ค่าแรงรวมทั้งหมด:</span>
                            <span class="amount-value highlight">${this.formatNumber(results.totalWage)} บาท/เดือน</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        wageResultsContainer.innerHTML = wageResultsHTML;
    }

    formatEmployeeNumber(number) {
        // แสดงทศนิยมหากเป็นจำนวนที่มีทศนิยม ไม่ใช่จำนวนเต็ม
        return number % 1 === 0 ? number.toString() : number.toFixed(1);
    }

    formatWageRate(number) {
        // แสดงอัตราค่าแรงแบบรักษาทศนิยมตามที่กรอกเข้ามา
        if (number % 1 === 0) {
            // หากเป็นเลขจำนวนเต็ม ใช้ formatNumber เพื่อใส่ comma
            return this.formatNumber(number);
        } else {
            // หากมีทศนิยม ให้แสดงทศนิยมและใส่ comma หากจำเป็น
            const formatted = number.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 4
            });
            return formatted;
        }
    }

    displayWageError(errors) {
        const wageResultsContainer = document.getElementById('wageResults');
        const errorHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>กรุณาตรวจสอบข้อมูล</h4>
                <ul>
                    ${errors.map(error => `<li>${error}</li>`).join('')}
                </ul>
            </div>
        `;
        wageResultsContainer.innerHTML = errorHTML;
    }
}

// Additional CSS for analysis section
const additionalCSS = `
<style>
.form-group input.error {
    border-color: #ef4444 !important;
    background-color: #fef2f2 !important;
}

.analysis-grid {
    display: grid;
    gap: 1.5rem;
}

.analysis-card {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    border-left: 4px solid #4f46e5;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.analysis-card.success {
    border-left-color: #10b981;
}

.analysis-card.warning {
    border-left-color: #f59e0b;
}

.analysis-card.info {
    border-left-color: #3b82f6;
}

.analysis-card h4 {
    margin-bottom: 1rem;
    color: #1f2937;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.efficiency-metrics, .production-summary {
    display: grid;
    gap: 0.75rem;
}

.summary-section {
    background: #f8fafc;
    padding: 1.25rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
    border: 2px solid #e2e8f0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.summary-section h5 {
    color: #1e40af;
    margin-bottom: 1rem;
    font-size: 1.1rem;
    font-weight: 600;
    background: #dbeafe;
    padding: 0.75rem;
    border-radius: 8px;
    border-left: 4px solid #3b82f6;
}

.metric, .summary-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 1px solid #e5e7eb;
    font-weight: 400;
}

.summary-item strong {
    font-weight: 500;
    color: #374151;
}

.summary-item.total {
    background: #dbeafe;
    padding: 1rem;
    border-radius: 8px;
    margin: 0.75rem 0;
    border: none;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
}

.summary-grid {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.regular-section {
    border-left: 4px solid #3b82f6;
}

.regular-section h5 {
    background: #dbeafe;
    color: #1e40af;
}

.ot-section {
    border-left: 4px solid #3b82f6;
}

.ot-section h5 {
    background: #dbeafe;
    color: #1e40af;
}

.special-comparison-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.special-scenario-card {
    background: #f8fafc;
    padding: 1rem;
    border-radius: 8px;
    border: 2px solid #e2e8f0;
}

.special-scenario-card.success {
    border-color: #10b981;
    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
}

.special-scenario-card.warning {
    border-color: #f59e0b;
    background: linear-gradient(135deg, #fffbeb, #fef3c7);
}

.special-scenario-card h5 {
    margin-bottom: 0.5rem;
    color: #1f2937;
    font-size: 1rem;
    font-weight: 600;
}

.scenario-details {
    font-size: 0.9rem;
    color: #6b7280;
}

.scenario-details div {
    margin-bottom: 0.25rem;
}

.scenario-status {
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    text-align: center;
    margin-top: 0.5rem;
}

.scenario-status.success {
    background: #dcfce7;
    color: #047857;
}

.scenario-status.warning {
    background: #fef3c7;
    color: #d97706;
}

.special-notice {
    background: #dbeafe;
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
    text-align: center;
    border: 2px solid #3b82f6;
}

.special-notice p {
    color: #1e40af;
    font-weight: 500;
    margin: 0;
}

.metric-label {
    color: #6b7280;
}

.metric-value {
    font-weight: 600;
    color: #1f2937;
}

.ot-comparison {
    margin-top: 1.5rem;
}

.comparison-cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin: 1rem 0;
}

.comparison-card {
    padding: 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    text-align: center;
}

.comparison-card.recommended {
    border-color: #10b981;
    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
}

.comparison-card h5 {
    margin-bottom: 0.5rem;
    color: #1f2937;
}

.comparison-details {
    font-size: 0.9rem;
    color: #6b7280;
}

.recommendation {
    background: #f0f9ff;
    padding: 1rem;
    border-radius: 8px;
    border-left: 4px solid #0ea5e9;
    margin-top: 1rem;
}

@media (max-width: 768px) {
    .comparison-cards {
        grid-template-columns: 1fr;
    }
}

/* Wage Calculator Styles */
.wage-results-content {
    padding: 1rem;
}

.wage-summary-header h4 {
    color: #1f2937;
    margin-bottom: 1.5rem;
    font-size: 1.3rem;
    font-weight: 700;
    border-bottom: 3px solid #3b82f6;
    padding-bottom: 0.75rem;
    display: flex;
    align-items: center;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.wage-summary-grid {
    display: grid;
    gap: 1.5rem;
}

.wage-summary-section {
    background: linear-gradient(135deg, #ffffff, #f8fafc);
    padding: 1.5rem;
    border-radius: 16px;
    border: 2px solid #e2e8f0;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.wage-summary-section:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
}

.wage-summary-section h5 {
    color: #1f2937;
    margin-bottom: 1rem;
    font-size: 1.1rem;
    font-weight: 600;
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 0.75rem;
    display: flex;
    align-items: center;
}

.wage-calculation {
    margin-bottom: 1rem;
    background: white;
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
}

.calculation-formula {
    font-family: 'Courier New', monospace;
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
}

.calculation-description {
    font-size: 0.9rem;
    color: #6b7280;
    font-style: italic;
}

.wage-amount {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    border-radius: 12px;
    border: 2px solid transparent;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
}

.wage-amount::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s ease;
}

.wage-amount:hover::before {
    left: 100%;
}

.wage-amount.regular {
    border-color: #3b82f6;
    background: linear-gradient(135deg, #1e40af, #3b82f6);
    color: white;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.wage-amount.ot {
    border-color: #f59e0b;
    background: linear-gradient(135deg, #ea580c, #f59e0b);
    color: white;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.wage-amount.total {
    border-color: #10b981;
    background: linear-gradient(135deg, #059669, #10b981);
    color: white;
    font-size: 1.2rem;
    font-weight: 700;
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.amount-label {
    font-weight: 600;
    color: white;
}

.amount-value {
    font-weight: 700;
    font-size: 1.1rem;
}

.amount-value.highlight {
    font-size: 1.4rem;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.total-calculation {
    background: white;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    margin-bottom: 1rem;
}

.total-breakdown {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.breakdown-item {
    display: flex;
    justify-content: space-between;
    padding: 0.25rem 0;
}

.breakdown-item.total {
    font-weight: 700;
    font-size: 1.1rem;
    color: #059669;
}

.total-breakdown hr {
    margin: 0.5rem 0;
    border: none;
    border-top: 2px solid #e5e7eb;
}



.error-message {
    background: #fef2f2;
    border: 2px solid #f87171;
    color: #991b1b;
    padding: 1.5rem;
    border-radius: 8px;
    text-align: center;
}

.error-message h4 {
    margin-bottom: 1rem;
    color: #dc2626;
}

.error-message ul {
    text-align: left;
    margin: 1rem 0;
    padding-left: 1.5rem;
}

.error-message li {
    margin: 0.5rem 0;
}

@media (max-width: 768px) {
    .wage-amount {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
    
    .breakdown-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
    }
}
</style>
`;

// Inject additional CSS
document.head.insertAdjacentHTML('beforeend', additionalCSS);

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PD4Calculator();
});

// Export for potential use in other modules
// Module export for Node.js compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PD4Calculator;
}