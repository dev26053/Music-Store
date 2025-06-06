let processCount = 0;

document.getElementById("add-process").addEventListener("click", () => {
  processCount++; // Increment process count

  const container = document.getElementById("process-inputs");

  const row = document.createElement("div");
  row.className = "grid grid-cols-4 gap-4 items-center";

  row.innerHTML = `
    <input type="text" placeholder="P${processCount}" class="process-id border p-2 rounded" value="P${processCount}" />
    <input type="number" placeholder="Arrival Time" class="arrival-time border p-2 rounded" min="0" />
    <input type="number" placeholder="Burst Time" class="burst-time border p-2 rounded" min="1" />
    <input type="number" placeholder="Priority" class="priority border p-2 rounded hidden" min="0" />
  `;

  container.appendChild(row);

  // Show/hide priority field based on algorithm
  togglePriorityFieldVisibility();
});

// Show Quantum input only if Round Robin is selected
document.getElementById("algorithm").addEventListener("change", () => {
  const algo = document.getElementById("algorithm").value;
  const quantumDiv = document.getElementById("quantum-input");

  if (algo === "rr") {
    quantumDiv.classList.remove("hidden");
  } else {
    quantumDiv.classList.add("hidden");
  }

  togglePriorityFieldVisibility();
});

// Toggle priority field visibility based on selected algorithm
function togglePriorityFieldVisibility() {
  const algo = document.getElementById("algorithm").value;
  const priorityFields = document.querySelectorAll(".priority");

  priorityFields.forEach((field) => {
    if (algo === "priority") {
      field.classList.remove("hidden");
    } else {
      field.classList.add("hidden");
    }
  });
}

// Simulate the chosen algorithm on clicking "Simulate"
document.getElementById("simulate").addEventListener("click", () => {
  const algo = document.getElementById("algorithm").value;
  const rows = document.querySelectorAll("#process-inputs > div");

  const processes = [];

  // Extract processes data from input fields
  rows.forEach((row) => {
    const id = row.querySelector(".process-id").value.trim();
    const arrivalTime = parseInt(row.querySelector(".arrival-time").value);
    const burstTime = parseInt(row.querySelector(".burst-time").value);
    const priorityInput = row.querySelector(".priority");
    const priority = priorityInput && !priorityInput.classList.contains("hidden")
      ? parseInt(priorityInput.value)
      : null;

    if (!id || isNaN(arrivalTime) || isNaN(burstTime)) {
      alert("Please fill all required fields for each process.");
      return;
    }

    processes.push({ id, arrivalTime, burstTime, priority });
  });

  // Check if any process was entered
  if (processes.length === 0) {
    alert("Please add at least one process.");
    return;
  }

  // Algorithm simulation based on selection
  console.log("Selected Algorithm:", algo);
  console.log("Processes:", processes);

  // Placeholder for algorithm selection
  if (algo === "sjf-np") simulateSJF_NP(processes);
  else if (algo === "sjf-p") simulateSJF_P(processes);
  else if (algo === "fcfs") simulateFCFS(processes);
  else if (algo === "priority") simulatePriority(processes);
  else if (algo === "rr") {
    const quantum = parseInt(document.getElementById("quantum").value);
    if (!quantum || quantum <= 0) {
      alert("Please enter a valid Time Quantum for Round Robin.");
      return;
    }
    simulateRR(processes, quantum);
  }
});

