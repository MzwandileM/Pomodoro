const todoBtn = document.getElementById("todo_btn");
const settingsBtn = document.getElementById("settings_btn");
const todoModal = document.getElementById("todo_modal");
const settingsModal = document.getElementById("settings_modal");

const addTaskBtn = document.getElementById("add_task_btn");
const taskInput = document.getElementById("task");
const taskDate = document.getElementById("task_date");

const calendarBtn = document.getElementById("calendar_btn");
const selectedDate = document.getElementById("selected_date");

const todayTasks = document.getElementById("today_tasks");
const tomorrowTasks = document.getElementById("tomorrow_tasks");
const thisWeekTasks = document.getElementById("this_week_tasks");
const plannedTasks = document.getElementById("planned_tasks");
const completedTasks = document.getElementById("completed_tasks");

const todayCount = document.getElementById("today_count");
const tomorrowCount = document.getElementById("tomorrow_count");
const thisWeekCount = document.getElementById("this_week_count");
const plannedCount = document.getElementById("planned_count");
const completedCount = document.getElementById("completed_count");

const taskPomoModal = document.getElementById("task_pomo_modal");
const pomoTarget = document.getElementById("pomo_target");
const taskProgress = document.getElementById("task_progress");

const focusBtn = document.getElementById("focus");
const shortBreakBtn = document.getElementById("short_break");
const longBreakBtn = document.getElementById("long_break");
const timerDisplay = document.querySelector(".timer_display");
const startTimerBtn = document.getElementById("start_timer");

const focusSetting = document.getElementById("focus_setting");
const shortBreakSetting = document.getElementById("short_break_setting");
const longBreakSetting = document.getElementById("long_break_setting");

const focusDuration = document.getElementById("focus_duration");
const shortBreakDuration = document.getElementById("short_break_duration");
const longBreakDuration = document.getElementById("long_break_duration");

const autoFocusBtn = document.getElementById("auto_focus_btn");
const autoBreakBtn = document.getElementById("auto_break_btn");
const autoLongBreakBtn = document.getElementById("auto_long_break_btn");
const longBreakAfterSelect = document.getElementById("long_break_after");

const alarmBtn = document.getElementById("alarm_btn");
const alarmSounds = document.getElementById("alarm_sounds");

const resetDefaultBtn = document.getElementById("reset_default_btn");
const modes = document.getElementById("modes");
const overdueTasks = document.getElementById("overdue_tasks");
const overdueCount = document.getElementById("overdue_count");

const stopConfirmModal = document.getElementById("stop_confirm_modal");
const cancelStopBtn = document.getElementById("cancel_stop");
const confirmStopBtn = document.getElementById("confirm_stop");

const timerRing = document.querySelector(".timer_ring_progress");
const timerText = document.getElementById("timer_text");

const circumference = 2 * Math.PI * 136;

const savedSettings = JSON.parse(localStorage.getItem("pomodoroSettings"));
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let timerDurations = savedSettings?.timerDurations || {
  focus: 25,
  short_break: 5,
  long_break: 15,
};

let autoStartFocus = savedSettings?.autoStartFocus ?? false;
let autoStartBreak = savedSettings?.autoStartBreak ?? false;
let autoStartLongBreak = savedSettings?.autoStartLongBreak ?? false;
let longBreakAfter = savedSettings?.longBreakAfter ?? 4;

let alarmEnabled = savedSettings?.alarmEnabled ?? false;
let selectedAlarm = savedSettings?.selectedAlarm ?? "beep";

let editingTaskId = null;
let activeTaskId = null;

let timerInterval = null;
let timerSeconds = timerDurations.focus * 60;
let currentMode = "focus";
let isTimerRunning = false;
let pendingMode = null;

const defaultTimerDurations = {
  focus: 25,
  short_break: 5,
  long_break: 15,
};

//Hide and show modals
todoModal.classList.add("hidden");
settingsModal.classList.add("hidden");

todoBtn.addEventListener("click", (event) => {
  event.stopPropagation();

  todoModal.classList.remove("hidden");
  settingsModal.classList.add("hidden");
});

settingsBtn.addEventListener("click", (event) => {
  event.stopPropagation();

  settingsModal.classList.remove("hidden");
  todoModal.classList.add("hidden");
});

todoModal.addEventListener("click", (event) => {
  event.stopPropagation();
});

settingsModal.addEventListener("click", (event) => {
  event.stopPropagation();
});

document.addEventListener("click", () => {
  todoModal.classList.add("hidden");
  settingsModal.classList.add("hidden");
});

//Date Picker
calendarBtn.addEventListener("click", () => {
  taskDate.showPicker();
});

