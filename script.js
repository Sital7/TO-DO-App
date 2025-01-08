// Selectors
const themeToggle = document.getElementById("themeToggle");
const addTaskButtons = document.querySelectorAll(".addTaskBtn");
const saveTaskButtons = document.querySelectorAll(".saveTaskBtn");
const taskLists = document.querySelectorAll(".task-list");


// Function to toggle theme
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  themeToggle.innerText = isDark ? "Light Theme" : "Dark Theme";
});

// Event listeners for showing task input
addTaskButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const column = button.getAttribute("data-column");
    document.getElementById(`${column}Input`).classList.toggle("hidden");
  });
});

// Event listeners for saving tasks
saveTaskButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    const inputContainer = e.target.parentElement;
    const title = inputContainer.querySelector(".task-title").value.trim();
    const desc = inputContainer.querySelector(".task-desc").value.trim();

    if (title === "" || desc === "") {
      alert("Please fill in both fields!");
      return;
    }

    const columnId = inputContainer.id.replace("Input", "List");
    const taskCard = createTaskCard(title, desc, columnId);

    // Append task to the column and save to LocalStorage
    document.getElementById(columnId).appendChild(taskCard);
    saveTaskToLocalStorage(title, desc, columnId);

    // Clear input fields and hide the input container
    inputContainer.querySelector(".task-title").value = "";
    inputContainer.querySelector(".task-desc").value = "";
    inputContainer.classList.add("hidden");
  });
});

// Function to create task card
function createTaskCard(title, description, columnId) {
  const card = document.createElement("div");
  card.className = "task-card";
  card.draggable = true;
  card.setAttribute("data-column", columnId);

  const titleContainer = document.createElement("div");
  titleContainer.className = "task-header";

  const titleEl = document.createElement("h4");
  titleEl.innerText = title;

  const descEl = document.createElement("p");
  descEl.innerText = description;

  // Create Edit and Remove icons
  const editIcon = document.createElement("span");
  editIcon.className = "task-edit-icon";
  editIcon.innerHTML = "✏️"; // Pencil icon for Edit

  const removeIcon = document.createElement("span");
  removeIcon.className = "task-remove-icon";
  removeIcon.innerHTML = "🗑️"; // Trash icon for Remove

  // Append the icons to the title container
  titleContainer.appendChild(titleEl);
  titleContainer.appendChild(editIcon);
  titleContainer.appendChild(removeIcon);

  // Append title, description, and icons to card
  card.appendChild(titleContainer);
  card.appendChild(descEl);

  // Show/hide edit/remove buttons when icons are clicked
  let editButtonDisplayed = false;
  let removeButtonDisplayed = false;

  editIcon.addEventListener("click", () => {
    if (!editButtonDisplayed) {
      const editBtn = createEditButton(title, description, columnId, titleEl, descEl);
      card.appendChild(editBtn);
      editButtonDisplayed = true;
    }
  });

  removeIcon.addEventListener("click", () => {
    if (!removeButtonDisplayed) {
      const removeBtn = createRemoveButton(title, description, card, columnId);
      card.appendChild(removeBtn);
      removeButtonDisplayed = true;
    }
  });

  // Drag events
  card.addEventListener("dragstart", () => {
    card.classList.add("dragging");
  });

  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");
  });

  return card;
}

// Function to create Edit button
function createEditButton(title, description, columnId, titleEl, descEl) {
  const editBtn = document.createElement("button");
  editBtn.className = "editTaskBtn";
  editBtn.innerText = "Edit Task";

  editBtn.addEventListener("click", () => {
    const titleInput = prompt("Edit Task Title", title);
    const descInput = prompt("Edit Task Description", description);

    if (titleInput && descInput) {
      titleEl.innerText = titleInput;
      descEl.innerText = descInput;

      // Update task in LocalStorage
      updateTaskInLocalStorage(title, description, titleInput, descInput, columnId);
    }
  });

  return editBtn;
}

// Function to create Remove button
function createRemoveButton(title, description, card, columnId) {
  const removeBtn = document.createElement("button");
  removeBtn.className = "removeTaskBtn";
  removeBtn.innerText = "Remove Task";

  removeBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete this task?")) {
      // Remove task from DOM
      card.remove();

      // Remove task from LocalStorage
      removeTaskFromLocalStorage(title, description, columnId);
    }
  });

  return removeBtn;
}

// Drag-and-drop functionality
taskLists.forEach((list) => {
  list.addEventListener("dragover", (e) => {
    e.preventDefault();
    const draggingCard = document.querySelector(".dragging");
    list.appendChild(draggingCard);

    // Update task's column in LocalStorage
    const columnId = list.id;
    const title = draggingCard.querySelector("h4").innerText;
    const desc = draggingCard.querySelector("p").innerText;
    updateTaskColumnInLocalStorage(title, desc, columnId);
  });
});

// LocalStorage Functions
function saveTaskToLocalStorage(title, description, columnId) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push({ title, description, columnId });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function getTasksFromLocalStorage() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

function updateTaskColumnInLocalStorage(title, description, newColumnId) {
  let tasks = getTasksFromLocalStorage();
  const taskIndex = tasks.findIndex(
    (task) => task.title === title && task.description === description
  );
  if (taskIndex !== -1) {
    tasks[taskIndex].columnId = newColumnId;
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
}

function updateTaskInLocalStorage(oldTitle, oldDescription, newTitle, newDescription, columnId) {
  let tasks = getTasksFromLocalStorage();
  const taskIndex = tasks.findIndex(
    (task) => task.title === oldTitle && task.description === oldDescription
  );
  if (taskIndex !== -1) {
    tasks[taskIndex].title = newTitle;
    tasks[taskIndex].description = newDescription;
    tasks[taskIndex].columnId = columnId;
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
}

function removeTaskFromLocalStorage(title, description, columnId) {
  let tasks = getTasksFromLocalStorage();

  // Remove the task from the local storage array
  tasks = tasks.filter(
    (task) => !(task.title === title && task.description === description && task.columnId === columnId)
  );

  // Update local storage with the remaining tasks
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Populate tasks from LocalStorage on page load
document.addEventListener("DOMContentLoaded", () => {
  const tasks = getTasksFromLocalStorage();
  tasks.forEach((task) => {
    const taskCard = createTaskCard(task.title, task.description, task.columnId);
    document.getElementById(task.columnId).appendChild(taskCard);
  });
});
