class ContactForm {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.submitButton = document.getElementById('submit-button');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        this.form.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => this.validateField(input));
        });
    }

    validateField(input) {
        const value = input.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (input.type) {
            case 'email':
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                errorMessage = 'Please enter a valid email address';
                break;
            case 'tel':
                isValid = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(value);
                errorMessage = 'Please enter a valid phone number';
                break;
            default:
                isValid = value.length > 0;
                errorMessage = 'This field is required';
        }

        this.updateFieldValidation(input, isValid, errorMessage);
        return isValid;
    }

    updateFieldValidation(input, isValid, errorMessage) {
        const errorElement = input.parentElement.querySelector('.error-message');
        
        if (!isValid) {
            input.classList.add('invalid');
            if (errorElement) {
                errorElement.textContent = errorMessage;
            } else {
                const error = document.createElement('div');
                error.className = 'error-message';
                error.textContent = errorMessage;
                input.parentElement.appendChild(error);
            }
        } else {
            input.classList.remove('invalid');
            if (errorElement) {
                errorElement.remove();
            }
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // Validate all fields
        const fields = this.form.querySelectorAll('input, textarea');
        let isValid = true;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) {
            return;
        }

        this.submitButton.disabled = true;
        this.submitButton.textContent = 'Sending...';

        try {
            const formData = new FormData(this.form);
            const response = await fetch('/api/contact', {
                method: 'POST',
                body: JSON.stringify(Object.fromEntries(formData)),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            this.showSuccess();
            this.form.reset();

        } catch (error) {
            this.showError(error.message);
        } finally {
            this.submitButton.disabled = false;
            this.submitButton.textContent = 'Send Message';
        }
    }

    showSuccess() {
        const message = document.createElement('div');
        message.className = 'success-message';
        message.textContent = 'Message sent successfully!';
        this.form.appendChild(message);
        setTimeout(() => message.remove(), 5000);
    }

    showError(errorMessage) {
        const message = document.createElement('div');
        message.className = 'error-message';
        message.textContent = errorMessage;
        this.form.appendChild(message);
        setTimeout(() => message.remove(), 5000);
    }
}