// SJF Non-Preemptive Simulation
function simulateSJF_NP(processes) {
  processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
  let currentTime = 0;
  const completed = [];
  const ganttHTML = [];
  const results = [];

  while (completed.length < processes.length) {
    // Get available processes that have arrived and not completed
    const available = processes.filter(p => !completed.includes(p) && p.arrivalTime <= currentTime);

    if (available.length === 0) {
      // CPU is idle
      ganttHTML.push(`
        <div class="relative bg-gray-300 text-black text-sm flex items-center justify-center border-r border-white"
             style="width: 40px; height: 50px;">
          Idle
          <span class="absolute -top-5 left-0 text-xs text-gray-600">${currentTime}</span>
          <span class="absolute -top-5 right-0 text-xs text-gray-600">${currentTime + 1}</span>
        </div>
      `);
      currentTime++;
      continue;
    }

    // Select process with shortest burst time
    available.sort((a, b) => a.burstTime - b.burstTime);
    const p = available[0];

    const startTime = currentTime;
    const completionTime = startTime + p.burstTime;
    const turnaroundTime = completionTime - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;

    ganttHTML.push(`
      <div class="relative bg-green-500 text-white text-sm flex items-center justify-center border-r border-white"
           style="width: ${p.burstTime * 40}px; height: 50px;">
        ${p.id}
        <span class="absolute -top-5 left-0 text-xs text-gray-600">${startTime}</span>
        <span class="absolute -top-5 right-0 text-xs text-gray-600">${completionTime}</span>
      </div>
    `);

    results.push({ ...p, completionTime, turnaroundTime, waitingTime });
    completed.push(p);
    currentTime = completionTime;
  }

  document.getElementById("gantt-blocks").innerHTML = ganttHTML.join("");
  renderResults(results);
}


// SJF Preemptive Simulation (Shortest Job First - Preemptive)
function simulateSJF_P(processes) {
  processes = processes.map(p => ({ ...p, remainingTime: p.burstTime }));
  let currentTime = 0;
  const completed = [];
  const results = [];
  const timeline = []; // to store which process ran at each time

  while (completed.length < processes.length) {
    const available = processes.filter(p => !completed.includes(p) && p.arrivalTime <= currentTime && p.remainingTime > 0);

    if (available.length === 0) {
      timeline.push("Idle");
      currentTime++;
      continue;
    }

    // Shortest remaining time process
    available.sort((a, b) => a.remainingTime - b.remainingTime);
    const currentProcess = available[0];

    currentProcess.remainingTime--;
    timeline.push(currentProcess.id);
    currentTime++;

    if (currentProcess.remainingTime === 0) {
      const completionTime = currentTime;
      const turnaroundTime = completionTime - currentProcess.arrivalTime;
      const waitingTime = turnaroundTime - currentProcess.burstTime;
      results.push({ ...currentProcess, completionTime, turnaroundTime, waitingTime });
      completed.push(currentProcess);
    }
  }

  // 👇 Generate Gantt chart segments from timeline
  const ganttHTML = [];
  let i = 0;
  while (i < timeline.length) {
    const currentID = timeline[i];
    let j = i;
    while (j < timeline.length && timeline[j] === currentID) {
      j++;
    }

    const duration = j - i;
    const bgColor = currentID === "Idle" ? "bg-gray-300 text-black" : "bg-blue-500 text-white";

    ganttHTML.push(`
      <div class="relative ${bgColor} text-sm flex items-center justify-center border-r border-white"
           style="width: ${duration * 40}px; height: 50px;">
        ${currentID}
        <span class="absolute -top-5 left-0 text-xs text-gray-600">${i}</span>
        <span class="absolute -top-5 right-0 text-xs text-gray-600">${j}</span>
      </div>
    `);

    i = j;
  }

  document.getElementById("gantt-blocks").innerHTML = ganttHTML.join("");
  renderResults(results);
}


// FCFS (First Come, First Served) Simulation
function simulateFCFS(processes) {
  processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
  let currentTime = 0;
  const ganttHTML = [];
  const results = [];

  processes.forEach((p) => {
    // Add idle time block if needed
    if (currentTime < p.arrivalTime) {
      const idleTime = p.arrivalTime - currentTime;
      ganttHTML.push(`
        <div class="relative bg-gray-300 text-black text-sm flex items-center justify-center border-r border-white"
             style="width: ${idleTime * 40}px; height: 50px;">
          Idle
          <span class="absolute -top-5 left-0 text-xs text-gray-600">${currentTime}</span>
          <span class="absolute -top-5 right-0 text-xs text-gray-600">${p.arrivalTime}</span>
        </div>
      `);
      currentTime = p.arrivalTime;
    }

    const startTime = currentTime;
    const completionTime = startTime + p.burstTime;
    const turnaroundTime = completionTime - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;

    ganttHTML.push(`
      <div class="relative bg-yellow-500 text-white text-sm flex items-center justify-center border-r border-white"
           style="width: ${p.burstTime * 40}px; height: 50px;">
        ${p.id}
        <span class="absolute -top-5 left-0 text-xs text-gray-600">${startTime}</span>
        <span class="absolute -top-5 right-0 text-xs text-gray-600">${completionTime}</span>
      </div>
    `);

    results.push({ ...p, startTime, completionTime, turnaroundTime, waitingTime });
    currentTime = completionTime;
  });

  // Inject into the page
  document.getElementById("gantt-blocks").innerHTML = ganttHTML.join("");
  renderResults(results);
}



