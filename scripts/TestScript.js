// Please convert this to a linked stack, not an array-based stack.
class Stack {
  #array; // Array holding stack elements
  #maxSize; // Maximum number of elements
  #top; // The next available top space, which also represents the current number of elements.

  // Create a stack with a given size.
  constructor(maxSize) {
    this.#maxSize = maxSize;
    this.#array = new Array(maxSize);
    this.#top = 0;
  }

  // Add an element to the top.
  push(element) {
    // Return false if the stack is full.
    if (this.#top === this.#maxSize) {
      return false;
    }
    // Insert element to the next available space and increment the top counter accordingly.
    this.#array[this.#top++] = element;
    return true;
  }

  // Remove and return the element at the top.
  pop() {
    // Return null if the stack is empty.
    if (this.#top === 0) {
      return null;
    }
    // Store the element at the top.
    let topElement = this.#array[this.#top - 1];
    // Remove the element at the top and adjust the top counter accordingly.
    this.#array[--this.#top] = undefined;
    // Return the removed element
    return topElement;
  }

  // Return the element at the top.
  peek() {
    // If there is none, return null.
    if (this.#top === 0) {
      return null;
    }
    // top - 1 is the index of the last element
    return this.#array[this.#top - 1];
  }

  // Return the number of elements.
  length() {
    // top variable keeps track of stack size as well.
    return this.#top;
  }

  // Reverse the stack.
  reverse() {
    // Create an array which will hold the elements in reverse.
    let reversedArray = new Array(this.#maxSize);
    // Iterate through the reversed array.
    for (let i = 0; i < this.#top; i++) {
      // We will assign values from the top of the array to the beginning of the reversedArray.
      // As such, reversedArray traverses forwards, while the current array traverses backwards using i.
      reversedArray[i] = this.#array[this.#top - 1 - i];
    }
    // Now set the current array to the reversed array.
    this.#array = reversedArray;
  }

  // Empty the stack.
  clear() {
    // top tells us the number of elements. When it hits zero, we know the array is empty.
    while (this.#top !== 0) {
      // Use top - 1 as the target index, and let the top element be undefined.
      // Decrement top.
      this.#array[--this.#top] = undefined;
    }
  }

  // Check if the stack has no elements.
  isEmpty() {
    return this.#top === 0;
  }

  // Return the contents of the stack.
  print() {
    // Notify in the case of an empty stack
    if (this.#top === 0) {
      return "The stack is empty.";
    }
    // Create a string to concatenate all values in the stack to it.
    let contents = "";
    // Iterate through the stack up until the last position with an element.
    for (let i = 0; i < this.#top; i++) {
      contents += this.#array[i] + " "; // Concatenate current value to contents.
    }
    // Return final representation of all values in the stack.
    return contents;
  }

  // Utility: Populate the stack with sample values.
  populate() {
    for (let i = 0; i < this.#maxSize; i++) {
      // Push random value to the current position
      this.push(Math.floor(Math.random() * 81723));
    }
  }
}

class Button {
  #htmlElement; // HTML element of button
  #content; // Button's symbol as displayed on the UI.
  constructor(content, htmlElement) {
    this.#content = content;
    this.#htmlElement = htmlElement;
  }
  // Return Inner HTML content
  getContent() {
    return this.#content;
  }
}

/*
  Bugs:
  Problem: Clicking the Arithmetic Operator button again should return the result.
  That is, it should be treated like an equals button
  1. clickDigitButton -> clickArithmeticOperatorButton -> clickDigitButton -> clickArithmeticOperatorButton
  We did it, but it only works once.
  Problem: The decimal number button does nothing. It should add a decimal to the right of the current value.
  Problem: 10 x 2 x 5 - (Turns out the issue is with isCurrentOperationCompleted.)
*/
class Calculator {
  #lastButtonPressed; // The last button that was pressed.
  #currentButton; // The button that is now pressed.
  #currentOperation; // The pending operation.
  #isCurrentOperationCompleted; // The status of the pending operation.
  #currentStack; // A stack that holds all consecutive values in the current calculation.
  #currentValue; // The result that the calculator is currently storing.
  #currentDisplay; // The display of the currentResult.
  #currentDisplayHTMLElement; // The HTML element corresponding to the display output.
  #isInitialized; // Tells if the current display is zero and the result is zero.
  #operators = "x, /, +, -, ., =, C";

  constructor() {
    this.#lastButtonPressed = null;
    this.#currentButton = null;
    this.#currentOperation = null;
    this.#isCurrentOperationCompleted = true;
    this.#currentStack = new Stack(400);
    this.#currentValue = 0;
    this.#currentDisplay = "";
    this.#currentDisplayHTMLElement = document.getElementById("output");
    this.#isInitialized = false;
    this.initialize();
  }