taskDate.addEventListener("change", () => {
  if (taskDate.value) {
    const date = new Date(`${taskDate.value}T00:00:00`);

    selectedDate.textContent = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } else {
    selectedDate.textContent = "";
  }
});

focusBtn.addEventListener("click", () => requestModeChange("focus"));
shortBreakBtn.addEventListener("click", () => requestModeChange("short_break"));
longBreakBtn.addEventListener("click", () => requestModeChange("long_break"));

// add task to the list
addTaskBtn.addEventListener("click", () => {
  const title = taskInput.value.trim();
  const dueDate = taskDate.value;

  if (title === "" || dueDate === "") return;

  if (editingTaskId) {
    const task = tasks.find((task) => task.id === editingTaskId);

    task.title = title;
    task.dueDate = dueDate;

    editingTaskId = null;
    addTaskBtn.textContent = "Add";
  } else {
    tasks.push({
      id: crypto.randomUUID(),
      title: title,
      dueDate: dueDate,
      completed: false,
      completedAt: null,
      pomodorosRequired: 1,
      pomodorosCompleted: 0,
    });
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));

  taskInput.value = "";
  taskDate.value = "";
  selectedDate.textContent = "";

  renderTasks();
});

startTimerBtn.addEventListener("click", () => {
  if (isTimerRunning) {
    clearInterval(timerInterval);

    timerInterval = null;
    isTimerRunning = false;

    startTimerBtn.innerHTML = "<i class='bx bx-sync'></i> Resume";

    return;
  }

  startTimer();
});

const focusAdd = focusSetting.querySelector(".add");
const focusMinus = focusSetting.querySelector(".minus");

focusAdd.addEventListener("click", () => {
  timerDurations.focus++;
  updateTimerDuration("focus", timerDurations.focus);
});

focusMinus.addEventListener("click", () => {
  if (timerDurations.focus <= 1) return;

  timerDurations.focus--;
  updateTimerDuration("focus", timerDurations.focus);
});

const shortBreakAdd = shortBreakSetting.querySelector(".add");
const shortBreakMinus = shortBreakSetting.querySelector(".minus");

shortBreakAdd.addEventListener("click", () => {
  timerDurations.short_break++;
  updateTimerDuration("short_break", timerDurations.short_break);
});

shortBreakMinus.addEventListener("click", () => {
  if (timerDurations.short_break <= 1) return;

  timerDurations.short_break--;
  updateTimerDuration("short_break", timerDurations.short_break);
});

const longBreakAdd = longBreakSetting.querySelector(".add");
const longBreakMinus = longBreakSetting.querySelector(".minus");

longBreakAdd.addEventListener("click", () => {
  timerDurations.long_break++;
  updateTimerDuration("long_break", timerDurations.long_break);
});

longBreakMinus.addEventListener("click", () => {
  if (timerDurations.long_break <= 1) return;

  timerDurations.long_break--;
  updateTimerDuration("long_break", timerDurations.long_break);
});

autoFocusBtn.addEventListener("click", () => {
  autoStartFocus = !autoStartFocus;

  updateToggle(autoFocusBtn, autoStartFocus);
  saveSettings();
});

autoBreakBtn.addEventListener("click", () => {
  autoStartBreak = !autoStartBreak;

  updateToggle(autoBreakBtn, autoStartBreak);
  saveSettings();
});

autoLongBreakBtn.addEventListener("click", () => {
  autoStartLongBreak = !autoStartLongBreak;

  updateToggle(autoLongBreakBtn, autoStartLongBreak);
  saveSettings();
});

longBreakAfterSelect.addEventListener("change", () => {
  longBreakAfter = Number(longBreakAfterSelect.value);
  saveSettings();
});

let selectedMode = savedSettings?.mode || "dark";

alarmBtn.addEventListener("click", () => {
  alarmEnabled = !alarmEnabled;

  updateToggle(alarmBtn, alarmEnabled);

  alarmSounds.classList.toggle("hidden", !alarmEnabled);

  saveSettings();
});

const alarmSoundButtons = document.querySelectorAll(".alarm_sounds button");

alarmSoundButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedAlarm = button.dataset.sound;

    alarmSoundButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.sound === selectedAlarm);
    });

    saveSettings();
  });
});

modes.addEventListener("change", () => {
  selectedMode = modes.value;

  applyTheme(selectedMode);
  saveSettings();
});

