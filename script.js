
        // عناصر DOM
        const cupBody = document.querySelector('.cup-body');
        const cupLiquid = document.getElementById('cupLiquid');
        const hologramText = document.getElementById('hologramText');
        const cupTextDisplay = document.getElementById('cupTextDisplay');
        const temperatureValue = document.getElementById('temperatureValue');
        const capacityValue = document.getElementById('capacityValue');
        const batteryValue = document.getElementById('batteryValue');
        const brightnessSlider = document.getElementById('brightness');
        const brightnessValue = document.getElementById('brightnessValue');
        const speedSlider = document.getElementById('effectSpeed');
        const speedValue = document.getElementById('speedValue');
        const liquidLevelSlider = document.getElementById('liquidLevel');
        const levelValue = document.getElementById('levelValue');
        const colorOptions = document.querySelectorAll('.color-option');
        const liquidOptions = document.querySelectorAll('.color-option[data-liquid]');
        const patternOptions = document.querySelectorAll('.pattern-option');
        const cupDesigns = document.querySelectorAll('.cup-design');
        const tempButton = document.getElementById('tempButton');
        const lightButton = document.getElementById('lightButton');
        const chipButton = document.getElementById('chipButton');
        const saveButton = document.getElementById('saveDesign');
        const shareButton = document.getElementById('shareDesign');
        const resetButton = document.getElementById('resetDesign');
        const rotateButton = document.getElementById('rotateCup');
        const arViewButton = document.getElementById('arView');
        const arOverlay = document.getElementById('arOverlay');
        const arClose = document.getElementById('arClose');
        const notification = document.getElementById('notification');
        const logoButton = document.getElementById('logoButton');
        const liquidR = document.getElementById('liquidR');
        const liquidG = document.getElementById('liquidG');
        const liquidB = document.getElementById('liquidB');
        const bubblesContainer = document.getElementById('bubblesContainer');
        const futureCup = document.getElementById('futureCup');
        const cupTextInput = document.getElementById('cupText');
        const fontFamilySelect = document.getElementById('fontFamily');
        const textColorSelect = document.getElementById('textColor');
        const fontSizeSlider = document.getElementById('fontSize');
        const fontSizeValue = document.getElementById('fontSizeValue');
        const savedDesignsList = document.getElementById('savedDesignsList');

        // حالات التطبيق
        let currentTemperature = 42;
        let currentBattery = 100;
        let currentPattern = 'atom';
        let currentDesign = '1';
        let isLightOn = true;
        let isRotating = false;

        // تصميمات الكأس
        const cupDesignsData = {
            '1': 'linear-gradient(135deg, #00f7ff, #0077ff)',
            '2': 'linear-gradient(135deg, #ff00d6, #ff0066)',
            '3': 'linear-gradient(135deg, #7bff00, #00ff95)',
            '4': 'linear-gradient(135deg, #ff9900, #ff5500)',
            '5': 'linear-gradient(135deg, #cc00ff, #5500ff)',
            '6': 'linear-gradient(135deg, #00ffaa, #00ccff)'
        };

        // أصوات: نستخدم Web Audio API كما طلبت (مولدة)
        function playSound(type) {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                // قيم افتراضية لكل نوع صوتي (تعديل طفيف على التردد/مدة)
                let freq = 600;
                let dur = 0.18;
                let vol = 0.08;

                switch (type) {
                    case 'beep': freq = 800; dur = 0.15; vol = 0.08; break;
                    case 'click': freq = 500; dur = 0.07; vol = 0.06; break;
                    case 'success': freq = 1000; dur = 0.25; vol = 0.09; break;
                    case 'chip': freq = 340; dur = 0.22; vol = 0.06; break;
                    case 'switch': freq = 440; dur = 0.12; vol = 0.07; break;
                    case 'share': freq = 740; dur = 0.14; vol = 0.07; break;
                    case 'reset': freq = 280; dur = 0.18; vol = 0.08; break;
                    case 'rotate': freq = 520; dur = 0.12; vol = 0.06; break;
                    case 'logo': freq = 900; dur = 0.16; vol = 0.08; break;
                    case 'ar': freq = 650; dur = 0.18; vol = 0.08; break;
                    case 'close': freq = 360; dur = 0.12; vol = 0.06; break;
                    default: freq = 600; dur = 0.12; vol = 0.07;
                }

                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                gainNode.gain.setValueAtTime(vol, audioContext.currentTime);

                oscillator.start();
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + dur);
                oscillator.stop(audioContext.currentTime + dur + 0.02);
            } catch (e) {
                // إذا لم يكن Web Audio مدعومًا، نتجاهل بصمت
                console.warn('Audio API not available', e);
            }
        }

        // تحميل التصميمات المحفوظة
        function loadSavedDesigns() {
            const savedDesigns = JSON.parse(localStorage.getItem('novaCupDesigns')) || [];
            savedDesignsList.innerHTML = '';
            
            if (savedDesigns.length === 0) {
                savedDesignsList.innerHTML = '<p style="grid-column: span 2; text-align: center; color: rgba(255,255,255,0.5);">لا توجد تصاميم محفوظة</p>';
                return;
            }
            
            savedDesigns.forEach((design, index) => {
                const designItem = document.createElement('div');
                designItem.className = 'saved-design-item';
                designItem.innerHTML = `
                    <span class="saved-design-name">${design.name}</span>
                    <span class="delete-design" data-index="${index}"><i class="fas fa-trash"></i></span>
                `;
                
                designItem.addEventListener('click', () => {
                    loadDesign(design);
                });
                
                const deleteBtn = designItem.querySelector('.delete-design');
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteDesign(index);
                });
                
                savedDesignsList.appendChild(designItem);
            });
        }

        // حذف تصميم
        function deleteDesign(index) {
            const savedDesigns = JSON.parse(localStorage.getItem('novaCupDesigns')) || [];
            savedDesigns.splice(index, 1);
            localStorage.setItem('novaCupDesigns', JSON.stringify(savedDesigns));
            loadSavedDesigns();
            showNotification('تم حذف التصميم بنجاح');
            playSound('reset');
        }

        // تحميل تصميم
        function loadDesign(design) {
            try {
                document.querySelector(`.cup-design[data-design="${design.cupDesign}"]`).click();
                document.querySelector(`.color-option[data-liquid="${design.liquidColor}"]`).click();
                document.querySelector(`.pattern-option[data-pattern="${design.pattern}"]`).click();
            } catch (e) {
                // إذا لم يجد عناصر، نستمر بدون كسر
                console.warn('Some design elements not found', e);
            }
            
            // تطبيق إعدادات النص
            cupTextInput.value = design.text || '';
            fontFamilySelect.value = design.fontFamily || 'Cairo';
            textColorSelect.value = design.textColor || '#ffffff';
            fontSizeSlider.value = design.fontSize || 16;
            fontSizeValue.textContent = `${design.fontSize || 16}px`;
            
            // تحديث عرض النص
            updateTextDisplay();
            
            showNotification(`تم تحميل تصميم: ${design.name}`);
            playSound('success');
        }

        // حفظ التصميم
        function saveCurrentDesign() {
            const designName = prompt('أدخل اسم للتصميم:');
            if (!designName) return;
            
            const activeLiquidOpt = document.querySelector('.color-option[data-liquid].active');
            const design = {
                name: designName,
                cupDesign: currentDesign,
                liquidColor: activeLiquidOpt ? activeLiquidOpt.getAttribute('data-liquid') : 'rgba(0,247,255,0.6)',
                pattern: currentPattern,
                text: cupTextInput.value,
                fontFamily: fontFamilySelect.value,
                textColor: textColorSelect.value,
                fontSize: parseInt(fontSizeSlider.value)
            };
            
            const savedDesigns = JSON.parse(localStorage.getItem('novaCupDesigns')) || [];
            savedDesigns.push(design);
            localStorage.setItem('novaCupDesigns', JSON.stringify(savedDesigns));
            
            loadSavedDesigns();
            showNotification('تم حفظ التصميم بنجاح!');
            playSound('success');
        }

        // تحديث عرض النص على الكأس
        function updateTextDisplay() {
            cupTextDisplay.textContent = cupTextInput.value;
            cupTextDisplay.style.fontFamily = fontFamilySelect.value;
            cupTextDisplay.style.color = textColorSelect.value;
            cupTextDisplay.style.fontSize = `${fontSizeSlider.value}px`;
        }

        // تفعيل أزرار التحكم على الكأس
        tempButton.addEventListener('click', function() {
            currentTemperature = currentTemperature === 42 ? 5 : 42;
            temperatureValue.textContent = `درجة الحرارة: ${currentTemperature}°C`;
            tempButton.classList.toggle('active');
            playSound('beep');
        });

        lightButton.addEventListener('click', function() {
            isLightOn = !isLightOn;
            if (isLightOn) {
                cupBody.style.boxShadow = '0 0 30px rgba(0, 247, 255, 0.2), inset 0 0 20px rgba(123, 255, 0, 0.1)';
                lightButton.innerHTML = '<i class="fas fa-lightbulb"></i>';
            } else {
                cupBody.style.boxShadow = 'none';
                lightButton.innerHTML = '<i class="far fa-lightbulb"></i>';
            }
            lightButton.classList.toggle('active');
            playSound('switch');
        });

        chipButton.addEventListener('click', function() {
            const messages = [
                "النظام يعمل بكفاءة",
                "جاهز للتخصيص",
                "الذكاء الاصطناعي نشط",
                "جميع الوظائف تعمل بشكل طبيعي"
            ];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            hologramText.textContent = randomMessage;
            
            setTimeout(() => {
                // صححنا النص هنا لعرض "نوفا 2099" بعد الرسالة
                hologramText.textContent = "نوفا 2099";
            }, 2000);
            
            chipButton.classList.toggle('active');
            playSound('chip');
        });

        // تفاعلات تغيير تصميم الكأس
        cupDesigns.forEach(design => {
            design.addEventListener('click', function() {
                cupDesigns.forEach(d => d.classList.remove('active'));
                this.classList.add('active');
                
                currentDesign = this.getAttribute('data-design');
                cupBody.style.background = cupDesignsData[currentDesign];
                playSound('click');
            });
        });

        // تفاعلات تغيير الألوان (خارج سائل)
        colorOptions.forEach(option => {
            option.addEventListener('click', function() {
                if (this.hasAttribute('data-color')) {
                    colorOptions.forEach(opt => opt.classList.remove('active'));
                    this.classList.add('active');
                    
                    const color = this.getAttribute('data-color');
                    document.documentElement.style.setProperty('--cup-color', color);
                    cupBody.style.background = color;
                }
                playSound('click');
            });
        });

        // تفاعلات تغيير لون السائل
        liquidOptions.forEach(option => {
            option.addEventListener('click', function() {
                liquidOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
                const color = this.getAttribute('data-liquid');
                document.documentElement.style.setProperty('--liquid-color', color);
                cupLiquid.style.background = color;
                playSound('click');
            });
        });

        // تحكم RGB في لون السائل
        function updateLiquidColor() {
            const r = liquidR.value;
            const g = liquidG.value;
            const b = liquidB.value;
            const color = `rgba(${r}, ${g}, ${b}, 0.6)`;
            document.documentElement.style.setProperty('--liquid-color', color);
            cupLiquid.style.background = color;
            
            // تحديث الأزرار النشطة
            liquidOptions.forEach(opt => opt.classList.remove('active'));
        }

        liquidR.addEventListener('input', updateLiquidColor);
        liquidG.addEventListener('input', updateLiquidColor);
        liquidB.addEventListener('input', updateLiquidColor);

        // تفاعلات أنماط التصميم
        patternOptions.forEach(option => {
            option.addEventListener('click', function() {
                patternOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
                currentPattern = this.getAttribute('data-pattern');
                updateHologramPattern();
                playSound('click');
            });
        });

        function updateHologramPattern() {
            const patterns = {
                atom: '<i class="fas fa-atom"></i>',
                circle: '<i class="fas fa-circle-notch"></i>',
                infinity: '<i class="fas fa-infinity"></i>',
                wave: '<i class="fas fa-wave-square"></i>',
                hexagon: '<i class="fas fa-hexagon"></i>',
                dna: '<i class="fas fa-dna"></i>'
            };
            
            hologramText.innerHTML = patterns[currentPattern] || "نوفا 2099";
        }

        // تحديث قيم السلايدر
        brightnessSlider.addEventListener('input', function() {
            brightnessValue.textContent = `${this.value}%`;
            const brightness = this.value / 100;
            cupBody.style.opacity = 0.5 + (brightness * 0.5);
        });

        speedSlider.addEventListener('input', function() {
            speedValue.textContent = this.value;
            document.documentElement.style.setProperty('--particle-speed', `${this.value}s`);
        });

        liquidLevelSlider.addEventListener('input', function() {
            levelValue.textContent = `${this.value}%`;
            document.documentElement.style.setProperty('--liquid-level', `${this.value}%`);
            // فعليًا نضع ارتفاع العنصر الإلكتروني:
            cupLiquid.style.height = `${this.value}%`;
        });

        fontSizeSlider.addEventListener('input', function() {
            fontSizeValue.textContent = `${this.value}px`;
            updateTextDisplay();
        });

        // أحداث التحكم بالنص
        cupTextInput.addEventListener('input', updateTextDisplay);
        fontFamilySelect.addEventListener('change', updateTextDisplay);
        textColorSelect.addEventListener('change', updateTextDisplay);

        // إنشاء فقاعات
        function createBubble() {
            const bubble = document.createElement('div');
            bubble.classList.add('bubble');
            
            const size = Math.random() * 10 + 5;
            const left = Math.random() * 80 + 10;
            const duration = Math.random() * 4 + 3;
            
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            bubble.style.left = `${left}%`;
            bubble.style.animation = `bubbleRise ${duration}s linear forwards`;
            
            bubblesContainer.appendChild(bubble);
            
            setTimeout(() => {
                bubble.remove();
            }, duration * 1000);
        }
        
        // بدء إنشاء الفقاعات
        setInterval(createBubble, 300);

        // حفظ التصميم
        saveButton.addEventListener('click', saveCurrentDesign);

        // مشاركة التصميم -> نسخ رابط الصفحة / رابط مخصص للتحميل
        shareButton.addEventListener('click', function() {
            // نكون رابط مشاركة بسيط يحوي بعض إعدادات التصميم (مثال: cupDesign, liquid, pattern)
            const activeLiquidOpt = document.querySelector('.color-option[data-liquid].active');
            const liquid = activeLiquidOpt ? encodeURIComponent(activeLiquidOpt.getAttribute('data-liquid')) : '';
            const urlParams = new URLSearchParams({
                design: currentDesign,
                liquid: liquid,
                pattern: currentPattern,
                text: encodeURIComponent(cupTextInput.value || '')
            });

            const shareUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;

            // محاولة النسخ للحافظة
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(shareUrl).then(() => {
                    showNotification('تم نسخ رابط المشاركة إلى الحافظة!');
                    playSound('share');
                }).catch(() => {
                    fallbackCopyTextToClipboard(shareUrl);
                });
            } else {
                fallbackCopyTextToClipboard(shareUrl);
            }
        });

        function fallbackCopyTextToClipboard(text) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    showNotification('تم نسخ رابط المشاركة إلى الحافظة!');
                    playSound('share');
                } else {
                    showNotification('لم يتم النسخ — يمكنك نسخه يدوياً من الحافظة');
                }
            } catch (err) {
                showNotification('حدث خطأ أثناء النسخ');
            }

            document.body.removeChild(textArea);
        }

        
