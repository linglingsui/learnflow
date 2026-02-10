
// 全局数据：所有任务 completed = false
const plan = {
  "2026-02-08": [
    { 
      time: "19:00", 
      title: "FastAPI 请求参数处理", 
      completed: false, 
      category: "编程", 
      priority: "high",
      goal: "掌握 FastAPI 请求参数处理方法",
      task: "阅读官方文档，编写示例代码",
      resources: "FastAPI 官网, GitHub 示例仓库",
      method: "先看文档 → 再写代码 → 最后调试"
    },
    { 
      time: "20:00", 
      title: "LeetCode 算法题（第1题）", 
      completed: false, 
      category: "编程", 
      priority: "medium",
      goal: "理解两数之和的哈希解法",
      task: "完成 LeetCode 第1题并提交",
      resources: "LeetCode 题解, 算法导论",
      method: "先暴力解 → 再优化 → 分析时间复杂度"
    },
    { 
      time: "21:00", 
      title: "英语单词复习（百词斩）", 
      completed: false, 
      category: "英语", 
      priority: "low",
      goal: "记忆50个新GRE词汇",
      task: "完成百词斩今日任务",
      resources: "百词斩APP, GRE词频表",
      method: "艾宾浩斯记忆法 + 例句联想"
    }
  ],
  "2026-02-09": [
    { 
      time: "19:00", 
      title: "FastAPI 响应模型", 
      completed: false, 
      category: "编程", 
      priority: "high",
      goal: "学会定义 Pydantic 响应模型",
      task: "编写用户信息返回接口",
      resources: "FastAPI 文档, Pydantic 指南",
      method: "模仿示例 → 修改字段 → 测试验证"
    },
    { 
      time: "20:00", 
      title: "英语听力练习（VOA）", 
      completed: false, 
      category: "英语", 
      priority: "medium",
      goal: "提升新闻听力理解能力",
      task: "听写 VOA 慢速英语1篇",
      resources: "VOA Learning English",
      method: "盲听 → 逐句听写 → 对照原文"
    }
  ],
  "2026-02-10": [],
  "2026-02-11": [],
  "2026-02-12": [],
  "2026-02-13": [],
  "2026-02-14": []
};

let isZenMode = false;
let pomodoroInterval = null;
let remainingTime = 25 * 60; // 25分钟（秒）
let soundEnabled = true;

function getPriorityClass(priority) {
  return `priority-${priority}`;
}

function loadTasks() {
  const selectedDate = document.getElementById('date-select').value;
  const taskContainer = document.getElementById('task-container');
  const dayTasks = plan[selectedDate] || [];

  if (dayTasks.length === 0) {
    taskContainer.innerHTML = '<p style="color: #aaa; text-align: center; margin: 20px; font-style: italic;">今天没有安排任务 😊</p>';
    updateStats(selectedDate, 0, 0);
    return;
  }

  const tasksHTML = dayTasks.map((task, index) => `
    <div class="task-item ${task.completed ? 'completed' : ''}" data-index="${index}">
      <div class="task-main">
        <div class="task-header">
          <span class="task-time">${task.time}</span>
          <span class="task-category">${task.category}</span>
          <span class="priority-badge ${getPriorityClass(task.priority)}">${task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}</span>
        </div>
        <div class="task-text">${task.title}</div>
      </div>
      <div class="task-actions">
        <button class="complete-btn ${task.completed ? 'completed' : ''}" 
                onclick="completeTask('${selectedDate}', ${index}, this)" title="标记为完成">
          ${task.completed ? '✓' : '✓'}
        </button>
        <button class="skip-btn" title="跳过此任务" onclick="skipTask('${selectedDate}', ${index})">⚡</button>
        <button class="delete-btn" title="删除任务" onclick="deleteTask('${selectedDate}', ${index})">×</button>
        <button class="btn-detail" title="查看详情" onclick="showTaskDetail('${selectedDate}', ${index})">ℹ️</button>
      </div>
    </div>
  `).join('');

  taskContainer.innerHTML = tasksHTML;

  const completed = dayTasks.filter(t => t.completed).length;
  updateStats(selectedDate, dayTasks.length, completed);
}

function completeTask(date, index, btn) {
  const task = plan[date][index];
  if (task.completed) {
    task.completed = false;
    btn.classList.remove('completed');
  } else {
    task.completed = true;
    btn.classList.add('completed');
    showCompletionAnimation(btn, '+10');
  }

  const total = plan[date].length;
  const completed = plan[date].filter(t => t.completed).length;
  updateStats(date, total, completed);

  // 更新图表
  updateChart();
}

function skipTask(date, index) {
  if (!confirm('确定要跳过这个任务吗？')) return;
  plan[date][index].skipped = true;
  plan[date][index].completed = false;
  loadTasks();
}