// 
// function simulateRR(processes, quantum) {
//   let currentTime = 0;
//   let queue = [...processes];
//   const ganttHTML = [];
//   const results = [];

//   while (queue.length > 0) {
//     const p = queue.shift();
//     const timeSlice = Math.min(p.burstTime, quantum);
//     p.burstTime -= timeSlice;
//     currentTime += timeSlice;

//     ganttHTML.push(`
//       <div class="relative bg-red-500 text-white text-sm flex items-center justify-center border-r border-white"
//            style="width: ${timeSlice * 40}px; height: 50px;">
//         ${p.id}
//         <span class="absolute -top-5 left-0 text-xs text-gray-600">${currentTime - timeSlice}</span>
//         <span class="absolute -top-5 right-0 text-xs text-gray-600">${currentTime}</span>
//       </div>
//     `);

//     if (p.burstTime > 0) {
//       queue.push(p);
//     } else {
//       results.push({ ...p, completionTime: currentTime });
//     }
//   }

//   document.getElementById("gantt-blocks").innerHTML = ganttHTML.join("");
//   renderResults(results);
// }

// Round Robin (RR) Simulation
function simulateRR(processes, quantum) {
  let currentTime = 0;
  const readyQueue = [];
  const ganttHTML = [];
  const results = [];
  const remaining = processes.map(p => ({
    ...p,
    remainingTime: p.burstTime,
    startTime: null,
  }));

  const completed = new Set();

  // Sort by arrival time initially
  remaining.sort((a, b) => a.arrivalTime - b.arrivalTime);
  let i = 0;

  while (completed.size < processes.length) {
    // Add new arrivals to the ready queue
    while (i < remaining.length && remaining[i].arrivalTime <= currentTime) {
      readyQueue.push(remaining[i]);
      i++;
    }

    if (readyQueue.length === 0) {
      // CPU is idle
      ganttHTML.push(`
        <div class="relative bg-gray-300 text-black text-sm flex items-center justify-center border-r border-white"
             style="width: 40px; height: 50px;">
          Idle
          <span class="absolute -top-5 left-0 text-xs text-gray-600">${currentTime}</span>
          <span class="absolute -top-5 right-0 text-xs text-gray-600">${currentTime + 1}</span>
        </div>
      `);
      currentTime++;
      continue;
    }

    const current = readyQueue.shift();

    const execTime = Math.min(current.remainingTime, quantum);
    const start = currentTime;
    const end = currentTime + execTime;
    currentTime = end;

    ganttHTML.push(`
      <div class="relative bg-red-500 text-white text-sm flex items-center justify-center border-r border-white"
           style="width: ${execTime * 40}px; height: 50px;">
        ${current.id}
        <span class="absolute -top-5 left-0 text-xs text-gray-600">${start}</span>
        <span class="absolute -top-5 right-0 text-xs text-gray-600">${end}</span>
      </div>
    `);

    current.remainingTime -= execTime;

    // Add any new arrivals during this execution time
    while (i < remaining.length && remaining[i].arrivalTime <= currentTime) {
      readyQueue.push(remaining[i]);
      i++;
    }

    if (current.remainingTime > 0) {
      readyQueue.push(current);
    } else {
      const turnaroundTime = currentTime - current.arrivalTime;
      const waitingTime = turnaroundTime - current.burstTime;
      results.push({
        id: current.id,
        arrivalTime: current.arrivalTime,
        burstTime: current.burstTime,
        completionTime: currentTime,
        turnaroundTime,
        waitingTime,
      });
      completed.add(current.id);
    }
  }

  document.getElementById("gantt-blocks").innerHTML = ganttHTML.join("");
  renderResults(results);
}