resetDefaultBtn.addEventListener("click", () => {
  timerDurations = { ...defaultTimerDurations };

  autoStartFocus = false;
  autoStartBreak = false;
  autoStartLongBreak = false;

  longBreakAfter = 4;

  alarmEnabled = false;
  selectedAlarm = "beep";

  selectedMode = "dark";

  modes.value = "dark";
  applyTheme("dark");

  updateTimerDuration("focus", timerDurations.focus);

  updateTimerDuration("short_break", timerDurations.short_break);

  updateTimerDuration("long_break", timerDurations.long_break);

  updateToggle(autoFocusBtn, false);
  updateToggle(autoBreakBtn, false);
  updateToggle(autoLongBreakBtn, false);
  updateToggle(alarmBtn, false);

  longBreakAfter.value = 4;

  alarmSounds.style.display = "hidden";

  saveSettings();
});

//restore UI
updateTimerDuration("focus", timerDurations.focus);
updateTimerDuration("short_break", timerDurations.short_break);
updateTimerDuration("long_break", timerDurations.long_break);

updateToggle(autoFocusBtn, autoStartFocus);
updateToggle(autoBreakBtn, autoStartBreak);
updateToggle(autoLongBreakBtn, autoStartLongBreak);
updateToggle(alarmBtn, alarmEnabled);

longBreakAfterSelect.value = longBreakAfter;

alarmSounds.classList.toggle("hidden", !alarmEnabled);

alarmSoundButtons.forEach((button) => {
  button.classList.toggle("active", button.dataset.sound === selectedAlarm);
});

function applyTheme(mode) {
  document.documentElement.classList.toggle("light", mode === "light");
}

function updateActiveMode() {
  focusBtn.classList.toggle("active", currentMode === "focus");

  shortBreakBtn.classList.toggle("active", currentMode === "short_break");

  longBreakBtn.classList.toggle("active", currentMode === "long_break");
}

function playAlarm() {
  if (!alarmEnabled) return;

  const playSound = () => {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (selectedAlarm === "bell") {
      oscillator.type = "sine";
      oscillator.frequency.value = 800;
    }

    if (selectedAlarm === "chime") {
      oscillator.type = "sine";
      oscillator.frequency.value = 1200;
    }

    if (selectedAlarm === "beep") {
      oscillator.type = "square";
      oscillator.frequency.value = 600;
    }

    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.5,
    );

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  playSound();

  setTimeout(() => {
    playSound();
  }, 250);

  setTimeout(() => {
    playSound();
  }, 500);
}

function saveSettings() {
  localStorage.setItem(
    "pomodoroSettings",
    JSON.stringify({
      timerDurations,
      autoStartFocus,
      autoStartBreak,
      autoStartLongBreak,
      longBreakAfter,
      alarmEnabled,
      selectedAlarm,
      mode: selectedMode,
    }),
  );
}

function updateToggle(button, enabled) {
  const icon = button.querySelector("i");

  icon.className = enabled ? "bx bx-toggle-right" : "bx bx-toggle-left";

  button.classList.toggle("active", enabled);
}

function updateTimerDuration(mode, minutes) {
  timerDurations[mode] = minutes;

  if (mode === "focus") {
    focusDuration.textContent = `${minutes} min`;
  }

  if (mode === "short_break") {
    shortBreakDuration.textContent = `${minutes} min`;
  }

  if (mode === "long_break") {
    longBreakDuration.textContent = `${minutes} min`;
  }

  if (currentMode === mode && !isTimerRunning) {
    timerSeconds = minutes * 60;
    updateTimerDisplay();
  }

  saveSettings();
}

function requestModeChange(mode) {
  if (mode === currentMode) return;

  if (isTimerRunning) {
    pendingMode = mode;
    stopConfirmModal.classList.remove("hidden");
    return;
  }

  setTimerMode(mode);
}

function setTimerMode(mode) {
  clearInterval(timerInterval);

  timerInterval = null;
  isTimerRunning = false;

  currentMode = mode;
  timerSeconds = timerDurations[mode] * 60;

  startTimerBtn.innerHTML = "<i class='bx bx-play'></i> Start";

  const stopTimerBtn = document.getElementById("stop_timer");

  if (stopTimerBtn) {
    stopTimerBtn.remove();
  }

  updateTimerDisplay();
  updateActiveMode();
}

function getActiveTask() {
  return tasks.find((task) => task.id === activeTaskId);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;

  timerText.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const totalSeconds = timerDurations[currentMode] * 60;

  const progress = Math.max(0, Math.min(1, timerSeconds / totalSeconds));

  timerRing.style.strokeDashoffset = circumference * (1 - progress);
}