function deleteTask(date, index) {
  if (!confirm('确定要删除这个任务吗？')) return;
  plan[date].splice(index, 1);
  loadTasks();
}

function addTask() {
  const input = document.getElementById('new-task-input');
  const taskTitle = input.value.trim();
  const timeSlot = document.getElementById('time-slot').value;
  const prioritySelect = document.getElementById('priority-select').value;
  const selectedDate = document.getElementById('date-select').value;

  if (!taskTitle) return;

  const newTask = {
    time: timeSlot.split('-')[0],
    title: taskTitle,
    completed: false,
    category: "其他",
    priority: prioritySelect,
    goal: "",
    task: "",
    resources: "",
    method: ""
  };

  if (!plan[selectedDate]) plan[selectedDate] = [];
  plan[selectedDate].push(newTask);

  input.value = '';
  document.getElementById('time-slot').value = '19:00-20:00';
  loadTasks();
}

function showTaskDetail(date, index) {
  const task = plan[date][index];

  const iconMap = {
    time: '⏱',
    category: '🏷',
    priority: '🔥',
    goal: '🎯',
    task: '📋',
    resources: '📚',
    method: '🧠'
  };

  let detailHTML = `<h3>${task.title}</h3>`;

  detailHTML += `<div class="modal-item"><span class="modal-icon">${iconMap.time}</span><strong>时间：</strong>${task.time}</div>`;
  detailHTML += `<div class="modal-item"><span class="modal-icon">${iconMap.category}</span><strong>分类：</strong>${task.category}</div>`;
  const priorityText = task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低';
  detailHTML += `
    <div class="modal-item">
      <span class="modal-icon">${iconMap.priority}</span>
      <strong>优先级：</strong>
      <span class="priority-tag ${task.priority}">${priorityText}</span>
    </div>
  `;

  if (task.goal) detailHTML += `<div class="modal-item"><span class="modal-icon">${iconMap.goal}</span><strong>学习目标：</strong>${task.goal}</div>`;
  if (task.task) detailHTML += `<div class="modal-item"><span class="modal-icon">${iconMap.task}</span><strong>学习任务：</strong>${task.task}</div>`;
  if (task.resources) detailHTML += `<div class="modal-item"><span class="modal-icon">${iconMap.resources}</span><strong>学习资源：</strong>${task.resources}</div>`;
  if (task.method) {
    const steps = task.method.split(/→|->|—|–|-/).map(s => s.trim()).filter(Boolean);
    if (steps.length > 1) {
      const stepsHTML = steps.map(step => `<span class="method-step">${step}</span>`).join(' → ');
      detailHTML += `
        <div class="modal-item">
          <span class="modal-icon">${iconMap.method}</span>
          <strong>学习方法：</strong>
          <div class="method-steps">${stepsHTML}</div>
        </div>
      `;
    } else {
      detailHTML += `<div class="modal-item"><span class="modal-icon">${iconMap.method}</span><strong>学习方法：</strong>${task.method}</div>`;
    }
  }

  document.getElementById('modal-content').innerHTML = detailHTML;
  document.getElementById('task-detail-modal').style.display = 'block';
}

function closeDetailModal() {
  document.getElementById('task-detail-modal').style.display = 'none';
}

function showCompletionAnimation(btn, text) {
  const animation = document.createElement('div');
  animation.className = 'completion-animation';
  animation.textContent = text;
  btn.parentElement.appendChild(animation);

  setTimeout(() => {
    if (animation.parentNode) {
      animation.parentNode.removeChild(animation);
    }
  }, 1200);
}

function updateStats(date, total, completed) {
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const points = completed * 10;

  const progressText = document.getElementById('progress-text');
  progressText.textContent = `${completed}/${total}`;

  document.getElementById('completion-rate').textContent = `${completionRate}%`;
  document.getElementById('points').textContent = points;

  const progressRing = document.querySelector('.circle-progress');
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (completionRate / 100) * circumference;
  progressRing.style.strokeDashoffset = offset;
}

// ✅ 关键修改：固定近7天为 2026-02-08 到 2026-02-14
function updateChart() {
  const ctx = document.getElementById('daily-chart').getContext('2d');
  if (window.dailyChart) window.dailyChart.destroy();

  const dates = [
    '2026-02-08', '2026-02-09', '2026-02-10',
    '2026-02-11', '2026-02-12', '2026-02-13', '2026-02-14'
  ];

  const dailyCounts = dates.map(date => {
    const tasks = plan[date] || [];
    return tasks.filter(t => t.completed).length;
  });

  const daysOfWeek = dates.map(date => {
    const d = new Date(date);
    const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekday[d.getDay()];
  });

  window.dailyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: daysOfWeek,
      datasets: [{
        label: '每日完成任务数',
        data: dailyCounts,
        backgroundColor: '#6D5FE8',
        borderColor: '#BB86FC',
        borderWidth: 2,
        borderRadius: 6,
        barThickness: 30,
        hoverBackgroundColor: '#BB86FC'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.1)' },
          ticks: { color: '#ccc' }
        },
        x: {
          grid: { color: 'transparent' },
          ticks: { color: '#ccc' }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      }
    }
  });
}

