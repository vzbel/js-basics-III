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
  #outputElement = document.querySelector(".output"); // Output HTML element
  #lastButtonPressed; // The last button that was pressed
  #operandQueue = new Queue(); // Holds operands awaiting calculation
  #dataActionQueue = new Queue(); // Holds peding operations.

  constructor() {
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Create event listener that determines what button was clicked in the button grid.
    document
      .querySelector(".button-grid")
      .addEventListener("click", (event) => {
        // If a button was clicked
        if (event.target.matches("button")) {
          // Get the button's data action and use it to determine what operation will be done.
          this.handleButtonAction(event.target.dataset.action, event.target);
        }
      });
  }
  // Button should be the event target
  handleButtonAction(dataAction, button) {
    // Get current output textcontent
    const currentOutput = this.#outputElement.textContent;
    // Check if the button just pressed is an operator
    // Event target's content
    const buttonContent = button.textContent;
    // If the button is an operator, we make sure to add the current value to the queue.
    // Of course, we would not want anyone to spam the buttons and add many to the queue,
    // So we also make sure that the last button press wasn't an operator.
    // Also make sure the last button press wasn't the equals button, so that the operator doesn't add the output twice.

    // @ were not adding - to the dataaction queue, and the calculation method gets a null dataaction as a result.
    if (this.#lastButtonPressed !== undefined) {
      if (
        this.isOperator(button) &&
        !this.isOperator(this.#lastButtonPressed) &&
        !this.isEqualsButton(this.#lastButtonPressed)
      ) {
        this.#operandQueue.enqueue(Number(currentOutput)); // @ We are enqueuing twice. Should be separate.
        this.#dataActionQueue.enqueue(dataAction); // Enqueue data action for calculations.
      }
      // Otherwise if we pressed an operator, and the last button press was not an operator,
      // and the last button press WAS THE EQUALS BUTTON, we don't want to enqueue the result value,
      // since the equals calculation done previously already enqueued it. So, we only want to enqueue the data action,
      // so that we can prepare for more values to be inputted for further calculations.
      else if (
        this.isOperator(button) &&
        !this.isOperator(this.#lastButtonPressed) &&
        this.isEqualsButton(this.#lastButtonPressed)
      ) {
        this.#dataActionQueue.enqueue(dataAction); // Enqueue data action for calculations.
      }
    }

    // Check if the queue contains a decimal.
    // In that case, our calculations must be more precise for floating point numbers.
    const queueContainsDecimal =
      !this.#operandQueue.isEmpty() &&
      this.#operandQueue.contents().includes(".");
    switch (dataAction) {
      case "multiply":
        // If a binary calculation is being awaited, make sure to complete it instead of proceeding
        if (this.#operandQueue.length() >= 2) {
          let result = this.#operandQueue.dequeue(); // start from first element in queue
          // if the queue contains decimal, multiply first element by 10 (to later divide.)
          if (queueContainsDecimal) {
            result *= 10;
          }
          // complete calculations for the rest of the elements in the queue
          while (!this.#operandQueue.isEmpty()) {
            result *= this.#operandQueue.dequeue();
            // if the queue contains decimal, multiply first element by 10 (to later divide.)
            if (queueContainsDecimal) {
              result *= 10;
            }
          }

          // if the queue contains decimal, multiply first element by 10 (to later divide.)
          if (queueContainsDecimal) {
            result /= 10;
          }
          // update output
          this.updateOutput(result);
          // clear data action queue
          this.#dataActionQueue.clear();
          // Add result to operand stack.
          this.#operandQueue.enqueue(result);
        }
        break;
      case "divide":
        // If a binary calculation is being awaited, make sure to complete it instead of proceeding
        if (this.#operandQueue.length() >= 2) {
          let result = this.#operandQueue.dequeue(); // start from first element in queue
          // complete calculations for the rest of the elements in the queue
          while (!this.#operandQueue.isEmpty()) {
            result /= this.#operandQueue.dequeue();
          }
          // update output
          this.updateOutput(result);
          // clear data action queue
          this.#dataActionQueue.clear();
          // Add result to operand stack.
          this.#operandQueue.enqueue(result);
        }
        break;
      case "add":
        // If a binary calculation is being awaited, make sure to complete it instead of proceeding
        if (this.#operandQueue.length() >= 2) {
          let result = this.#operandQueue.dequeue(); // start from first element in queue
          // complete calculations for the rest of the elements in the queue
          while (!this.#operandQueue.isEmpty()) {
            result += this.#operandQueue.dequeue();
          }
          // update output
          this.updateOutput(result);
          // clear data action queue
          this.#dataActionQueue.clear();
          // Add result to operand stack.
          this.#operandQueue.enqueue(result);
        }
        break;
      case "subtract":
        // If a binary calculation is being awaited, make sure to complete it instead of proceeding
        if (this.#operandQueue.length() >= 2) {
          let result = this.#operandQueue.dequeue(); // start from first element in queue
          // complete calculations for the rest of the elements in the queue
          while (!this.#operandQueue.isEmpty()) {
            result -= this.#operandQueue.dequeue();
          }
          // update output
          this.updateOutput(result);
          // clear data action queue
          this.#dataActionQueue.clear();
          // Add result to operand stack.
          this.#operandQueue.enqueue(result);
        }
        break;
      case "calculate":
        this.#operandQueue.enqueue(Number(currentOutput)); // Push current number.
        // Pass in the last data action, then calculate the result based on that.
        this.calculateResult(this.#dataActionQueue.dequeue());
        // @ After calculating
        break;
      case "decimal":
        // We may only add a decimal if the output does not contain a decimal.
        if (!currentOutput.includes(buttonContent)) {
          this.updateOutput(currentOutput + buttonContent); // Add a decimal.
        }
        break;
      case "clear":
        // clear operand queue
        this.#operandQueue.clear();
        // clear operation / data action queue;
        this.#dataActionQueue.clear();
        // Update display to zero.
        this.updateOutput("0");
        break;

      // An element with no data action is a digit.
      default:
        // If zero is currently displayed, the pressed digit must replace zero on the display.
        if (currentOutput === "0") {
          this.updateOutput(buttonContent);
        } else if (this.isOperator(this.#lastButtonPressed)) {
          // If the last button was an operator, we also replace the display to prepare for new numbers.
          this.updateOutput(buttonContent);
        } else {
          // Otherwise, append the digit to the current display.
          this.updateOutput(currentOutput + buttonContent);
        }
        break;
    }
    // In all cases update the last button pressed.
    this.#lastButtonPressed = button;
  }

  // Calculate the result of the current operation stack.
  calculateResult(dataAction) {
    switch (dataAction) {
      case "multiply":
        // If a binary calculation is being awaited, make sure to complete it instead of proceeding
        if (this.#operandQueue.length() >= 2) {
          let result = this.#operandQueue.dequeue(); // start from first element in queue
          // complete calculations for the rest of the elements in the queue
          while (!this.#operandQueue.isEmpty()) {
            result *= this.#operandQueue.dequeue();
          }
          // update output
          this.updateOutput(result);
          // clear data action queue
          this.#dataActionQueue.clear(); // This is valid, because we enqueue when calculating.
          // Add result to operand stack.
          this.#operandQueue.enqueue(result); // @ Now the result is in the operand stack, awating further calculations.
        }
        break;
      case "divide":
        // If a binary calculation is being awaited, make sure to complete it instead of proceeding
        if (this.#operandQueue.length() >= 2) {
          let result = this.#operandQueue.dequeue(); // start from first element in queue
          // complete calculations for the rest of the elements in the queue
          while (!this.#operandQueue.isEmpty()) {
            result /= this.#operandQueue.dequeue();
          }
          // update output
          this.updateOutput(result);
          // clear data action queue
          this.#dataActionQueue.clear();
          // Add result to operand stack.
          this.#operandQueue.enqueue(result);
        }
        break;
      case "add":
        // If a binary calculation is being awaited, make sure to complete it instead of proceeding
        if (this.#operandQueue.length() >= 2) {
          let result = this.#operandQueue.dequeue(); // start from first element in queue
          // complete calculations for the rest of the elements in the queue
          while (!this.#operandQueue.isEmpty()) {
            result += this.#operandQueue.dequeue();
          }
          // update output
          this.updateOutput(result);
          // clear data action queue
          this.#dataActionQueue.clear();
          // Add result to operand stack.
          this.#operandQueue.enqueue(result);
        }
        break;
      case "subtract":
        // If a binary calculation is being awaited, make sure to complete it instead of proceeding
        if (this.#operandQueue.length() >= 2) {
          let result = this.#operandQueue.dequeue(); // start from first element in queue
          // complete calculations for the rest of the elements in the queue
          while (!this.#operandQueue.isEmpty()) {
            result -= this.#operandQueue.dequeue();
          }
          // update output
          this.updateOutput(result);
          // clear data action queue
          this.#dataActionQueue.clear();
          // Add result to operand stack.
          this.#operandQueue.enqueue(result);
        }
    }
  }

  // Check if a button (HTML element) is an operator
  // (Checks its class)
  isOperator(button) {
    return button.matches(".operator-button");
  }

  // Check if a button is the equals button
  isEqualsButton(button) {
    return button.matches(".equals-button");
  }
  // Change the calculator display
  updateOutput(newOutput) {
    this.#outputElement.textContent = newOutput;
  }
}

const calculator = new Calculator();
const queue = new Queue();
queue.enqueue(0.5);
queue.enqueue(0.1);

// algorithm:
// result = first * 10
// while queue !empty {
//    result += next * 10
// }
// result /= 10

// Instead we will:
let result = queue.dequeue() * 10; // firstElementInQueue * 10
// while queue not empty, calculate the rest
while (!queue.isEmpty()) {
  result += queue.dequeue() * 10;
}
result /= 10;
// Ready.
