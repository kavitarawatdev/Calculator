class Calculator {
    constructor() {
        this.inputDisplay = document.getElementById('calculation-input');
        this.resultDisplay = document.getElementById('calculation-result');
        this.errorDisplay = document.getElementById('error-message');
        this.buttons = document.querySelectorAll('.btn');
        this.currentInput = '';
        this.lastResult = '';
        this.isError = false;
        
        this.initEventListeners();
        this.initKeyboardSupport();
    }

    // initialize event listeners for buttons
    initEventListeners() {
        this.buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleButtonClick(e.target.id, e.target.textContent);
            });
        });
    }

    // initialize keyboard support
    initKeyboardSupport() {
        document.addEventListener('keydown', (e) => {
            e.preventDefault();
            const key = e.key;

            // Map keyboard keys to button IDs
            const keyMap = {
                '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
                '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine',
                '+': 'addition', '-': 'subtraction', '*': 'multiplication', 
                '/': 'division', '=': 'equals', 'Enter': 'equals',
                '.': 'decimal', '(': 'open-brac', ')': 'close-brac',
                '%': 'percentage', '^': 'exponent',
                'Backspace': 'delete', 'Delete': 'delete',
                'Escape': 'reset', 'c': 'reset', 'C': 'reset'
            };
            
            if (keyMap[key]) {
                const buttonId = keyMap[key];
                const button = document.getElementById(buttonId);
                if (button) {
                    button.click();
                    button.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        button.style.transform = '';
                    }, 100);
                }
            }
        });
    }

    // handle button clicks
    handleButtonClick(id, content) {
        // Ignore clicks if there's an error
        if (this.isError && id !== 'reset') {
            return;
        }

        this.hideError(); // Hide error message
        // Process button click
        switch (id) {
            case 'delete':
                this.deleteLast(); // Delete last character
                break;
            case 'reset':
                this.clear(); // Clear all input
                break;
            case 'equals':
                this.calculate(); // Calculate result
                break;
            case 'sin':
            case 'cos':
            case 'tan':
                this.addFunction(content); // Add trigonometric function
                break;
            default:
                this.addToInput(content); // Add to current input
        }

        this.updateDisplay(); // Update the display
    }

    // Add to current input
    addToInput(value) {
        // Handle special symbols
        const symbolMap = {
            '×': '*',
            '÷': '/',
            '−': '-',
            'π': 'π'
        };
        
        const processedValue = symbolMap[value] || value; 
        this.currentInput += processedValue; 
        
        // Real-time calculation for preview
        if (this.currentInput && !this.currentInput.includes('=')) {
            this.calculatePreview();
        }
    }

    // Add trigonometric function
    addFunction(func) {
        this.currentInput += func + '('; // Add function with opening parenthesis
        this.calculatePreview();
    }

    // Delete last character from current input
    // Delete character at cursor (or last character if no cursor available)
    deleteLast() {
        const inputElement = this.inputDisplay; // input field

        if (inputElement.selectionStart != null) {
            const start = inputElement.selectionStart;
            const end = inputElement.selectionEnd;

            if (start > 0 || start !== end) {
                // Delete character(s) before/within selection
                this.currentInput = this.currentInput.slice(0, start - (start === end ? 1 : 0)) +
                    this.currentInput.slice(end);

                // Update the input box
                inputElement.value = this.currentInput;

            // Reset cursor position
                const newPos = start - (start === end ? 1 : 0);
                inputElement.setSelectionRange(newPos, newPos);

                this.calculatePreview();
                return;
            }
        }

        // fallback: delete last character if no cursor
        if (this.currentInput.length > 0) {
            this.currentInput = this.currentInput.slice(0, -1);
            this.calculatePreview();
        }
    }


    // Clear all input
    clear() {
        this.currentInput = '';
        this.lastResult = '';
        this.isError = false;
        this.hideError();
    }

    // Calculate result
    calculate() {
        if (!this.currentInput) return;
        
        try {
            const result = this.evaluateExpression(this.currentInput);
            this.lastResult = this.formatResult(result);
            this.currentInput = this.lastResult;
        } catch (error) {
            this.showError('Invalid expression');
            this.isError = true;
        }
    }

    // Calculate preview result
    calculatePreview() {
        try {
            if (this.currentInput && this.isValidExpression(this.currentInput)) {
                const result = this.evaluateExpression(this.currentInput);
                this.lastResult = this.formatResult(result);
            }
        } catch (error) {
            // Silent fail for preview
            this.lastResult = '';
        }
    }

    // Validate expression
    isValidExpression(expr) {
        // Check if expression is complete enough for evaluation
        const openParens = (expr.match(/\(/g) || []).length;
        const closeParens = (expr.match(/\)/g) || []).length;
        
        // Don't evaluate if there are unclosed parentheses or mismatched parentheses
        if (openParens !== closeParens) return false;
        // Don't evaluate if the expression ends with a function name followed by an opening parenthesis
        if (/\w+\($/.test(expr.trim())) return false;
        // Don't evaluate if the expression ends with a mathematical operator
        if (/[+\-*/^%]$/.test(expr.trim())) return false;
        
        return true;
    }

    // Evaluate mathematical expression
    evaluateExpression(expression) {
        // Enhanced expression processor
        let processed = expression
            .replace(/×/g, '*')// Handle multiplication
            .replace(/÷/g, '/')// Handle division
            .replace(/−/g, '-')// Handle subtraction
            .replace(/π/g, Math.PI.toString())// Handle π   
            .replace(/(\d+(?:\.\d+)?)%/g, '($1*0.01)') // Handle percentage
            .replace(/\^/g, '**')// Handle exponents
            .replace(/(\d*(?:\.\d+)?)√(\d+(?:\.\d+)?)/g, (match, coeff, num) => { // Handle square roots
                const coefficient = coeff || '1';
                return `(${coefficient}*Math.sqrt(${num}))`;
            })
            .replace(/√(\d+(?:\.\d+)?)/g, 'Math.sqrt($1)')// Handle square roots
            // Handle trigonometric functions
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            // Handle degree conversion
            .replace(/(\d+(?:\.\d+)?)deg/g, '($1*Math.PI/180)')
            // Handle radian conversion
            .replace(/(\d+(?:\.\d+)?)rad/g, '($1*180/Math.PI)')      
            // Handle factorial
            .replace(/(\d+)!/g, (match, num) => this.factorial(parseInt(num)).toString())
            // Handle implicit multiplication with π
            .replace(/(\d+(?:\.\d+)?)π/g, '($1*' + Math.PI + ')');

        // Evaluate the processed expression
        return Function('"use strict"; return (' + processed + ')')();
    }

    // Calculate factorial
    factorial(n) {
        if (n < 0) throw new Error('Factorial of negative number');
        if (n === 0 || n === 1) return 1;
        if (n > 170) throw new Error('Factorial too large');
        
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    // Format result
    formatResult(result) {
        if (typeof result !== 'number' || !isFinite(result)) {
            throw new Error('Invalid result');
        }
        
        // Handle very small numbers
        if (Math.abs(result) < 1e-10 && result !== 0) {
            return '0';
        }
        
        // Handle very large numbers
        if (Math.abs(result) > 1e15) {
            return result.toExponential(6);
        }
        
        // Round to avoid floating point precision issues
        const rounded = Math.round(result * 1e10) / 1e10;
        
        // Format the number appropriately
        if (rounded === Math.floor(rounded)) {
            return rounded.toString();
        } else {
            return parseFloat(rounded.toFixed(10)).toString();
        }
    }

    // Show error message
    showError(message) {
        this.errorDisplay.textContent = message;
        this.errorDisplay.classList.add('show');
        setTimeout(() => this.hideError(), 3000);
    }

    // Hide error message
    hideError() {
        this.errorDisplay.classList.remove('show');
    }

    // Update display
    updateDisplay() {
        this.inputDisplay.value = this.currentInput || '0';
        this.resultDisplay.value = this.lastResult || '';
        
        // Auto-scroll to show the end of long expressions
        this.inputDisplay.scrollLeft = this.inputDisplay.scrollWidth;
        this.resultDisplay.scrollLeft = this.resultDisplay.scrollWidth;
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});

// Add touch feedback for mobile devices
if ('ontouchstart' in window) {
    document.querySelectorAll('.btn').forEach(button => {

        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', function() {
            this.style.transform = '';
        });
    });
}