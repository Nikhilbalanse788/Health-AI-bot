// Healthcare Bot Application
class HealthBot {
    constructor() {
        this.currentFlow = null;
        this.sessionData = {};
        this.isTyping = false;
        
        // Bot data from provided JSON
        this.botData = {
            responses: {
                welcome: "👋 Hello! I'm HealthBot, your AI healthcare assistant. I can help you with appointments, basic health questions, and provide general medical information. How can I assist you today?",
                disclaimer: "⚠️ Important: I provide general health information only and cannot diagnose conditions or replace professional medical advice. For medical emergencies, call 911 immediately."
            },
            departments: [
                "General Medicine", "Cardiology", "Dermatology", "Orthopedics",
                "Pediatrics", "Gynecology", "Psychiatry", "Emergency Medicine"
            ],
            commonSymptoms: [
                "headache", "fever", "cough", "sore throat", "stomach pain", "back pain",
                "chest pain", "shortness of breath", "dizziness", "nausea", "fatigue", "rash"
            ],
            emergencySymptoms: [
                "chest pain", "difficulty breathing", "severe bleeding", "unconsciousness",
                "severe head injury", "stroke symptoms", "severe allergic reaction"
            ],
            faqData: [
                {
                    question: "What are your clinic hours?",
                    answer: "Our clinic is open Monday-Friday 8:00 AM to 6:00 PM, and Saturday 9:00 AM to 2:00 PM. We're closed on Sundays."
                },
                {
                    question: "Do you accept insurance?",
                    answer: "We accept most major insurance plans including Medicare, Medicaid, Blue Cross Blue Shield, Aetna, and Cigna. Please call to verify your specific plan."
                },
                {
                    question: "How do I cancel an appointment?",
                    answer: "You can cancel appointments by calling us at least 24 hours in advance, or through our patient portal online."
                },
                {
                    question: "What should I bring to my appointment?",
                    answer: "Please bring a valid ID, insurance cards, list of current medications, and any relevant medical records or test results."
                },
                {
                    question: "Do you offer telemedicine visits?",
                    answer: "Yes, we offer virtual consultations for certain conditions. Ask about telemedicine options when booking your appointment."
                }
            ],
            healthTips: [
                "💧 Stay hydrated - aim for 8 glasses of water daily",
                "🏃‍♂️ Get at least 30 minutes of exercise most days",
                "😴 Maintain 7-9 hours of quality sleep each night",
                "🥗 Eat a balanced diet with plenty of fruits and vegetables",
                "🧼 Wash your hands frequently to prevent illness",
                "😌 Practice stress management through meditation or hobbies",
                "🚫 Avoid smoking and limit alcohol consumption",
                "☀️ Use sunscreen daily to protect your skin"
            ],
            commonMedications: [
                {name: "Acetaminophen (Tylenol)", use: "Pain relief, fever reducer", warning: "Do not exceed 4000mg per day"},
                {name: "Ibuprofen (Advil)", use: "Pain relief, inflammation", warning: "Take with food to prevent stomach upset"},
                {name: "Aspirin", use: "Pain relief, blood thinner", warning: "Not recommended for children under 16"},
                {name: "Benadryl", use: "Allergies, sleep aid", warning: "May cause drowsiness"},
                {name: "Pepto Bismol", use: "Stomach upset, diarrhea", warning: "Do not use if allergic to aspirin"}
            ]
        };

        this.init();
    }

    init() {
        this.bindEvents();
        setTimeout(() => {
            this.showWelcomeMessage();
        }, 500);
    }