// اختيار نوع الكأس
const cupTypes = document.querySelectorAll('.cup-type');
cupTypes.forEach(type => {
    type.addEventListener('click', function() {
        cupTypes.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        const shape = this.getAttribute('data-shape');
        switch(shape) {
            case 'cylinder':
                cupBody.style.borderRadius = '20px 20px 20px 20px';
                break;
            case 'cone':
                cupBody.style.borderRadius = '60px 60px 20px 20px';
                break;
            case 'round':
                cupBody.style.borderRadius = '50%';
                break;
            case 'classic':
                cupBody.style.borderRadius = '20px 20px 80px 80px';
                break;
            case 'futuristic':
                cupBody.style.borderRadius = '10px 40px 80px 20px';
                break;
            case 'metal':
                cupBody.style.borderRadius = '5px';
                cupBody.style.background = 'linear-gradient(135deg, #aaa, #444)';
                break;
        }
        playSound('click');
    });
});

        // إعادة الضبط
        resetButton.addEventListener('click', function() {
            // إعادة كل شيء إلى الوضع الافتراضي
            try {
                cupDesigns[0].click();
                liquidOptions[0].click();
                patternOptions[0].click();
            } catch (e) { /* ignore if not present */ }

            brightnessSlider.value = 70;
            brightnessValue.textContent = '70%';
            speedSlider.value = 5;
            speedValue.textContent = '5';
            liquidLevelSlider.value = 70;
            levelValue.textContent = '70%';
            liquidR.value = 0;
            liquidG.value = 247;
            liquidB.value = 255;
            updateLiquidColor();
            
            // إعادة تعيين النص
            cupTextInput.value = '';
            fontFamilySelect.value = 'Cairo';
            textColorSelect.value = '#ffffff';
            fontSizeSlider.value = 16;
            fontSizeValue.textContent = '16px';
            updateTextDisplay();
            
            showNotification('تمت إعادة الضبط إلى الإعدادات الافتراضية');
            playSound('reset');
        });

        // تدوير الكأس
        rotateButton.addEventListener('click', function() {
            if (isRotating) {
                futureCup.style.animation = 'none';
                rotateButton.innerHTML = '<i class="fas fa-sync"></i> تدوير الكأس';
            } else {
                futureCup.style.animation = 'rotateCup 10s infinite linear';
                rotateButton.innerHTML = '<i class="fas fa-stop"></i> إيقاف التدوير';
            }
            isRotating = !isRotating;
            playSound('rotate');
        });

        // الواقع المعزز
        arViewButton.addEventListener('click', function() {
            arOverlay.style.display = 'flex';
            arOverlay.setAttribute('aria-hidden','false');
            playSound('ar');
            // إذا أردنا، يمكن ضبط محتوى AR هنا ديناميكياً
            // نترك model-viewer المحمّل في DOM ليعرض النموذج
        });

        arClose.addEventListener('click', function() {
            arOverlay.style.display = 'none';
            arOverlay.setAttribute('aria-hidden','true');
            playSound('close');
        });

        // تفعيل زر الشعار
        logoButton.addEventListener('click', function() {
            document.body.style.animation = 'pulse 0.5s';
            playSound('logo');
            setTimeout(() => {
                document.body.style.animation = 'none';
            }, 500);
        });

        // عرض الإشعارات
        function showNotification(message) {
            notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        // ضبط عند التحميل (اقرأ بارامترات الرابط لِتحميل تصميم إذا وُجد)
        window.addEventListener('load', function() {
            showNotification('مرحباً بك في محاكي كاسات نوفا 2099!');
            loadSavedDesigns();

            // دعم فتح تصميم من رابط المشاركة (إن وُجد)
            const params = new URLSearchParams(window.location.search);
            const designParam = params.get('design');
            const liquidParam = params.get('liquid');
            const patternParam = params.get('pattern');
            const textParam = params.get('text');

            if (designParam) {
                // محاكاة تحميل العناصر المتاحة
                try {
                    if (document.querySelector(`.cup-design[data-design="${designParam}"]`)) {
                        document.querySelector(`.cup-design[data-design="${designParam}"]`).click();
                    }
                    if (liquidParam && document.querySelector(`.color-option[data-liquid="${decodeURIComponent(liquidParam)}"]`)) {
                        document.querySelector(`.color-option[data-liquid="${decodeURIComponent(liquidParam)}"]`).click();
                    }
                    if (patternParam && document.querySelector(`.pattern-option[data-pattern="${patternParam}"]`)) {
                        document.querySelector(`.pattern-option[data-pattern="${patternParam}"]`).click();
                    }
                    if (textParam) {
                        cupTextInput.value = decodeURIComponent(textParam);
                        updateTextDisplay();
                    }
                    showNotification('تم تحميل إعدادات من رابط المشاركة');
                } catch (e) {
                    console.warn('Error loading from URL params', e);
                }
            }
        });
    