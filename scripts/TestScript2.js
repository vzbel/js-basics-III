class Node {
  #data; // The node's data
  #next; // A pointer to some next node

  // Create node with data
  constructor(data) {
    this.#data = data;
  }

  // Return node data
  data() {
    return this.#data;
  }

  // Return node next
  next() {
    return this.#next;
  }

  // Set node data
  setData(data) {
    this.#data = data;
  }

  // Set node next
  setNext(next) {
    this.#next = next;
  }
}

class Queue {
  #front; // Front node
  #back; // Back node
  #current; // Current node (used for iteration)
  #size; // Current size

  // Create new queue
  constructor() {
    this.#front = null;
    this.#back = null;
    this.#current = null;
    this.#size = 0;
  }

  // Reinitialize the queue
  clear() {
    this.#front = null;
    this.#back = null;
    this.#current = null;
    this.#size = 0;
  }

  // Append data to the back of the queue
  // (The provided data parameter will be used to make the node)
  enqueue(data) {
    // Create a new node with the given data.
    const newNode = new Node(data);

    // If the queue is empty
    if (this.#size === 0) {
      // The node will be both the front and the back.
      this.#front = newNode;
      this.#back = newNode;
      this.#size++; // Increase queue size
      return true; // Success
    }

    // Make the back node's next pointer refer to the new node.
    this.#back.setNext(newNode);
    // The back is now the newNode.
    this.#back = newNode;

    this.#size++; // Increase queue size
    return true; // Success
  }

  // Remove and return the element at the front
  dequeue() {
    // If the queue is empty before dequeue, there is no element to dequeue
    if (this.#size === 0) {
      return null;
    }
    // Save original front element's data
    const originalFrontData = this.#front.data();
    // Save next element
    const newFront = this.#front.next();
    // Set front's next to null
    this.#front.setNext(null);
    // Let the original front's next be the new front.
    this.#front = newFront;
    // Decrease queue size
    this.#size--;
    // If the queue is now empty after dequeue, make sure to remove back pointer
    if (this.#size === 0) {
      this.#back = null;
    }
    // Return original front element's data
    return originalFrontData;
  }

  // Return the data at the front
  peek() {
    // If the queue is empty, return null.
    if (this.#size === 0) {
      return null;
    }
    // Return front node data.
    return this.#front.data();
  }

  // Return the queue size
  length() {
    return this.#size;
  }

  // Check if the queue is empty
  isEmpty() {
    return this.#size === 0;
  }

  // Return a string with the queue's contents
  contents() {
    // If the queue is empty
    if (this.#size === 0) {
      return "The queue is empty.";
    }
    // Create string that will holds queue contents
    let queueContents = "";

    // Start from the beginning
    this.#current = this.#front;

    // Iterate until the end is reached.
    while (this.#current !== undefined) {
      // Append data to the contents string
      queueContents += `${this.#current.data()} `;
      // Move to the next node
      this.#current = this.#current.next();
    }
    // Return the final string.
    return queueContents;
  }

  // Populate the queue with sample data
  populate(numberOfElements, sampleDataMultiplier) {
    for (let i = 0; i < numberOfElements; i++) {
      this.enqueue(Math.floor(Math.random() * sampleDataMultiplier));
    }
  }
}

class Calculator {
  // The HTML element holding the display content.
  // Please do not change this. If you want to change the calculator's display, first change this.#displayText and then updateDisplay(this.#displayText).
  #displayHTML = document.getElementById("output");

  // Symbols for digit, arithmetic operator, equals, decimal, and reset buttons.
  #digits = "0123456789";
  #operators = "x, /, +, -";
  #equalsButton = "=";
  #decimalButton = ".";
  #resetButton = "C";

  #displayText = ""; // Current display content.
  #operandQueue; // Queue that holds values to be processed / used for calculations.
  #operationQueue; // Queue that holds operations to be performed.
  #lastButtonPressed; // The symbol for the last button pressed.

  // Create new calculator
  constructor() {
    this.#operandQueue = new Queue();
    this.#operationQueue = new Queue();
    this.initialize();
  }