function simulatePriority(processes) {
  let currentTime = 0;
  const completed = [];
  const ganttHTML = [];
  const results = [];

  while (completed.length < processes.length) {
    // Get all available processes at the current time
    const available = processes.filter(p => !completed.includes(p) && p.arrivalTime <= currentTime);

    if (available.length === 0) {
      // CPU is idle
      ganttHTML.push(`
        <div class="relative bg-gray-300 text-black text-sm flex items-center justify-center border-r border-white"
             style="width: 40px; height: 50px;">
          Idle
          <span class="absolute -top-5 left-0 text-xs text-gray-600">${currentTime}</span>
          <span class="absolute -top-5 right-0 text-xs text-gray-600">${currentTime + 1}</span>
        </div>
      `);
      currentTime++;
      continue;
    }

    // Choose the one with highest priority (lowest number)
    available.sort((a, b) => a.priority - b.priority || a.arrivalTime - b.arrivalTime);
    const p = available[0];

    const startTime = currentTime;
    const completionTime = startTime + p.burstTime;
    const turnaroundTime = completionTime - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;

    ganttHTML.push(`
      <div class="relative bg-purple-500 text-white text-sm flex items-center justify-center border-r border-white"
           style="width: ${p.burstTime * 40}px; height: 50px;">
        ${p.id}
        <span class="absolute -top-5 left-0 text-xs text-gray-600">${startTime}</span>
        <span class="absolute -top-5 right-0 text-xs text-gray-600">${completionTime}</span>
      </div>
    `);

    results.push({ ...p, completionTime, turnaroundTime, waitingTime });
    completed.push(p);
    currentTime = completionTime;
  }

  document.getElementById("gantt-blocks").innerHTML = ganttHTML.join("");
  renderResults(results);
}



// General Function to Render Results in a Table
function renderResults(results) {
  const tableHTML = `
    <div class="overflow-x-auto">
      <table class="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr class="bg-gray-200">
            <th class="border border-gray-300 px-4 py-2">Process ID</th>
            <th class="border border-gray-300 px-4 py-2">Arrival Time</th>
            <th class="border border-gray-300 px-4 py-2">Burst Time</th>
            <th class="border border-gray-300 px-4 py-2">Priority</th>
            <th class="border border-gray-300 px-4 py-2">Completion Time</th>
            <th class="border border-gray-300 px-4 py-2">Turnaround Time</th>
            <th class="border border-gray-300 px-4 py-2">Waiting Time</th>
          </tr>
        </thead>
        <tbody>
          ${results.map(p => `
            <tr>
              <td class="border px-4 py-2">${p.id}</td>
              <td class="border px-4 py-2">${p.arrivalTime}</td>
              <td class="border px-4 py-2">${p.burstTime}</td>
              <td class="border px-4 py-2">${p.priority}</td>
              <td class="border px-4 py-2">${p.completionTime}</td>
              <td class="border px-4 py-2">${p.turnaroundTime}</td>
              <td class="border px-4 py-2">${p.waitingTime}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
  document.getElementById("process-table").innerHTML = tableHTML;

  // Summary: Average Turnaround and Waiting Times
  const avgTAT = (results.reduce((acc, p) => acc + p.turnaroundTime, 0) / results.length).toFixed(2);
  const avgWT = (results.reduce((acc, p) => acc + p.waitingTime, 0) / results.length).toFixed(2);

  document.getElementById("summary").innerHTML = `
    <p><strong>Average Turnaround Time:</strong> ${avgTAT}</p>
    <p><strong>Average Waiting Time:</strong> ${avgWT}</p>
  `;
}