    bindEvents() {
        // Chat form submission
        const chatForm = document.getElementById('chatForm');
        if (chatForm) {
            chatForm.addEventListener('submit', (e) => this.handleMessageSubmit(e));
        }

        // Quick action buttons in sidebar
        const actionButtons = document.querySelectorAll('.action-btn');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                this.executeQuickAction(action);
            });
        });

        // Clear chat button
        const clearBtn = document.getElementById('clearChat');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearChat());
        }

        // Modal close events
        const modalCloseButtons = document.querySelectorAll('.modal-close, .modal-backdrop');
        modalCloseButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.closeModal(e));
        });

        // Prevent modal close when clicking inside modal content
        const modalContents = document.querySelectorAll('.modal-content');
        modalContents.forEach(content => {
            content.addEventListener('click', (e) => e.stopPropagation());
        });

        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    showWelcomeMessage() {
        this.addBotMessage(this.botData.responses.welcome);
        setTimeout(() => {
            this.addBotMessage(this.botData.responses.disclaimer);
        }, 1000);
        setTimeout(() => {
            this.showQuickStartButtons();
        }, 2000);
    }

    showQuickStartButtons() {
        const quickButtons = `
            <div class="quick-responses">
                <button class="quick-response-btn" onclick="window.healthBot.executeQuickAction('symptoms')">
                    🩺 Check Symptoms
                </button>
                <button class="quick-response-btn" onclick="window.healthBot.executeQuickAction('appointment')">
                    📅 Book Appointment
                </button>
                <button class="quick-response-btn" onclick="window.healthBot.executeQuickAction('faq')">
                    ❓ Common Questions
                </button>
                <button class="quick-response-btn" onclick="window.healthBot.executeQuickAction('tips')">
                    💡 Health Tips
                </button>
            </div>
        `;
        this.addBotMessage("Here are some things I can help you with:", quickButtons);
    }

    handleMessageSubmit(e) {
        e.preventDefault();
        const input = document.getElementById('messageInput');
        const message = input.value.trim();
        
        if (!message) return;

        this.addUserMessage(message);
        input.value = '';
        
        // Process message without async issues
        this.processUserMessage(message);
    }

    processUserMessage(message) {
        this.showTyping();
        
        // Simulate processing delay
        setTimeout(() => {
            const lowerMessage = message.toLowerCase();
            
            // Check for emergency keywords
            if (this.checkForEmergency(lowerMessage)) {
                this.handleEmergency();
                return;
            }

            // Check for symptoms
            if (this.containsSymptoms(lowerMessage)) {
                this.handleSymptomCheck(message);
                return;
            }

            // Check for appointment requests
            if (lowerMessage.includes('appointment') || lowerMessage.includes('book') || lowerMessage.includes('schedule')) {
                this.handleAppointmentRequest();
                return;
            }

            // Check for medication queries
            if (lowerMessage.includes('medication') || lowerMessage.includes('medicine') || lowerMessage.includes('drug')) {
                this.handleMedicationQuery(message);
                return;
            }

            // Check for FAQ-related queries
            if (lowerMessage.includes('hours') || lowerMessage.includes('insurance') || lowerMessage.includes('cancel')) {
                this.handleFAQQuery(lowerMessage);
                return;
            }

            // Default response
            this.addBotMessage("I understand you're asking about: \"" + message + "\". Let me help you with that. You can:");
            setTimeout(() => {
                this.showQuickStartButtons();
            }, 500);
        }, 1000);
    }

    checkForEmergency(message) {
        const emergencyKeywords = ['emergency', '911', 'urgent', 'severe pain', 'cant breathe', 'chest pain', 'heart attack', 'stroke'];
        return emergencyKeywords.some(keyword => message.includes(keyword));
    }

    containsSymptoms(message) {
        return this.botData.commonSymptoms.some(symptom => message.includes(symptom));
    }

    executeQuickAction(action) {
        switch (action) {
            case 'symptoms':
                this.handleSymptomChecker();
                break;
            case 'appointment':
                this.handleAppointmentBooking();
                break;
            case 'faq':
                this.handleFAQ();
                break;
            case 'emergency':
                this.handleEmergency();
                break;
            case 'medications':
                this.handleMedications();
                break;
            case 'tips':
                this.handleHealthTips();
                break;
        }
    }

    handleSymptomChecker() {
        this.showTyping();
        setTimeout(() => {
            this.addBotMessage("I can help you understand your symptoms better. Please note that this is not a medical diagnosis - always consult a healthcare professional for medical advice.");
            
            setTimeout(() => {
                this.addBotMessage("What symptoms are you experiencing? Please describe them as specifically as possible.");
                this.currentFlow = 'symptom-check';
            }, 1000);
        }, 800);
    }

    handleSymptomCheck(symptoms) {
        const lowerSymptoms = symptoms.toLowerCase();
        let response = "Based on your symptoms: \"" + symptoms + "\", here's some general guidance:\n\n";
        
        // Check for emergency symptoms
        const hasEmergencySymptoms = this.botData.emergencySymptoms.some(symptom => 
            lowerSymptoms.includes(symptom)
        );
        
        if (hasEmergencySymptoms) {
            this.addBotMessage("🚨 **IMPORTANT**: Your symptoms may require immediate medical attention. Please consider calling 911 or visiting the nearest emergency room.");
            setTimeout(() => {
                this.showEmergencyModal();
            }, 500);
            return;
        }
        
        // Provide general guidance based on symptoms
        if (lowerSymptoms.includes('fever') || lowerSymptoms.includes('headache')) {
            response += "• Rest and stay hydrated\n• Consider over-the-counter pain relievers\n• Monitor your temperature\n";
        }
        
        if (lowerSymptoms.includes('cough') || lowerSymptoms.includes('sore throat')) {
            response += "• Stay hydrated with warm liquids\n• Use throat lozenges\n• Rest your voice\n";
        }
        
        response += "\n**When to seek medical care:**\n";
        response += "• Symptoms worsen or don't improve after 3-5 days\n";
        response += "• You develop a high fever (over 103°F)\n";
        response += "• You have difficulty breathing\n";
        response += "• You feel concerned about your symptoms\n\n";
        response += "Would you like me to help you book an appointment with a healthcare provider?";
        
        this.addBotMessage(response);
        
        setTimeout(() => {
            const followUpButtons = `
                <div class="quick-responses">
                    <button class="quick-response-btn" onclick="window.healthBot.executeQuickAction('appointment')">
                        📅 Book Appointment
                    </button>
                    <button class="quick-response-btn" onclick="window.healthBot.executeQuickAction('emergency')">
                        🚨 Emergency Help
                    </button>
                </div>
            `;
            this.addBotMessage("What would you like to do next?", followUpButtons);
        }, 1000);
    }

    handleAppointmentBooking() {
        this.addBotMessage("I'd be happy to help you book an appointment. Let me open the appointment form for you.");
        setTimeout(() => {
            this.showAppointmentForm();
        }, 500);
    }

    handleAppointmentRequest() {
        this.addBotMessage("I'd be happy to help you book an appointment. Let me gather some information from you.");
        setTimeout(() => {
            this.showAppointmentForm();
        }, 1000);
    }

    showAppointmentForm() {
        const formHTML = `
            <form id="appointmentForm">
                <div class="form-section">
                    <h3>Personal Information</h3>
                    <div class="form-group">
                        <label class="form-label" for="patientName">Full Name *</label>
                        <input type="text" id="patientName" class="form-control" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="patientPhone">Phone Number *</label>
                            <input type="tel" id="patientPhone" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="patientEmail">Email</label>
                            <input type="email" id="patientEmail" class="form-control">
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>Appointment Details</h3>
                    <div class="form-group">
                        <label class="form-label" for="department">Department *</label>
                        <select id="department" class="form-control" required>
                            <option value="">Select Department</option>
                            ${this.botData.departments.map(dept => `<option value="${dept}">${dept}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="appointmentDate">Preferred Date *</label>
                            <input type="date" id="appointmentDate" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="appointmentTime">Preferred Time *</label>
                            <select id="appointmentTime" class="form-control" required>
                                <option value="">Select Time</option>
                                <option value="09:00">9:00 AM</option>
                                <option value="10:00">10:00 AM</option>
                                <option value="11:00">11:00 AM</option>
                                <option value="14:00">2:00 PM</option>
                                <option value="15:00">3:00 PM</option>
                                <option value="16:00">4:00 PM</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="appointmentReason">Reason for Visit</label>
                        <textarea id="appointmentReason" class="form-control" rows="3" placeholder="Brief description of your concern..."></textarea>
                    </div>
                </div>
                
                <div class="form-actions" style="display: flex; gap: 12px; margin-top: 24px;">
                    <button type="submit" class="btn btn--primary">Book Appointment</button>
                    <button type="button" class="btn btn--secondary" onclick="window.healthBot.closeModal()">Cancel</button>
                </div>
            </form>
        `;
        
        this.showModal("📅 Book Appointment", formHTML);
        
        // Bind form submission with proper timing
        setTimeout(() => {
            const form = document.getElementById('appointmentForm');
            if (form) {
                form.addEventListener('submit', (e) => this.handleAppointmentSubmit(e));
                
                // Set minimum date to today
                const dateInput = document.getElementById('appointmentDate');
                if (dateInput) {
                    const today = new Date().toISOString().split('T')[0];
                    dateInput.min = today;
                }
            }
        }, 200);
    }

    handleAppointmentSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('patientName').value,
            phone: document.getElementById('patientPhone').value,
            email: document.getElementById('patientEmail').value,
            department: document.getElementById('department').value,
            date: document.getElementById('appointmentDate').value,
            time: document.getElementById('appointmentTime').value,
            reason: document.getElementById('appointmentReason').value
        };
        
        this.closeModal();
        
        // Show confirmation
        const confirmationMessage = `
            ✅ **Appointment Request Confirmed!**
            
            **Patient:** ${formData.name}
            **Department:** ${formData.department}
            **Date:** ${new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            **Time:** ${this.formatTime(formData.time)}
            **Phone:** ${formData.phone}
            
            We'll contact you within 24 hours to confirm your appointment. Please arrive 15 minutes early and bring your insurance card and ID.
            
            **Need to cancel?** Call us at (555) 123-4567 at least 24 hours in advance.
        `;
        
        this.addBotMessage(confirmationMessage);
    }

    formatTime(time24) {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    }

    handleFAQ() {
        this.showTyping();
        setTimeout(() => {
            this.addBotMessage("Here are answers to frequently asked questions:");
            
            this.botData.faqData.forEach((faq, index) => {
                setTimeout(() => {
                    const faqHTML = `
                        <div class="faq-item">
                            <div class="faq-question">❓ ${faq.question}</div>
                            <div class="faq-answer">${faq.answer}</div>
                        </div>
                    `;
                    this.addBotMessage("", faqHTML);
                }, (index + 1) * 500);
            });
            
            setTimeout(() => {
                this.addBotMessage("Do you have any other questions? Feel free to ask me anything!");
            }, (this.botData.faqData.length + 1) * 500);
        }, 800);
    }

    handleFAQQuery(query) {
        const matchingFAQ = this.botData.faqData.find(faq => 
            query.includes(faq.question.toLowerCase().split(' ')[2]) // Match key words
        );
        
        if (matchingFAQ) {
            const faqHTML = `
                <div class="faq-item">
                    <div class="faq-question">❓ ${matchingFAQ.question}</div>
                    <div class="faq-answer">${matchingFAQ.answer}</div>
                </div>
            `;
            this.addBotMessage("Here's what I found:", faqHTML);
        } else {
            this.addBotMessage("Let me show you all our frequently asked questions that might help:");
            this.handleFAQ();
        }
    }

    handleEmergency() {
        this.addBotMessage("🚨 Opening emergency information for you right away!");
        setTimeout(() => {
            this.showEmergencyModal();
        }, 500);
    }

    showEmergencyModal() {
        const emergencyModal = document.getElementById('emergencyModal');
        if (emergencyModal) {
            emergencyModal.classList.remove('hidden');
            emergencyModal.setAttribute('aria-hidden', 'false');
            
            // Focus management
            const closeButton = emergencyModal.querySelector('.modal-close');
            if (closeButton) closeButton.focus();
        }
    }

    handleMedications() {
        this.showTyping();
        setTimeout(() => {
            this.addBotMessage("I can provide information about common over-the-counter medications. Here are some frequently asked about medications:");
            
            this.botData.commonMedications.forEach((med, index) => {
                setTimeout(() => {
                    const medHTML = `
                        <div class="medication-info">
                            <div class="medication-name">${med.name}</div>
                            <div class="medication-use"><strong>Used for:</strong> ${med.use}</div>
                            <div class="medication-warning"><strong>⚠️ Warning:</strong> ${med.warning}</div>
                        </div>
                    `;
                    this.addBotMessage("", medHTML);
                }, (index + 1) * 300);
            });
            
            setTimeout(() => {
                this.addBotMessage("⚠️ **Important Reminder**: Always consult with your healthcare provider or pharmacist before starting any new medication, even over-the-counter ones. They can check for interactions with your current medications and ensure it's safe for you.");
            }, (this.botData.commonMedications.length + 1) * 300);
        }, 800);
    }

    handleMedicationQuery(query) {
        const queryLower = query.toLowerCase();
        const matchingMed = this.botData.commonMedications.find(med => 
            queryLower.includes(med.name.toLowerCase()) || 
            queryLower.includes(med.name.split('(')[1]?.replace(')', '').toLowerCase())
        );
        
        if (matchingMed) {
            const medHTML = `
                <div class="medication-info">
                    <div class="medication-name">${matchingMed.name}</div>
                    <div class="medication-use"><strong>Used for:</strong> ${matchingMed.use}</div>
                    <div class="medication-warning"><strong>⚠️ Warning:</strong> ${matchingMed.warning}</div>
                </div>
            `;
            this.addBotMessage("Here's information about that medication:", medHTML);
        } else {
            this.addBotMessage("I don't have specific information about that medication. Let me show you information about common medications I can help with:");
            this.handleMedications();
        }
    }

    handleHealthTips() {
        this.showTyping();
        setTimeout(() => {
            this.addBotMessage("Here are some daily health tips to keep you healthy and feeling great:");
            
            // Show random tips
            const shuffledTips = [...this.botData.healthTips].sort(() => Math.random() - 0.5);
            const selectedTips = shuffledTips.slice(0, 5);
            
            selectedTips.forEach((tip, index) => {
                setTimeout(() => {
                    const tipHTML = `<div class="health-tip">${tip}</div>`;
                    this.addBotMessage("", tipHTML);
                }, (index + 1) * 400);
            });
            
            setTimeout(() => {
                this.addBotMessage("Remember, small daily habits can make a big difference in your overall health! Is there anything specific about health and wellness you'd like to know more about?");
            }, (selectedTips.length + 1) * 400);
        }, 800);
    }

    addUserMessage(text) {
        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const messageHTML = `
            <div class="message message--user">
                <div class="message-content">
                    <div>${text}</div>
                    <div class="message-time">${time}</div>
                </div>
                <div class="message-avatar">👤</div>
            </div>
        `;
        
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.insertAdjacentHTML('beforeend', messageHTML);
            this.scrollToBottom();
        }
    }

    addBotMessage(text, additionalHTML = '') {
        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const messageHTML = `
            <div class="message message--bot">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    ${text ? `<div>${text.replace(/\n/g, '<br>')}</div>` : ''}
                    ${additionalHTML}
                    <div class="message-time">${time}</div>
                </div>
            </div>
        `;
        
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.insertAdjacentHTML('beforeend', messageHTML);
            this.scrollToBottom();
        }
        this.hideTyping();
    }

    showTyping() {
        if (this.isTyping) return;
        this.isTyping = true;
        
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.classList.remove('hidden');
        }
    }

    hideTyping() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.classList.add('hidden');
        }
        this.isTyping = false;
    }

    scrollToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    showModal(title, content) {
        const modal = document.getElementById('formModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        if (modal && modalTitle && modalBody) {
            modalTitle.textContent = title;
            modalBody.innerHTML = content;
            modal.classList.remove('hidden');
            modal.setAttribute('aria-hidden', 'false');
            
            // Focus management
            const firstFocusable = modal.querySelector('input, select, textarea, button');
            if (firstFocusable) firstFocusable.focus();
        }
    }

    closeModal(e) {
        if (e && e.target.closest('.modal-content') && !e.target.classList.contains('modal-close')) {
            return;
        }
        
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.add('hidden');
            modal.setAttribute('aria-hidden', 'true');
        });
        
        // Return focus to message input
        const messageInput = document.getElementById('messageInput');
        if (messageInput) messageInput.focus();
    }

    clearChat() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }
        this.currentFlow = null;
        this.sessionData = {};
        this.showWelcomeMessage();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.healthBot = new HealthBot();
});