  // Initializes the main button event listener to begin calculations.
  initialize() {
    // Given some container with buttons,
    // We set up an event listener for a click, which activates the arrow function.
    // We will use event delegation to avoid creating event listeners for each button.
    document
      .querySelector(".button-grid")
      .addEventListener("click", (event) => {
        // We will extract the innerHTML
        // from the button that was pressed (That is, event.target)
        const buttonContent = event.target.innerHTML;
        // Go and process the button press. Whether operation, digit, or reset, decimal, equals, etc.
        this.handleButtonPress(buttonContent);
      });
  }

  // Handles the button pressed. The button click event listener should call this when it is activated.
  handleButtonPress(buttonContent) {
    // Check if the button pressed was a digit
    if (this.isButtonContentOfType(this.#digits, buttonContent)) {
      this.pressDigitButton(buttonContent);
    }
    // Else check if the button pressed was an arithmetic operator.
    else if (this.isButtonContentOfType(this.#operators, buttonContent)) {
      this.pressOperatorButton(buttonContent);
    } else if (this.isButtonContentOfType(this.#equalsButton, buttonContent)) {
      // Add the current value to the operand queue.
      this.#operandQueue.enqueue(Number(this.#displayText));
      // Calculate the result
      this.calculateResult(this.#operationQueue.peek());
    } else if (this.isButtonContentOfType(this.#decimalButton, buttonContent)) {
    } else if (this.isButtonContentOfType(this.#resetButton, buttonContent)) {
    }
    // In all cases keep track of what button was pressed.
    this.#lastButtonPressed = buttonContent;
  }

  // Begins operator button operations
  pressOperatorButton(buttonContent) {
    // We must now calculate the result
    // Add the operation to the its queue as well.
    this.#operationQueue.enqueue(buttonContent);
    // Add the current value to the operand queue.
    this.#operandQueue.enqueue(Number(this.#displayText));
    // If we're waiting for a result, we calculate it.
    if (this.isAwaitingResult()) {
      this.calculateResult(buttonContent);
    }
  }

  // Begins digit button operations
  pressDigitButton(buttonContent) {
    // If the last button pressed was an arithmetic operator and a digit button has been pressed now,
    // We must reset the display to make room for the new value being inputted by the user.
    if (this.isButtonContentOfType(this.#operators, this.#lastButtonPressed)) {
      this.#displayText = "";
    }
    // Add the button content to the display text.
    this.#displayText += buttonContent;
    // Update the display to reflect the changes on the UI.
    this.updateDisplay(this.#displayText);
  }

  // Calculates the result of the current operation, depending on what caller is seeking a result
  calculateResult(caller) {
    // final result of calculation, we start from the first element in the operand queue.
    let result = this.#operandQueue.dequeue();
    // Determine what operation to perform.
    switch (caller) {
      case "x":
        // Calculate the rest until the queue is empty.
        while (!this.#operandQueue.isEmpty()) {
          result *= this.#operandQueue.dequeue();
        }
        break;
      case "/":
        // Calculate the rest until the queue is empty.
        while (!this.#operandQueue.isEmpty()) {
          result /= this.#operandQueue.dequeue();
        }
        break;
      case "+":
        // Calculate the result until the queue is empty.
        while (!this.#operandQueue.isEmpty()) {
          result += this.#operandQueue.dequeue();
        }
        break;
      case "-":
        // Calculate the result until the queue is empty.
        while (!this.#operandQueue.isEmpty()) {
          result -= this.#operandQueue.dequeue();
        }
        break;
    }
    // In all cases, dequeue the operation from the operation queue because it is now complete.
    this.#operationQueue.dequeue();
    // Update the display with the calculated result.
    this.#displayText = `${result}`;
    this.updateDisplay(this.#displayText);
  }
  // Checks if an operation is awaiting a result (usually before proceeding to further calculations)
  isAwaitingResult() {
    return this.#operandQueue.length() > 1;
  }

  // Checks if some given button's content is of a given type.
  // The caller must provide a string variable containing all the valid characters for comparison.
  isButtonContentOfType(validTypeCharacters, buttonContent) {
    return validTypeCharacters.includes(buttonContent);
  }

  // Update the calculator's display.
  updateDisplay(newDisplay) {
    // Access the innerHTML of the output HTML element.
    // The newDisplay will be assigned to it.
    this.#displayHTML.innerHTML = newDisplay;
  }
}

const calculator = new Calculator();
