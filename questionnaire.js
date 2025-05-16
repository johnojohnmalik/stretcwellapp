// Questionnaire Functionality for Stretch-Well App
try {
    // Try to import using absolute path
    import { saveQuestionnaireData } from '/js/data-service.js';
    initializeQuestionnaire(saveQuestionnaireData);
} catch (e) {
    // Fallback to relative path if absolute fails
    console.log("Falling back to relative import path");
    import('./js/data-service.js')
        .then(module => {
            initializeQuestionnaire(module.saveQuestionnaireData);
        })
        .catch(error => {
            console.error("Failed to load data-service module:", error);
            // Final fallback - create a dummy function that logs to console but allows progression
            initializeQuestionnaire((data) => {
                console.log("Using fallback data saving mechanism", data);
                localStorage.setItem('userPreferences', JSON.stringify(data));
                return true;
            });
        });
}

function initializeQuestionnaire(saveDataFunction) {
    document.addEventListener('DOMContentLoaded', function() {
        // DOM Elements
        const slides = document.querySelectorAll('.question-slide');
        const progressFill = document.getElementById('progressFill');
        const currentQuestionEl = document.getElementById('currentQuestion');
        const totalQuestionsEl = document.getElementById('totalQuestions');
        const discomfortRange = document.getElementById('discomfort-range');
        const discomfortValue = document.getElementById('discomfort-value');
        const otherRadio = document.getElementById('other');
        const otherInput = document.querySelector('.other-input');
        
        // Variables
        const totalQuestions = slides.length - 1; // Exclude completion slide
        let currentQuestion = 1;
        
        // Initialize
        init();
        
        function init() {
            // Set total questions
            totalQuestionsEl.textContent = totalQuestions;
            
            // Set up navigation button listeners
            setupNavButtons();
            
            // Set up other form interactions
            setupFormInteractions();
            
            // Initialize progress bar
            updateProgress();
        }
        
        function setupNavButtons() {
            // Next buttons
            const nextButtons = document.querySelectorAll('.btn-next');
            nextButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const nextQuestion = parseInt(this.getAttribute('data-next'));
                    if (validateCurrentSlide()) {
                        navigateToSlide(nextQuestion);
                    }
                });
            });
            
            // Previous buttons
            const prevButtons = document.querySelectorAll('.btn-prev');
            prevButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const prevQuestion = parseInt(this.getAttribute('data-prev'));
                    navigateToSlide(prevQuestion);
                });
            });
            
            // Submit button
            const submitButton = document.querySelector('.btn-submit');
            if (submitButton) {
                submitButton.addEventListener('click', function() {
                    if (validateCurrentSlide()) {
                        // Submit questionnaire data
                        submitQuestionnaire();
                    }
                });
            }
        }
        
        function setupFormInteractions() {
            // Discomfort slider value display
            if (discomfortRange && discomfortValue) {
                discomfortRange.addEventListener('input', function() {
                    discomfortValue.textContent = this.value;
                });
            }
            
            // "Other" option text input enable/disable
            if (otherRadio && otherInput) {
                otherRadio.addEventListener('change', function() {
                    otherInput.disabled = !this.checked;
                    if (this.checked) {
                        otherInput.focus();
                    }
                });
            }
            
            // Enable animations for checkboxes and radio buttons
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    if (this.checked) {
                        const label = this.nextElementSibling;
                        addTemporaryClass(label, 'checked-animation');
                    }
                });
            });
            
            const radioButtons = document.querySelectorAll('input[type="radio"]');
            radioButtons.forEach(radio => {
                radio.addEventListener('change', function() {
                    if (this.checked) {
                        const content = this.nextElementSibling;
                        addTemporaryClass(content, 'checked-animation');
                    }
                });
            });
        }
        
        function navigateToSlide(slideNumber) {
            // Hide all slides
            slides.forEach(slide => {
                slide.classList.remove('active');
            });
            
            // Show target slide
            const targetSlide = document.querySelector(`.question-slide[data-question="${slideNumber}"]`);
            if (targetSlide) {
                targetSlide.classList.add('active');
                currentQuestion = slideNumber;
                currentQuestionEl.textContent = currentQuestion;
                
                // Update progress bar
                updateProgress();
                
                // Scroll to top of slide container
                document.querySelector('.questionnaire-container').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
        
        function updateProgress() {
            // Calculate progress percentage
            const progressPercentage = ((currentQuestion - 1) / (totalQuestions - 1)) * 100;
            progressFill.style.width = `${progressPercentage}%`;
        }
        
        function validateCurrentSlide() {
            // Get current slide
            const currentSlide = document.querySelector(`.question-slide[data-question="${currentQuestion}"]`);
            
            // Question 1: Daily activity selection
            if (currentQuestion === 1) {
                const activitySelected = currentSlide.querySelector('input[name="daily-activity"]:checked');
                if (!activitySelected) {
                    showValidationError('Please select your main daily activity');
                    return false;
                }
                
                // If "Other" is selected, make sure text is entered
                if (activitySelected.id === 'other') {
                    const otherText = currentSlide.querySelector('.other-input').value.trim();
                    if (otherText === '') {
                        showValidationError('Please describe your activity');
                        return false;
                    }
                }
            }
            
            // Question 2: Areas of discomfort (optional, no validation needed)
            
            // Question 3: Intensity preference
            if (currentQuestion === 3) {
                const intensitySelected = currentSlide.querySelector('input[name="intensity"]:checked');
                if (!intensitySelected) {
                    showValidationError('Please select your intensity preference');
                    return false;
                }
            }
            
            // Question 4: Energy level
            if (currentQuestion === 4) {
                const energySelected = currentSlide.querySelector('input[name="energy"]:checked');
                if (!energySelected) {
                    showValidationError('Please select your current energy level');
                    return false;
                }
            }
            
            // Question 5: Breath awareness
            if (currentQuestion === 5) {
                const breathSelected = currentSlide.querySelector('input[name="breath"]:checked');
                if (!breathSelected) {
                    showValidationError('Please select your breath awareness level');
                    return false;
                }
            }
            
            // Question 6: Work habits
            if (currentQuestion === 6) {
                const postureSelected = currentSlide.querySelector('input[name="posture-adjust"]:checked');
                const breathingSelected = currentSlide.querySelector('input[name="tense-breathing"]:checked');
                const breaksSelected = currentSlide.querySelector('input[name="movement-breaks"]:checked');
                const stretchSelected = currentSlide.querySelector('input[name="after-work-stretch"]:checked');
                const overexertSelected = currentSlide.querySelector('input[name="overexert"]:checked');
                
                if (!postureSelected || !breathingSelected || !breaksSelected || 
                    !stretchSelected || !overexertSelected) {
                    showValidationError('Please answer all questions in this section');
                    return false;
                }
            }
            
            // Question 7: Routine Duration
            if (currentQuestion === 7) {
                const durationSelected = currentSlide.querySelector('input[name="routine-duration"]:checked');
                if (!durationSelected) {
                    showValidationError('Please select your preferred routine duration');
                    return false;
                }
            }
            
            return true;
        }
        
        function showValidationError(message) {
            // Create error element if it doesn't exist
            let errorEl = document.querySelector('.validation-error');
            if (!errorEl) {
                errorEl = document.createElement('div');
                errorEl.className = 'validation-error';
                
                // Style the error
                errorEl.style.color = 'rgba(255, 150, 150, 0.9)';
                errorEl.style.background = 'rgba(255, 0, 0, 0.1)';
                errorEl.style.padding = '10px 15px';
                errorEl.style.borderRadius = '8px';
                errorEl.style.marginBottom = '20px';
                errorEl.style.fontWeight = '500';
                errorEl.style.textAlign = 'center';
                errorEl.style.animation = 'fadeIn 0.3s ease';
                
                // Add to the current slide above navigation buttons
                const currentSlide = document.querySelector(`.question-slide[data-question="${currentQuestion}"]`);
                const navButtons = currentSlide.querySelector('.navigation-buttons');
                currentSlide.insertBefore(errorEl, navButtons);
            }
            
            // Set error message and add shake animation
            errorEl.textContent = message;
            addTemporaryClass(errorEl, 'shake');
            
            // Remove after 3 seconds
            setTimeout(() => {
                errorEl.remove();
            }, 3000);
        }
        
        function addTemporaryClass(element, className) {
            element.classList.add(className);
            setTimeout(() => {
                element.classList.remove(className);
            }, 500);
        }
        
        async function submitQuestionnaire() {
            // Collect all form data
            const formData = {
                // Map activity value to our database format
                dailyActivity: mapActivityTypeToDatabase(document.querySelector('input[name="daily-activity"]:checked')?.value),
                otherActivity: document.querySelector('.other-input')?.value,
                // Map body areas to those in our database
                discomfortAreas: mapBodyAreasToDatabase(
                    Array.from(document.querySelectorAll('.tags-container input[type="checkbox"]:checked')).map(cb => cb.id)
                ),
                // Map intensity to our database values
                intensityPreference: mapIntensityToDatabase(document.querySelector('input[name="intensity"]:checked')?.value),
                energyLevel: document.querySelector('input[name="energy"]:checked')?.value,
                breathAwareness: document.querySelector('input[name="breath"]:checked')?.value,
                postureAdjustment: document.querySelector('input[name="posture-adjust"]:checked')?.value,
                tenseBreathing: document.querySelector('input[name="tense-breathing"]:checked')?.value,
                movementBreaks: document.querySelector('input[name="movement-breaks"]:checked')?.value,
                afterWorkStretch: document.querySelector('input[name="after-work-stretch"]:checked')?.value,
                overexertion: document.querySelector('input[name="overexert"]:checked')?.value,
                discomfortLevel: document.getElementById('discomfort-range')?.value,
                // Add routine duration preference and exercise count
                routineDuration: mapRoutineDurationToDatabase(document.querySelector('input[name="routine-duration"]:checked')?.value),
                // Add timestamp and user details
                timestamp: new Date().toISOString(),
                userId: 'guest' // In a real app, this would be the actual user ID
            };
            
            try {
                // Save questionnaire data using our data service
                const success = await saveDataFunction(formData);
                
                if (success) {
                    // Navigate to completion slide
                    navigateToCompletionSlide();
                } else {
                    showValidationError('There was a problem saving your data. Please try again.');
                }
            } catch (error) {
                console.error('Error submitting questionnaire:', error);
                showValidationError('There was a problem saving your data. Please try again.');
            }
        }
        
        // Map form values to match our CSV database format
        function mapActivityTypeToDatabase(activityValue) {
            const activityMap = {
                'desk-work': 'desk-work',
                'manual-labor': 'physical-labor',
                'standing-job': 'standing',
                'driving': 'driving',
                'crafting': 'handwork',
                'other': 'other'
            };
            
            return activityMap[activityValue] || activityValue;
        }
        
        function mapBodyAreasToDatabase(selectedAreas) {
            const areaMap = {
                'neck': 'neck',
                'shoulders': 'shoulders',
                'upper-back': 'upperback',
                'mid-back': 'midback',
                'lower-back': 'lowerback',
                'wrists': 'wrists',
                'hands': 'hands',
                'hips': 'hips',
                'knees': 'knees',
                'ankles': 'ankles',
                'feet': 'feet',
                'eyes': 'eyes'
            };
            
            return selectedAreas.map(area => areaMap[area] || area);
        }
        
        function mapIntensityToDatabase(intensityValue) {
            const intensityMap = {
                'gentle': 'easy',
                'moderate': 'medium',
                'challenging': 'hard'
            };
            
            return intensityMap[intensityValue] || intensityValue;
        }
        
        function mapRoutineDurationToDatabase(durationValue) {
            // Map the duration value to the database format with exercise count ranges
            const durationMap = {
                'short': {
                    name: 'short',
                    label: '3-5 minutes',
                    minExercises: 9,
                    maxExercises: 15
                },
                'medium': {
                    name: 'medium',
                    label: '10-15 minutes',
                    minExercises: 31,
                    maxExercises: 47
                },
                'long': {
                    name: 'long',
                    label: '15-20 minutes',
                    minExercises: 47,
                    maxExercises: 62
                }
            };
            
            return durationMap[durationValue] || durationMap['medium']; // Default to medium if not specified
        }
        
        function navigateToCompletionSlide() {
            // Hide all slides
            slides.forEach(slide => {
                slide.classList.remove('active');
            });
            
            // Show completion slide
            const completionSlide = document.querySelector('.completion-slide');
            if (completionSlide) {
                completionSlide.classList.add('active');
                
                // Complete progress bar
                progressFill.style.width = '100%';
                
                // Add button to continue to routine page
                const continueButton = document.createElement('a');
                continueButton.href = 'routine.html';
                continueButton.className = 'btn btn-submit';
                continueButton.textContent = 'View Your Routine';
                continueButton.style.marginTop = '20px';
                
                // Add to completion slide
                completionSlide.appendChild(continueButton);
            }
        }
        
        // Add these styles dynamically (could be in CSS file too)
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            
            .shake {
                animation: shake 0.5s ease-in-out;
            }
            
            .checked-animation {
                transition: all 0.2s ease;
                transform: scale(1.05);
            }
        `;
        document.head.appendChild(styleElement);
    });
} 