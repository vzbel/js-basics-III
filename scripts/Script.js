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
  // Legend:
  // @ denotes a method or line of code with a rigid structure that should remain largely unchanged.
  // Itinerary:
  // Working: Pressing digits and the decimal button updates the display properly.
  // WIP: Make sure that the reset button clears any queues.

  // HTML properties (Classes, elements, etc).
  #displayElement = document.querySelector(".output"); // This variable holds the display HTML element.
  #buttonGridElement = document.querySelector(".button-grid"); // This variable holds the button grid HTML element.
  #operatorButtonClass = ".operator-button"; // The class which denotes an operator button.

  // Calculator properties
  #operandQueue; // Queue holding operands to be calculated.
  #calculatorDisplay = "0"; // @ Current display of the calculator.
  #lastButtonPressed; // The previous button press.

  constructor() {
    this.#operandQueue = new Queue();
    this.initializeEventListeners();
  }

  // @ Initialize the main event listeners, which seek a button click.
  initializeEventListeners() {
    // Set up event delegation to determine which calculator button was pressed.
    this.#buttonGridElement.addEventListener("click", (event) => {
      // Determine the button that was clicked (event.target) and pass it along for further processing.
      this.handleButtonPress(event.target);
    });
  }

  // Process a button pressed by the user. The parameter must be a "click" event target.
  handleButtonPress(buttonElement) {
    // First ensure that the parameter passed in is a button.
    if (this.isButton(buttonElement)) {
      // Save the button's data action. (multiply, divide, add, undefined (if digit), etc.)
      const dataAction = buttonElement.dataset.action;
      // Save the button's text content (+, -, *, digits 0-9 etc).
      const buttonTextContent = buttonElement.textContent;

      // Choose further processing based on the button's data action.
      // Note: digits do not have a data action. Thus, !dataAction handles digit button presses.
      if (!dataAction) {
        this.pressDigitButton(buttonTextContent); // @ Process the digit button, passing in the digit string as a parameter.
      } else if (dataAction === "clear") {
        this.pressClearButton(); // @ Reinitialize the display.
      } else if (dataAction === "calculate") {
        // console.log(dataAction);
      } else if (dataAction === "decimal") {
        this.pressDecimalButton(); // @ Append a decimal to the display.
      } else if (this.isOperator(buttonElement)) {
        this.pressOperatorButton();
      }

      // In all cases, assign the pressed button as the last button press.
      this.#lastButtonPressed = buttonElement;
    }
  }

  // Processes an operator button press.
  pressOperatorButton() {
    // If the last button pressed was an operator, we will NOT add the current value to the operand queue.
    if (this.isOperator(this.#lastButtonPressed)) {
      console.log(
        "The last button press was an operator. No need to add the display to the queue again."
      );
    } else {
      // We want to add the element currently on the display to the operand queue.
      this.#operandQueue.enqueue(Number(this.#calculatorDisplay));
    }

    // If after adding an element to the operand queue,
    // the queue contains two or more values,
    // Then a calculated result is expected by the operator button press.
    // We will call a function made specifically for calculating results.
    if (this.#operandQueue.length() >= 2) {
      console.log(this.#operandQueue.contents());
    }
  }

  // @ Processes a digit button press.
  pressDigitButton(buttonTextContent) {
    // If the calculator display is zero or the last button was
    // an operator, the newly pressed digit must replace the current display.
    if (
      this.#calculatorDisplay === "0" ||
      this.isOperator(this.#lastButtonPressed)
    ) {
      this.updateDisplay(buttonTextContent);
    } else {
      // Otherwise, append the digit to the current display.
      this.updateDisplay(this.#calculatorDisplay + buttonTextContent);
    }
  }

  // @ Processes a clear/reset button press.
  pressClearButton() {
    this.updateDisplay("0"); // Set display to zero.
  }

  // @ Processes a decimal button press.
  pressDecimalButton() {
    // Proceed only if the display does not already contain a decimal.
    if (!this.#calculatorDisplay.includes(".")) {
      this.updateDisplay(this.#calculatorDisplay + "."); // Append a decimal to the current display.
    }
  }

  // @ Checks if a button is an operator button by checking its class.
  isOperator(element) {
    // First ensure that the parameter passed in is a button
    if (this.isButton(element)) {
      // Then check if it has the operator-button class.
      return element.matches(this.#operatorButtonClass);
    }
  }

  // @ Checks if a button is a button.
  isButton(element) {
    return element.matches("button");
  }

  // @ Update the display with a new string.
  updateDisplay(newDisplay) {
    this.#displayElement.textContent = newDisplay; // Update display on the UI
    this.#calculatorDisplay = newDisplay; // Update the variable holding the display
  }
}

const calculator = new Calculator();