function stopTimer() {
  clearInterval(timerInterval);

  timerInterval = null;
  isTimerRunning = false;

  timerSeconds = timerDurations[currentMode] * 60;

  startTimerBtn.innerHTML = "<i class='bx bx-play'></i> Start";

  const stopTimerBtn = document.getElementById("stop_timer");

  if (stopTimerBtn) {
    stopTimerBtn.remove();
  }

  updateTimerDisplay();
}

cancelStopBtn.addEventListener("click", () => {
  stopConfirmModal.classList.add("hidden");
});

confirmStopBtn.addEventListener("click", () => {
  stopConfirmModal.classList.add("hidden");
  stopTimer();
});

let sessionCounts = JSON.parse(localStorage.getItem("sessionCounts")) || {
  focus: 0,
  short_break: 0,
  long_break: 0,
};

function updateSessionCounts() {
  focusBtn.textContent = `Focus ${sessionCounts.focus}`;
  shortBreakBtn.textContent = `Short Break ${sessionCounts.short_break}`;
  longBreakBtn.textContent = `Long Break ${sessionCounts.long_break}`;
}

function shouldStartLongBreak() {
  return (
    autoStartLongBreak &&
    sessionCounts.focus > 0 &&
    sessionCounts.focus % longBreakAfter === 0
  );
}

function completeTimer() {
  clearInterval(timerInterval);

  timerInterval = null;
  isTimerRunning = false;

  playAlarm();

  sessionCounts[currentMode]++;
  localStorage.setItem("sessionCounts", JSON.stringify(sessionCounts));

  updateSessionCounts();

  startTimerBtn.innerHTML = "<i class='bx bx-play'></i> Start";

  if (currentMode === "focus") {
    const activeTask = getActiveTask();

    if (activeTask) {
      activeTask.pomodorosCompleted = (activeTask.pomodorosCompleted || 0) + 1;

      if (
        activeTask.pomodorosCompleted >= (activeTask.pomodorosRequired || 1)
      ) {
        activeTask.completed = true;
        activeTask.completedAt = new Date().toISOString();

        activeTaskId = null;
      }

      localStorage.setItem("tasks", JSON.stringify(tasks));

      renderTasks();
    }

    if (shouldStartLongBreak()) {
      currentMode = "long_break";
      timerSeconds = timerDurations.long_break * 60;

      updateActiveMode();
      updateTimerDisplay();

      if (autoStartLongBreak) {
        startTimer();
      }

      return;
    }

    currentMode = "short_break";
    timerSeconds = timerDurations.short_break * 60;

    updateActiveMode();
    updateTimerDisplay();

    if (autoStartBreak) {
      startTimer();
    }

    return;
  }

  currentMode = "focus";
  timerSeconds = timerDurations.focus * 60;

  updateActiveMode();
  updateTimerDisplay();

  if (autoStartFocus) {
    startTimer();
  }
}

function startTimer() {
  isTimerRunning = true;

  startTimerBtn.innerHTML = "<i class='bx bx-pause'></i> Pause";

  if (!document.getElementById("stop_timer")) {
    const stopTimerBtn = document.createElement("button");

    stopTimerBtn.id = "stop_timer";
    stopTimerBtn.textContent = "Stop";

    startTimerBtn.after(stopTimerBtn);

    stopTimerBtn.addEventListener("click", () => {
      stopConfirmModal.classList.remove("hidden");
    });
  }

  timerInterval = setInterval(() => {
    timerSeconds--;

    updateTimerDisplay();

    if (timerSeconds <= 0) {
      completeTimer();
    }
  }, 1000);
}