  initialize() {
    // We will get the button grid from the HTML file.
    document
      .querySelector(".button-grid")
      // Then, we will add an event listener that looks for a click.
      .addEventListener("click", (event) => {
        // We find the button clicked by using event.target.
        this.#currentButton = new Button(event.target.innerHTML, event.target);
        // Then we store its HTML content.
        let buttonContent = this.#currentButton.getContent();
        // Set the current operation
        this.#currentOperation = buttonContent;
        // If a number is pressed, we ensure that it is added to the display.
        if (buttonContent.charAt(0) >= "0" && buttonContent.charAt(0) <= "9") {
          // If the last button press was an arithmetic operator,
          // we want to reset the display for the digit inputs of the next operand.
          if (
            this.#lastButtonPressed != null &&
            this.isOperator(this.#lastButtonPressed.getContent())
          ) {
            this.#currentDisplay = "";
          }
          // We convert it to a number and concatenate it to the display.
          this.#currentDisplay += buttonContent;
          // Then we update the current value.
          this.#currentValue = Number(this.#currentDisplay);
          // Then we display it on the UI.
          this.updateDisplay(this.#currentDisplay);
        } else if (this.#operators.includes(buttonContent)) {
          // Otherwise, we will check if the button pressed is an operator.
          this.#isCurrentOperationCompleted = false;
          // If the current operation has not been completed
          // And the same arithmetic operator was pressed again,
          // We will treat it as equals, and thus calculate its result.
          if (
            this.#isCurrentOperationCompleted === false &&
            this.isOperator(buttonContent)
          ) {
            buttonContent = "=";
          }
          // We will examine the button's symbol to decide what operation to complete.
          switch (buttonContent) {
            case "x":
              this.initiateArithmeticOperation("x");
              break;
            case "/":
              this.initiateArithmeticOperation("/");
              break;
            case "+":
              this.initiateArithmeticOperation("+");
              break;
            case "-":
              this.initiateArithmeticOperation("-");
              break;
            case "=":
              this.initiateEqualsOperation();
              break;
            case "C":
              this.reinitialize();
              break;
          }
        }
        // Update the last button clicked.
        this.#lastButtonPressed = this.#currentButton;
      });
  }

  // Resets the calculator values to prepare for the next calculation.
  reinitialize() {
    // Clear value
    this.#currentValue = 0;
    // Set the display to default
    this.#currentDisplay = "0";
    // Clear the stack holding calculation values.
    this.#currentStack.clear();
    // Make the display show zero.
    this.updateDisplay(this.#currentDisplay);
  }

  // Initiates an operation by pushing the value before its button was pressed,
  // And setting the current operation status to the new operator.
  initiateArithmeticOperation(currentOperation) {
    // Push the value to the top of the stack
    this.#currentStack.push(Number(this.#currentValue));
    // Set current operation symbol
    this.#currentOperation = currentOperation;
    // Make known that the operation has started and is pending.
    this.toggleCurrentOperationStatus();
  }

  initiateEqualsOperation() {
    // Push the current value to the operation stack.
    this.#currentStack.push(Number(this.#currentValue));
    // Change the current value and update the display.
    this.#currentValue = this.calculateResult();
    this.#currentDisplay = this.#currentValue;
    this.updateDisplay(this.#currentDisplay);
    // Make sure to register that the operation has been completed.
    this.toggleCurrentOperationStatus();
  }

  // Calculates the result of the current pending operation
  calculateResult() {
    let result;
    let reversedStack;
    switch (this.#currentOperation) {
      case "x":
        // Set result to 1, since we are multiplying
        result = 1;
        // As long as the stack is not empty, we proceed.
        while (!this.#currentStack.isEmpty()) {
          result *= this.#currentStack.pop();
        }
        break;
      case "/":
        // Reverse the stack.
        this.#currentStack.reverse();
        // Start calculating from the top of the stack.
        result = this.#currentStack.pop();
        // Empty out the stack, calculating the division each time.
        while (!this.#currentStack.isEmpty()) {
          // Avoid division by zero.
          if (this.#currentStack.peek() === 0) {
            // Clear the stack.
            this.#currentStack.clear();
            // Set result to NaN.
            result = NaN;
            break;
          } else {
            // Divide the result by the top element, and pop the top element.
            result /= this.#currentStack.pop();
          }
        }
        break;
      case "+":
        result = 0;
        // As long as we have not finished emptying the stack
        while (!this.#currentStack.isEmpty()) {
          // Add the top value to the last value.
          result += this.#currentStack.pop();
        }
        break;
      case "-":
        // Reverse the stack.
        this.#currentStack.reverse();
        // Result starts from the first operand of the subtraction.
        result = this.#currentStack.pop();
        // Now we will proceed with
        // the subtraction operations
        // in their correct order.
        while (!this.#currentStack.isEmpty()) {
          result -= this.#currentStack.pop();
        }
        break;
    }
    return result;
  }

  // Checks if a button's content is an operator.
  isOperator(buttonContent) {
    return this.#operators.includes(buttonContent);
  }
  // Replaces the calculator's output UI with new content.
  updateDisplay(newDisplay) {
    // If the current display shows zero, any updates should replace it.
    if (this.#currentDisplay === "0") {
      this.#currentDisplay = "";
    }
    this.#currentDisplayHTMLElement.innerHTML = newDisplay;
  }
  // [WIP - check logic]
  // Sets the current operation's completion status to on or off.
  toggleCurrentOperationStatus() {
    this.#isCurrentOperationCompleted = !this.#isCurrentOperationCompleted;
  }
  /*
  add() {
    console.log("add");
  }
  subtract() {
    console.log("subtract");
  }
  multiply() {
    console.log("multiply");
  }
  divide() {
    console.log("divide");
  }
  */
  toggleSign() {}
}

const calculator = new Calculator();