function toggleTheme() {
  const body = document.body;
  const isDark = body.classList.contains('dark-mode');

  if (isDark) {
    body.classList.remove('dark-mode');
    body.style.background = 'var(--bg-light)';
    document.querySelector('.theme-toggle button').textContent = '🌙';
  } else {
    body.classList.add('dark-mode');
    body.style.background = 'var(--bg-dark)';
    document.querySelector('.theme-toggle button').textContent = '☀️';
  }

  const elements = document.querySelectorAll(
    '.main-card, .stats-card, .task-item, .time-range-select select, .date-picker select, .add-task-form input, .add-task-form select, .complete-btn, .skip-btn, .delete-btn'
  );
  elements.forEach(el => el.classList.toggle('dark-mode', !isDark));
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function updatePomodoroDisplay() {
  document.getElementById('pomodoro-clock').textContent = formatTime(remainingTime);
}

function startPomodoro() {
  if (pomodoroInterval) return;
  pomodoroInterval = setInterval(() => {
    if (remainingTime > 0) {
      remainingTime--;
      updatePomodoroDisplay();
    } else {
      clearInterval(pomodoroInterval);
      pomodoroInterval = null;
      alert('🍅 番茄时间结束！休息一下吧~');
    }
  }, 1000);
}

function pausePomodoro() {
  if (pomodoroInterval) {
    clearInterval(pomodoroInterval);
    pomodoroInterval = null;
  }
}

function resetPomodoro() {
  pausePomodoro();
  remainingTime = 25 * 60;
  updatePomodoroDisplay();
}

async function exportReport() {
  const { jsPDF } = window.jspdf;
  const element = document.querySelector('.container');

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgWidth = 210;
  const pageHeight = 297;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(`LearnFlow_报告_${new Date().toISOString().slice(0,10)}.pdf`);
}

function toggleZenMode() {
  isZenMode = !isZenMode;
  document.body.classList.toggle('zen-mode', isZenMode);
  const zenBtn = document.getElementById('zen-mode');
  zenBtn.textContent = isZenMode ? '退出专注' : '🧘 专注模式';
    // 绑定退出按钮事件（即使初始隐藏，元素也存在）
  const exitBtn = document.getElementById('exit-zen-mode');
  if (exitBtn) {
    exitBtn.addEventListener('click', toggleZenMode);
  }
}

function backupData() {
  const dataStr = JSON.stringify(plan, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `learnflow-backup-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function restoreData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const restored = JSON.parse(event.target.result);
      Object.assign(plan, restored); // 安全合并
      loadTasks();
      updateChart();
      alert('数据恢复成功！');
    } catch (err) {
      alert('文件格式错误，无法恢复。');
      console.error(err);
    }
    e.target.value = '';
  };
  reader.readAsText(file);
}

function checkTimeReminders() {
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  const currentHour = String(now.getHours()).padStart(2, '0');
  const currentMinute = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${currentHour}:${currentMinute}`;

  const tasks = plan[currentDate] || [];
  for (const task of tasks) {
    if (!task.completed && task.time === currentTime) {
      if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('⏰ LearnFlow 提醒', {
              body: `现在是 ${task.time}，该进行「${task.title}」了！`,
              icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%236D5FE8" d="M12 2L2 7v10c0 5.55 3.84 9.73 9 11 5.16-1.27 9-5.45 9-11V7l-10-5z"/></svg>'
            });
          }
        });
      }
      console.log(`⏰ 提醒：现在是 ${task.time}，该进行「${task.title}」了！`);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // 默认选中 2026-02-08（周日）
  document.getElementById('date-select').value = '2026-02-08';

  // 绑定事件
  document.getElementById('zen-mode').addEventListener('click', toggleZenMode);
  document.getElementById('backup-data').addEventListener('click', backupData);
  document.getElementById('restore-data').addEventListener('click', () => document.getElementById('restore-file').click());
  document.getElementById('restore-file').addEventListener('change', restoreData);
  document.querySelector('.close').addEventListener('click', closeDetailModal);
  document.getElementById('close-detail').addEventListener('click', closeDetailModal);

  // 初始化
  loadTasks();
  updateChart(); // 使用固定7天

  // 每分钟检查提醒
  setInterval(checkTimeReminders, 60000);
})