// render tasks to the UI
function renderTasks() {
  todayTasks.innerHTML = "";
  tomorrowTasks.innerHTML = "";
  thisWeekTasks.innerHTML = "";
  plannedTasks.innerHTML = "";
  overdueTasks.innerHTML = "";
  completedTasks.innerHTML = "";

  let todayTotal = 0;
  let tomorrowTotal = 0;
  let thisWeekTotal = 0;
  let plannedTotal = 0;
  let overdueTotal = 0;
  let completedTotal = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const endOfWeek = new Date(today);
  const daysUntilSunday = 7 - today.getDay();

  endOfWeek.setDate(today.getDate() + daysUntilSunday);
  endOfWeek.setHours(23, 59, 59, 999);

  tasks.forEach((task) => {
    const taskElement = document.createElement("div");
    taskElement.classList.add("task_item");

    const taskTitle = document.createElement("span");
    taskTitle.textContent = task.title;

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.classList.add("edit_task");

    const pomoProgress = document.createElement("span");
    pomoProgress.classList.add("pomo_progress");
    pomoProgress.textContent = `${task.pomodorosCompleted || 0}/${task.pomodorosRequired || 1}`;

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.classList.add("remove_task");

    editButton.addEventListener("click", (event) => {
      event.stopPropagation();

      editingTaskId = task.id;

      taskInput.value = task.title;
      taskDate.value = task.dueDate;

      const date = new Date(`${task.dueDate}T00:00:00`);

      selectedDate.textContent = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      addTaskBtn.textContent = "Update";
    });
    removeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      if (editingTaskId === task.id) {
        editingTaskId = null;
        taskInput.value = "";
        taskDate.value = "";
        selectedDate.textContent = "";
        addTaskBtn.textContent = "Add";
      }
      tasks = tasks.filter((item) => item.id !== task.id);
      localStorage.setItem("tasks", JSON.stringify(tasks));
      renderTasks();
    });

    let startButton = null;

    if (!task.completed) {
      startButton = document.createElement("button");
      startButton.innerHTML = "<i class='bx bx-play'></i>";
      startButton.classList.add("start_task");

      startButton.addEventListener("click", (event) => {
        event.stopPropagation();

        activeTaskId = task.id;

        pomoTarget.value = task.pomodorosRequired || 1;

        taskPomoModal.classList.remove("hidden");
      });
    }

    taskElement.appendChild(pomoProgress);
    taskElement.appendChild(taskTitle);

    if (startButton) {
      taskElement.appendChild(startButton);
    }

    taskElement.appendChild(editButton);
    taskElement.appendChild(removeButton);

    if (task.completed) {
      taskElement.classList.add("completed_task");

      completedTasks.appendChild(taskElement);
      completedTotal++;
      return;
    }

    const taskDate = new Date(`${task.dueDate}T00:00:00`);

    if (taskDate < today) {
      overdueTasks.appendChild(taskElement);
      overdueTotal++;
    } else if (taskDate.getTime() === today.getTime()) {
      todayTasks.appendChild(taskElement);
      todayTotal++;
    } else if (taskDate.getTime() === tomorrow.getTime()) {
      tomorrowTasks.appendChild(taskElement);
      tomorrowTotal++;
    } else if (taskDate > tomorrow && taskDate <= endOfWeek) {
      thisWeekTasks.appendChild(taskElement);
      thisWeekTotal++;
    } else if (taskDate > endOfWeek) {
      plannedTasks.appendChild(taskElement);
      plannedTotal++;
    }
  });

  todayCount.textContent = todayTotal;
  tomorrowCount.textContent = tomorrowTotal;
  thisWeekCount.textContent = thisWeekTotal;
  plannedCount.textContent = plannedTotal;
  overdueCount.textContent = overdueTotal;
  completedCount.textContent = completedTotal;

  const taskLists = [
    { element: todayTasks, count: todayTotal },
    { element: tomorrowTasks, count: tomorrowTotal },
    { element: thisWeekTasks, count: thisWeekTotal },
    { element: plannedTasks, count: plannedTotal },
    { element: overdueTasks, count: overdueTotal },
    { element: completedTasks, count: completedTotal },
  ];

  taskLists.forEach(({ element, count }) => {
    if (count === 0) {
      const emptyMessage = document.createElement("div");
      emptyMessage.classList.add("empty_task");
      emptyMessage.textContent = "No tasks";

      element.appendChild(emptyMessage);
    }
  });

  const totalTasks = tasks.length;
  const completedTasksTotal = tasks.filter((task) => task.completed).length;

  taskProgress.textContent = `${completedTasksTotal}/${totalTasks}`;
}

pomoTarget.addEventListener("change", () => {
  const task = tasks.find((item) => item.id === activeTaskId);

  if (!task) return;

  task.pomodorosRequired = Number(pomoTarget.value);

  localStorage.setItem("tasks", JSON.stringify(tasks));

  taskPomoModal.classList.add("hidden");

  renderTasks();
});

//Collapse and expand task_schedule
const taskSections = [
  ".today",
  ".tomorrow",
  ".this_week",
  ".planned",
  ".overdue",
  ".completed",
];

taskSections.forEach((selector) => {
  const section = document.querySelector(selector);
  const taskList = section.querySelector(".task_list");

  // Start collapsed
  taskList.classList.add("hidden");

  section.addEventListener("click", () => {
    taskSections.forEach((otherSelector) => {
      const otherSection = document.querySelector(otherSelector);
      const otherTaskList = otherSection.querySelector(".task_list");

      if (otherSection !== section) {
        otherTaskList.classList.add("hidden");
      }
    });

    taskList.classList.toggle("hidden");
  });
});

renderTasks();
updateTimerDisplay();
updateSessionCounts();
updateActiveMode();
modes.value = selectedMode;
applyTheme(selectedMode);
