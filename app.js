// ========================================
// Hebrew Student Learning Platform - App.js
// ========================================

// Global State
let currentUser = null
const currentSection = "home"
let currentNote = null
let translations = {}

// ========================================
// Initialization
// ========================================
document.addEventListener("DOMContentLoaded", () => {
  initAuth()
  initNavigation()
  initToolCards()
  initTabs()
  initEssayWriter()
  initEssayImprover()
  initHomeworkHelper()
  initMathSolver()
  initSummarizer()
  initQuizGenerator()
  initVoiceRecorder()
  initSpeechToText()
  initReadingPractice()
  initCalculator()
  initNotes()
  initTodoList()
  initPomodoro()
  initChatTutor()
  initStudyPlanner()
  initFlashcards() // This function has been completely rewritten.
  initDictionary() // This function has been completely rewritten.
  initTranslator() // This function has been completely rewritten using MyMemory API.
  loadTranslations() // This is the one that needs fixing.
  updateStats()
})

// ========================================
// Authentication System
// ========================================
function initAuth() {
  const authOverlay = document.getElementById("authOverlay")
  const loginForm = document.getElementById("loginForm")
  const registerForm = document.getElementById("registerForm")
  const showRegisterLink = document.getElementById("showRegister")
  const showLoginLink = document.getElementById("showLogin")
  const loginBtn = document.getElementById("loginBtn")
  const registerBtn = document.getElementById("registerBtn")
  const authError = document.getElementById("authError")
  const userMenuBtn = document.getElementById("userMenuBtn")
  const settingsOverlay = document.getElementById("settingsOverlay")
  const closeSettings = document.getElementById("closeSettings")
  const saveSettings = document.getElementById("saveSettings")
  const logoutBtn = document.getElementById("logoutBtn")

  // Check if user is logged in
  const savedUser = localStorage.getItem("currentUser")
  if (savedUser) {
    currentUser = JSON.parse(savedUser)
    authOverlay.classList.add("hidden")
    updateUserDisplay()
  }

  // Toggle between login and register forms
  showRegisterLink?.addEventListener("click", (e) => {
    e.preventDefault()
    loginForm.classList.add("hidden")
    registerForm.classList.remove("hidden")
    authError.classList.add("hidden")
  })

  showLoginLink?.addEventListener("click", (e) => {
    e.preventDefault()
    registerForm.classList.add("hidden")
    loginForm.classList.remove("hidden")
    authError.classList.add("hidden")
  })

  // Login handler
  loginBtn?.addEventListener("click", () => {
    const email = document.getElementById("loginEmail").value.trim()
    const password = document.getElementById("loginPassword").value

    if (!email || !password) {
      showAuthError("אנא מלא את כל השדות")
      return
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const user = users.find((u) => u.email === email && u.password === password)

    if (user) {
      currentUser = user
      localStorage.setItem("currentUser", JSON.stringify(user))
      authOverlay.classList.add("hidden")
      updateUserDisplay()
      updateStreak()
    } else {
      showAuthError("אימייל או סיסמה שגויים")
    }
  })

  // Register handler
  registerBtn?.addEventListener("click", () => {
    const name = document.getElementById("registerName").value.trim()
    const email = document.getElementById("registerEmail").value.trim()
    const password = document.getElementById("registerPassword").value
    const grade = document.getElementById("registerGrade").value

    if (!name || !email || !password) {
      showAuthError("אנא מלא את כל השדות")
      return
    }

    if (password.length < 6) {
      showAuthError("הסיסמה חייבת להכיל לפחות 6 תווים")
      return
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]")
    if (users.find((u) => u.email === email)) {
      showAuthError("כתובת האימייל כבר קיימת במערכת")
      return
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
      grade,
      points: 0,
      streak: 0,
      lastLogin: new Date().toISOString(),
      settings: {
        language: "he",
        theme: "light",
        fontSize: "medium",
        notifyPomodoro: true,
        notifyTasks: true,
        sound: true,
      },
    }

    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))

    currentUser = newUser
    localStorage.setItem("currentUser", JSON.stringify(newUser))
    authOverlay.classList.add("hidden")
    updateUserDisplay()
  })

  // Settings modal
  userMenuBtn?.addEventListener("click", () => {
    loadSettingsForm()
    settingsOverlay.classList.remove("hidden")
  })

  closeSettings?.addEventListener("click", () => {
    settingsOverlay.classList.add("hidden")
  })

  saveSettings?.addEventListener("click", () => {
    saveUserSettings()
    settingsOverlay.classList.add("hidden")
  })

  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("currentUser")
    currentUser = null
    settingsOverlay.classList.add("hidden")
    authOverlay.classList.remove("hidden")
    loginForm.classList.remove("hidden")
    registerForm.classList.add("hidden")
  })

  // Export data
  document.getElementById("exportData")?.addEventListener("click", exportUserData)

  // Clear data
  document.getElementById("clearData")?.addEventListener("click", () => {
    if (confirm("האם אתה בטוח שברצונך למחוק את כל הנתונים? פעולה זו בלתי הפיכה.")) {
      const userId = currentUser.id
      localStorage.removeItem(`notes_${userId}`)
      localStorage.removeItem(`todos_${userId}`)
      localStorage.removeItem(`recordings_${userId}`)
      localStorage.removeItem(`flashcards_${userId}`)
      alert("הנתונים נמחקו בהצלחה")
    }
  })

  function showAuthError(message) {
    authError.textContent = message
    authError.classList.add("hidden")
  }
}

function updateUserDisplay() {
  if (!currentUser) return

  const userName = document.getElementById("userName")
  const userAvatar = document.getElementById("userAvatar")
  const heroGreeting = document.getElementById("heroGreeting")
  const userPoints = document.getElementById("userPoints")
  const userStreak = document.getElementById("userStreak")

  if (userName) userName.textContent = currentUser.name
  if (userAvatar) userAvatar.textContent = currentUser.name.charAt(0)
  if (heroGreeting) heroGreeting.textContent = `שלום ${currentUser.name}! 👋`
  if (userPoints) userPoints.textContent = currentUser.points || 0
  if (userStreak) userStreak.textContent = currentUser.streak || 0

  // Apply user settings
  if (currentUser.settings) {
    applyUserSettings(currentUser.settings)
  }
}

function loadSettingsForm() {
  if (!currentUser) return

  document.getElementById("settingsName").value = currentUser.name
  document.getElementById("settingsEmail").value = currentUser.email
  document.getElementById("settingsGrade").value = currentUser.grade

  const settings = currentUser.settings || {}
  document.getElementById("settingsLanguage").value = settings.language || "he"
  document.getElementById("settingsTheme").value = settings.theme || "light"
  document.getElementById("settingsFontSize").value = settings.fontSize || "medium"
  document.getElementById("settingsNotifyPomodoro").checked = settings.notifyPomodoro !== false
  document.getElementById("settingsNotifyTasks").checked = settings.notifyTasks !== false
  document.getElementById("settingsSound").checked = settings.sound !== false
}

function saveUserSettings() {
  if (!currentUser) return

  currentUser.name = document.getElementById("settingsName").value
  currentUser.grade = document.getElementById("settingsGrade").value
  currentUser.settings = {
    language: document.getElementById("settingsLanguage").value,
    theme: document.getElementById("settingsTheme").value,
    fontSize: document.getElementById("settingsFontSize").value,
    notifyPomodoro: document.getElementById("settingsNotifyPomodoro").checked,
    notifyTasks: document.getElementById("settingsNotifyTasks").checked,
    sound: document.getElementById("settingsSound").checked,
  }

  // Update in localStorage
  localStorage.setItem("currentUser", JSON.stringify(currentUser))

  const users = JSON.parse(localStorage.getItem("users") || "[]")
  const userIndex = users.findIndex((u) => u.id === currentUser.id)
  if (userIndex !== -1) {
    users[userIndex] = currentUser
    localStorage.setItem("users", JSON.stringify(users))
  }

  applyUserSettings(currentUser.settings)
  updateUserDisplay()
}

function applyUserSettings(settings) {
  // Apply theme
  document.body.classList.remove("theme-dark", "theme-blue", "theme-green")
  if (settings.theme && settings.theme !== "light") {
    document.body.classList.add(`theme-${settings.theme}`)
  }

  // Apply font size
  document.body.classList.remove("font-small", "font-large")
  if (settings.fontSize === "small") {
    document.body.classList.add("font-small")
  } else if (settings.fontSize === "large") {
    document.body.classList.add("font-large")
  }

  // Apply language
  if (settings.language === "en") {
    document.body.classList.add("lang-en")
    document.documentElement.dir = "ltr"
    document.documentElement.lang = "en"
    applyTranslations("en") // This is the one that needs fixing.
  } else {
    document.body.classList.remove("lang-en")
    document.documentElement.dir = "rtl"
    document.documentElement.lang = "he"
    applyTranslations("he") // This is the one that needs fixing.
  }
}

function updateStreak() {
  if (!currentUser) return

  const today = new Date().toDateString()
  const lastLogin = currentUser.lastLogin ? new Date(currentUser.lastLogin).toDateString() : null

  if (lastLogin !== today) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    if (lastLogin === yesterday.toDateString()) {
      currentUser.streak = (currentUser.streak || 0) + 1
    } else if (lastLogin !== today) {
      currentUser.streak = 1
    }

    currentUser.lastLogin = new Date().toISOString()
    localStorage.setItem("currentUser", JSON.stringify(currentUser))

    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const userIndex = users.findIndex((u) => u.id === currentUser.id)
    if (userIndex !== -1) {
      users[userIndex] = currentUser
      localStorage.setItem("users", JSON.stringify(users))
    }
  }
}

function addPoints(points) {
  if (!currentUser) return

  currentUser.points = (currentUser.points || 0) + points
  localStorage.setItem("currentUser", JSON.stringify(currentUser))

  const users = JSON.parse(localStorage.getItem("users") || "[]")
  const userIndex = users.findIndex((u) => u.id === currentUser.id)
  if (userIndex !== -1) {
    users[userIndex] = currentUser
    localStorage.setItem("users", JSON.stringify(users))
  }

  const userPoints = document.getElementById("userPoints")
  if (userPoints) userPoints.textContent = currentUser.points
}

function exportUserData() {
  if (!currentUser) return

  const data = {
    user: currentUser,
    notes: JSON.parse(localStorage.getItem(`notes_${currentUser.id}`) || "[]"),
    todos: JSON.parse(localStorage.getItem(`todos_${currentUser.id}`) || "[]"),
    recordings: JSON.parse(localStorage.getItem(`recordings_${currentUser.id}`) || "[]"),
    flashcards: JSON.parse(localStorage.getItem(`flashcards_${currentUser.id}`) || "[]"),
    studySessions: JSON.parse(localStorage.getItem(`studySessions_${currentUser.id}`) || "[]"),
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `student-data-${currentUser.name}-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// ========================================
// Translations System
// ========================================
function loadTranslations() {
  translations = {
    he: {
      appName: "תיק הלימודים החכם",
      "nav.home": "בית",
      "nav.writing": "כתיבה",
      "nav.learning": "למידה",
      "nav.voice": "קול",
      "nav.tools": "כלים",
      "nav.planner": "תכנון",
      "hero.title": "תיק הלימודים החכם שלך",
      "hero.subtitle": "כל הכלים שאתה צריך להצלחה בלימודים - במקום אחד",
      "hero.tools": "כלי למידה",
      "hero.streak": "ימי למידה רצופים",
      "hero.points": "נקודות",
    },
    en: {
      appName: "Smart Learning Bag",
      "nav.home": "Home",
      "nav.writing": "Writing",
      "nav.learning": "Learning",
      "nav.voice": "Voice",
      "nav.tools": "Tools",
      "nav.planner": "Planner",
      "hero.title": "Your Smart Learning Bag",
      "hero.subtitle": "All the tools you need to succeed in your studies - in one place",
      "hero.tools": "Learning Tools",
      "hero.streak": "Day Streak",
      "hero.points": "Points",
    },
  }
}

function applyTranslations(lang) {
  const elements = document.querySelectorAll("[data-translate]")
  elements.forEach((el) => {
    const key = el.dataset.translate
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key]
    }
  })
}

// ========================================
// Navigation
// ========================================
function initNavigation() {
  const navLinks = document.querySelectorAll(".nav-link")
  const sections = document.querySelectorAll(".section")
  const mobileMenuBtn = document.getElementById("mobileMenuBtn")
  const navLinksContainer = document.getElementById("navLinks")

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const sectionId = link.dataset.section

      // Update active nav link
      navLinks.forEach((l) => l.classList.remove("active"))
      link.classList.add("active")

      // Show corresponding section
      sections.forEach((s) => s.classList.remove("active"))
      document.getElementById(sectionId)?.classList.add("active")

      // Hide credits section
      document.getElementById("credits-section")?.classList.remove("active")

      // Close mobile menu
      navLinksContainer.classList.remove("active")
    })
  })

  // Mobile menu toggle
  mobileMenuBtn?.addEventListener("click", () => {
    navLinksContainer.classList.toggle("active")
  })
}

// ========================================
// Tool Cards
// ========================================
function initToolCards() {
  const toolCards = document.querySelectorAll(".tool-card")

  const toolToSection = {
    "essay-writer": { section: "writing", tab: "essay-writer" },
    "essay-improver": { section: "writing", tab: "essay-improver" },
    "homework-helper": { section: "learning", tab: "homework" },
    "math-solver": { section: "learning", tab: "math" },
    summarizer: { section: "learning", tab: "summarizer" },
    "quiz-generator": { section: "learning", tab: "quiz" },
    "voice-recorder": { section: "voice", tab: "recorder" },
    "voice-to-text": { section: "voice", tab: "speech-to-text" },
    "reading-practice": { section: "voice", tab: "reading" },
    calculator: { section: "tools", tab: "calculator" },
    notes: { section: "tools", tab: "notes" },
    todo: { section: "tools", tab: "todo" },
    pomodoro: { section: "tools", tab: "pomodoro" },
    "chat-tutor": { section: "tools", tab: "chat" },
    "study-planner": { section: "planner", tab: null },
    flashcards: { section: "learning", tab: "flashcards" },
    dictionary: { section: "learning", tab: "dictionary" },
    translator: { section: "voice", tab: "translator" },
  }

  toolCards.forEach((card) => {
    card.addEventListener("click", () => {
      const tool = card.dataset.tool
      const mapping = toolToSection[tool]

      if (mapping) {
        // Navigate to section
        document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"))
        document.querySelector(`.nav-link[data-section="${mapping.section}"]`)?.classList.add("active")

        document.querySelectorAll(".section").forEach((s) => s.classList.remove("active"))
        document.getElementById(mapping.section)?.classList.add("active")

        // Activate tab if specified
        if (mapping.tab) {
          const sectionTabs = document.querySelectorAll(`#${mapping.section} .tab-btn`)
          const sectionContents = document.querySelectorAll(`#${mapping.section} .tab-content`)

          sectionTabs.forEach((t) => t.classList.remove("active"))
          sectionContents.forEach((c) => c.classList.remove("active"))

          document.querySelector(`#${mapping.section} .tab-btn[data-tab="${mapping.tab}"]`)?.classList.add("active")
          document.getElementById(`${mapping.tab}-tab`)?.classList.add("active")
        }
      }
    })
  })
}

// ========================================
// Tabs
// ========================================
function initTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn")

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabGroup = btn.closest(".section")
      const tabId = btn.dataset.tab

      // Update buttons
      tabGroup.querySelectorAll(".tab-btn").forEach((t) => t.classList.remove("active"))
      btn.classList.add("active")

      // Update content
      tabGroup.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"))
      document.getElementById(`${tabId}-tab`)?.classList.add("active")
    })
  })
}

// ========================================
// Essay Writer
// ========================================
function initEssayWriter() {
  const generateBtn = document.getElementById("generateEssay")
  const output = document.getElementById("essayOutput")

  generateBtn?.addEventListener("click", () => {
    const topic = document.getElementById("essayTopic").value.trim()
    const length = document.getElementById("essayLength").value
    const style = document.getElementById("essayStyle").value

    if (!topic) {
      output.innerHTML = '<p style="color: var(--danger);">אנא הכנס נושא לחיבור</p>'
      return
    }

    output.innerHTML = '<p style="color: var(--primary);">יוצר חיבור...</p>'

    setTimeout(() => {
      const essay = generateEssay(topic, length, style)
      output.innerHTML = essay
      addPoints(10)
    }, 1500)
  })
}

function generateEssay(topic, length, style) {
  const styleIntros = {
    argumentative: `נושא ${topic} מעלה שאלות חשובות שיש לדון בהן לעומק. בחיבור זה אציג את עמדתי בנושא ואתמוך בה בטיעונים מבוססים.`,
    descriptive: `כשאני חושב על ${topic}, תמונות רבות עולות במחשבתי. בחיבור זה אתאר את הנושא באופן מפורט ומעמיק.`,
    narrative: `הסיפור שלי עם ${topic} התחיל ביום בהיר אחד, כאשר גיליתי לראשונה את המשמעות העמוקה שטמונה בו.`,
    analytical: `ניתוח מעמיק של ${topic} מגלה היבטים רבים ומורכבים. בחיבור זה אבחן את הנושא מזוויות שונות.`,
  }

  const styleConclusions = {
    argumentative: `לסיכום, הטיעונים שהוצגו מוכיחים בבירור את חשיבות הנושא. ${topic} הוא עניין שיש להמשיך לדון בו ולפעול לגביו.`,
    descriptive: `כך נראה ${topic} בעיניי - מורכב, מרתק ומלא בפרטים שראויים לתשומת לב. התיאור שהצגתי משקף רק חלק מהעושר הטמון בנושא.`,
    narrative: `וכך הסתיים הסיפור שלי עם ${topic}. הלקח שלמדתי ילווה אותי לתמיד ויעצב את הדרך בה אני מתבונן בעולם.`,
    analytical: `הניתוח שערכנו מראה כי ${topic} הוא נושא רב-ממדי. הבנה מעמיקה שלו דורשת התבוננות מתמדת ופתיחות לרעיונות חדשים.`,
  }

  const bodyParagraphs = {
    short: 1,
    medium: 2,
    long: 3,
  }

  let essay = `<h4>חיבור: ${topic}</h4>\n\n`
  essay += `<strong>פתיחה:</strong>\n${styleIntros[style]}\n\n`

  for (let i = 0; i < bodyParagraphs[length]; i++) {
    essay += `<strong>גוף ${i + 1}:</strong>\n`
    essay += `היבט ${i === 0 ? "ראשון" : i === 1 ? "שני" : "שלישי"} של ${topic} נוגע לתחום חשוב בחיינו. `
    essay += `כאשר מתבוננים בנושא זה, ניתן לראות כיצד הוא משפיע על מגוון תחומים. `
    essay += `חשוב לזכור כי הבנה מעמיקה של הנושא תסייע לנו להתמודד עם אתגרים עתידיים.\n\n`
  }

  essay += `<strong>סיכום:</strong>\n${styleConclusions[style]}`

  return essay
}

// ========================================
// Essay Improver
// ========================================
function initEssayImprover() {
  const improveBtn = document.getElementById("improveText")
  const output = document.getElementById("improvedTextOutput")

  improveBtn?.addEventListener("click", () => {
    const text = document.getElementById("textToImprove").value.trim()
    const grammar = document.getElementById("improveGrammar").checked
    const clarity = document.getElementById("improveClarity").checked
    const structure = document.getElementById("improveStructure").checked
    const vocabulary = document.getElementById("improveVocabulary").checked

    if (!text) {
      output.innerHTML = '<p style="color: var(--danger);">אנא הכנס טקסט לשיפור</p>'
      return
    }

    output.innerHTML = '<p style="color: var(--primary);">משפר טקסט...</p>'

    setTimeout(() => {
      let improved = text

      if (grammar) {
        improved = improved.replace(/\s+/g, " ")
        improved = improved.replace(/\s+\./g, ".")
        improved = improved.replace(/\s+,/g, ",")
      }

      if (clarity) {
        improved = improved.replace(/מאוד מאוד/g, "ביותר")
        improved = improved.replace(/הרבה הרבה/g, "רבים")
      }

      if (vocabulary) {
        improved = improved.replace(/טוב/g, "מצוין")
        improved = improved.replace(/רע/g, "שלילי")
        improved = improved.replace(/גדול/g, "ניכר")
        improved = improved.replace(/קטן/g, "מועט")
      }

      output.innerHTML = `
        <h4>טקסט משופר:</h4>
        <p>${improved}</p>
        <hr style="margin: 1rem 0;">
        <h4>שיפורים שבוצעו:</h4>
        <ul>
          ${grammar ? "<li>תוקנו שגיאות דקדוק ופיסוק</li>" : ""}
          ${clarity ? "<li>שופרה הבהירות והקריאות</li>" : ""}
          ${structure ? "<li>שופר מבנה המשפטים</li>" : ""}
          ${vocabulary ? "<li>הועשר אוצר המילים</li>" : ""}
        </ul>
      `
      addPoints(5)
    }, 1000)
  })
}

// ========================================
// Homework Helper
// ========================================
function initHomeworkHelper() {
  const helpBtn = document.getElementById("getHomeworkHelp")
  const output = document.getElementById("homeworkOutput")

  helpBtn?.addEventListener("click", () => {
    const subject = document.getElementById("homeworkSubject").value
    const question = document.getElementById("homeworkQuestion").value.trim()

    if (!question) {
      output.innerHTML = '<p style="color: var(--danger);">אנא הכנס שאלה או נושא</p>'
      return
    }

    output.innerHTML = '<p style="color: var(--primary);">מחפש תשובה...</p>'

    setTimeout(() => {
      const help = generateHomeworkHelp(subject, question)
      output.innerHTML = help
      addPoints(5)
    }, 1200)
  })
}

function generateHomeworkHelp(subject, question) {
  const subjectTips = {
    hebrew: {
      name: "עברית",
      tips: [
        "שים לב לשורש המילה ולמשקל",
        "בדוק את זמן הפועל (עבר, הווה, עתיד)",
        "הקפד על התאמה בין נושא לנשוא",
        "זכור את כללי הפיסוק הבסיסיים",
      ],
    },
    math: {
      name: "מתמטיקה",
      tips: [
        "קרא את השאלה פעמיים לפחות",
        "זהה את הנתונים והנעלמים",
        "בחר את הנוסחה המתאימה",
        "בדוק את התשובה על ידי הצבה",
      ],
    },
    english: {
      name: "אנגלית",
      tips: [
        "שים לב לזמני הפועל (tenses)",
        "הקפד על סדר המילים במשפט",
        "זכור את כללי הרבים",
        "בדוק התאמה בין subject ו-verb",
      ],
    },
    science: {
      name: "מדעים",
      tips: [
        "הבן את העקרון המדעי הבסיסי",
        "חפש קשרים בין סיבה לתוצאה",
        "השתמש בדוגמאות מהחיים",
        "זכור את ההגדרות המדויקות",
      ],
    },
    history: {
      name: "היסטוריה",
      tips: [
        "זכור את הסדר הכרונולוגי של האירועים",
        "הבן את הסיבות והתוצאות",
        "קשר בין אירועים שונים",
        "זכור תאריכים ושמות חשובים",
      ],
    },
    bible: {
      name: 'תנ"ך',
      tips: ["הבן את ההקשר של הסיפור", "שים לב למסרים ולמוסר השכל", "הכר את הדמויות המרכזיות", "חפש קשרים בין פרשיות"],
    },
    civics: {
      name: "אזרחות",
      tips: [
        "הבן את מבנה השלטון בישראל",
        "הכר את הזכויות והחובות",
        "למד את החוקים הבסיסיים",
        "הבין את המושגים הדמוקרטיים",
      ],
    },
    literature: {
      name: "ספרות",
      tips: [
        "הבן את הרקע ההיסטורי של היצירה",
        "נתח את הדמויות ומניעיהן",
        "זהה נושאים ומוטיבים מרכזיים",
        "שים לב לאמצעים ספרותיים",
      ],
    },
    geography: {
      name: "גיאוגרפיה",
      tips: [
        "הכר את המפות והמיקומים",
        "הבן תופעות טבע ואקלים",
        "למד על אוכלוסיות ותרבויות",
        "זכור נתונים סטטיסטיים חשובים",
      ],
    },
  }

  const info = subjectTips[subject] || subjectTips.hebrew

  return `
    <h4>עזרה ב${info.name}: ${question}</h4>
    
    <p><strong>גישה לפתרון:</strong></p>
    <p>כדי לענות על שאלה זו, כדאי לפעול בצעדים הבאים:</p>
    
    <ol>
      <li>קרא את השאלה בעיון וודא שהבנת מה נדרש</li>
      <li>זהה את המושגים המרכזיים בשאלה</li>
      <li>חפש מידע רלוונטי בחומר הלימוד</li>
      <li>ארגן את התשובה בצורה ברורה ומסודרת</li>
    </ol>
    
    <p><strong>טיפים ל${info.name}:</strong></p>
    <ul>
      ${info.tips.map((tip) => `<li>${tip}</li>`).join("")}
    </ul>
    
    <p><strong>המלצה:</strong> אם עדיין לא ברור, נסה לחפש דוגמאות דומות בספר הלימוד או לשאול את המורה.</p>
  `
}

// ========================================
// Math Solver
// ========================================
function initMathSolver() {
  const solveBtn = document.getElementById("solveMath")
  const output = document.getElementById("mathOutput")

  solveBtn?.addEventListener("click", () => {
    const type = document.getElementById("mathType").value
    const problem = document.getElementById("mathProblem").value.trim()

    if (!problem) {
      output.innerHTML = '<p style="color: var(--danger);">אנא הכנס תרגיל</p>'
      return
    }

    output.innerHTML = '<p style="color: var(--primary);">פותר...</p>'

    setTimeout(() => {
      const solution = solveMathProblem(type, problem)
      output.innerHTML = solution
      addPoints(5)
    }, 1000)
  })
}

function solveMathProblem(type, problem) {
  // Try to parse linear equations
  if (type === "linear") {
    const match = problem.match(/(-?\d*)x\s*([+-])\s*(\d+)\s*=\s*(-?\d+)/)
    if (match) {
      const a = match[1] === "" || match[1] === "+" ? 1 : match[1] === "-" ? -1 : Number.parseInt(match[1])
      const op = match[2]
      let b = Number.parseInt(match[3])
      const c = Number.parseInt(match[4])

      if (op === "-") b = -b

      const x = (c - b) / a

      return `
        <h4>פתרון משוואה ממעלה ראשונה</h4>
        <p><strong>התרגיל:</strong> ${problem}</p>
        <hr>
        <p><strong>שלב 1:</strong> נעביר את ${b > 0 ? b : `(${b})`} לאגף השני</p>
        <p>${a}x = ${c} ${b > 0 ? "-" : "+"} ${Math.abs(b)}</p>
        <p>${a}x = ${c - b}</p>
        <p><strong>שלב 2:</strong> נחלק ב-${a}</p>
        <p>x = ${c - b} / ${a}</p>
        <p><strong>התשובה:</strong> x = ${x}</p>
      `
    }
  }

  // Quadratic equation
  if (type === "quadratic") {
    return `
      <h4>פתרון משוואה ריבועית</h4>
      <p><strong>התרגיל:</strong> ${problem}</p>
      <hr>
      <p>משתמשים בנוסחת השורשים:</p>
      <p>x = (-b ± √(b² - 4ac)) / 2a</p>
      <p><strong>שלבים:</strong></p>
      <ol>
        <li>זהה את המקדמים a, b, c</li>
        <li>חשב את הדיסקרימיננטה: Δ = b² - 4ac</li>
        <li>הצב בנוסחה וחשב את הפתרונות</li>
      </ol>
    `
  }

  // Generic response for other types
  return `
    <h4>עזרה בפתרון: ${problem}</h4>
    <p>סוג התרגיל: ${type}</p>
    <hr>
    <p><strong>צעדים לפתרון:</strong></p>
    <ol>
      <li>זהה את הנתונים בתרגיל</li>
      <li>בחר את הנוסחה או השיטה המתאימה</li>
      <li>בצע את החישובים בזהירות</li>
      <li>בדוק את התשובה</li>
    </ol>
    <p>נסה להשתמש במחשבון המדעי לחישובים מורכבים.</p>
  `
}

// ========================================
// Text Summarizer
// ========================================
function initSummarizer() {
  const summarizeBtn = document.getElementById("summarizeText")
  const output = document.getElementById("summaryOutput")
  const lengthSlider = document.getElementById("summaryLength")
  const lengthValue = document.getElementById("summaryLengthValue")

  lengthSlider?.addEventListener("input", () => {
    lengthValue.textContent = `${lengthSlider.value}%`
  })

  summarizeBtn?.addEventListener("click", () => {
    const text = document.getElementById("textToSummarize").value.trim()
    const length = Number.parseInt(lengthSlider.value)

    if (!text) {
      output.innerHTML = '<p style="color: var(--danger);">אנא הכנס טקסט לסיכום</p>'
      return
    }

    output.innerHTML = '<p style="color: var(--primary);">מסכם טקסט...</p>'

    setTimeout(() => {
      const summary = summarizeText(text, length)
      output.innerHTML = summary
      addPoints(5)
    }, 1000)
  })
}

function summarizeText(text, lengthPercent) {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  const targetSentences = Math.max(1, Math.ceil(sentences.length * (lengthPercent / 100)))
  const selectedSentences = sentences.slice(0, targetSentences)

  const summary = selectedSentences.join(". ") + "."

  return `
    <h4>סיכום הטקסט (${lengthPercent}%)</h4>
    <p>${summary}</p>
    <hr>
    <p><strong>סטטיסטיקה:</strong></p>
    <ul>
      <li>משפטים מקוריים: ${sentences.length}</li>
      <li>משפטים בסיכום: ${targetSentences}</li>
      <li>מילים מקוריות: ${text.split(/\s+/).length}</li>
      <li>מילים בסיכום: ${summary.split(/\s+/).length}</li>
    </ul>
  `
}

// ========================================
// Quiz Generator
// ========================================
// ========================================
function initQuizGenerator() {
  const generateBtn = document.getElementById("generateQuiz")
  const output = document.getElementById("quizOutput")

  generateBtn?.addEventListener("click", () => {
    const sourceText = document.getElementById("quizSourceText").value.trim()
    const quizType = document.getElementById("quizType").value
    const count = Number.parseInt(document.getElementById("quizCount").value)

    if (!sourceText) {
      output.innerHTML = '<p style="color: var(--danger);">אנא הכנס טקסט מקור</p>'
      return
    }

    if (sourceText.length < 50) {
      output.innerHTML = '<p style="color: var(--danger);">הטקסט קצר מדי. נא להכניס טקסט ארוך יותר (לפחות 50 תווים)</p>'
      return
    }

    output.innerHTML = '<p style="color: var(--primary);">מנתח את הטקסט ויוצר שאלות...</p>'

    setTimeout(() => {
      const quiz = generateSmartQuiz(sourceText, quizType, count)
      output.innerHTML = quiz
      addPoints(10)
    }, 1500)
  })
}

function generateSmartQuiz(text, type, count) {
  // Extract meaningful information from text
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 15)

  // Extract key terms and concepts
  const words = text.split(/\s+/)
  const importantWords = words.filter((w) => w.length > 3 && !commonWords.includes(w.toLowerCase()))

  // Question templates for different types
  const multipleChoiceTemplates = [
    { q: "מה הרעיון המרכזי של הטקסט?", generate: (s) => generateMainIdeaOptions(s, text) },
    { q: "איזו טענה נכונה לפי הטקסט?", generate: (s) => generateTrueClaimOptions(s, text) },
    { q: "מה המשמעות של הקטע הבא?", generate: (s) => generateMeaningOptions(s) },
    { q: "מה ניתן להסיק מהטקסט?", generate: (s) => generateInferenceOptions(s, text) },
    { q: "איזו מילה מתארת בצורה הטובה ביותר את הנושא?", generate: (s) => generateWordOptions(importantWords) },
  ]

  const openQuestionTemplates = [
    "הסבר במילותיך את הרעיון המרכזי של הטקסט.",
    "מהם הטיעונים העיקריים שמוצגים בטקסט?",
    "כיצד הייתה משתנה המשמעות אם הטקסט היה נכתב מנקודת מבט אחרת?",
    "מה דעתך על הנושא המוצג? נמק את תשובתך.",
    "תאר את הקשר בין הרעיונות השונים בטקסט.",
    "מהו המסר שהכותב מנסה להעביר?",
    "האם אתה מסכים עם עמדת הכותב? הסבר מדוע.",
  ]

  const trueFalseTemplates = [
    { statement: (s) => s, isTrue: true },
    { statement: (s) => reverseStatement(s), isTrue: false },
    { statement: (s) => exaggerateStatement(s), isTrue: false },
  ]

  let questions = '<div class="quiz-container">'
  const usedTemplates = []

  for (let i = 0; i < Math.min(count, 10); i++) {
    const sentence = sentences[i % sentences.length]?.trim() || text.substring(0, 100)

    if (type === "multiple" || (type === "mixed" && i % 3 === 0)) {
      const template = multipleChoiceTemplates[i % multipleChoiceTemplates.length]
      const options = template.generate(sentence)

      questions += `
        <div class="quiz-question">
          <p class="question-number">שאלה ${i + 1}</p>
          <p class="question-text"><strong>${template.q}</strong></p>
          ${sentence.length < 200 ? `<p class="question-context">"${sentence}"</p>` : ""}
          <div class="quiz-options">
            ${options
              .map(
                (opt, idx) => `
              <label class="quiz-option">
                <input type="radio" name="q${i}" value="${idx}" ${opt.correct ? 'data-correct="true"' : ""}>
                <span>${["א", "ב", "ג", "ד"][idx]}. ${opt.text}</span>
              </label>
            `,
              )
              .join("")}
          </div>
          <button class="btn btn-sm check-answer" onclick="checkQuizAnswer(${i})">בדוק תשובה</button>
          <p class="answer-feedback" id="feedback-${i}"></p>
        </div>
      `
    } else if (type === "open" || (type === "mixed" && i % 3 === 1)) {
      const question = openQuestionTemplates[i % openQuestionTemplates.length]

      questions += `
        <div class="quiz-question">
          <p class="question-number">שאלה ${i + 1}</p>
          <p class="question-text"><strong>${question}</strong></p>
          <p class="question-context">"${sentence.substring(0, 150)}${sentence.length > 150 ? "..." : ""}"</p>
          <textarea class="quiz-answer" rows="4" placeholder="כתוב את תשובתך כאן..."></textarea>
          <div class="answer-tips">
            <strong>טיפים לתשובה טובה:</strong>
            <ul>
              <li>התייחס ישירות לשאלה</li>
              <li>השתמש בדוגמאות מהטקסט</li>
              <li>נמק את תשובתך</li>
            </ul>
          </div>
        </div>
      `
    } else if (type === "truefalse" || (type === "mixed" && i % 3 === 2)) {
      const tfTemplate = trueFalseTemplates[i % trueFalseTemplates.length]
      const statement = tfTemplate.statement(sentence.substring(0, 100))
      const isTrue = tfTemplate.isTrue

      questions += `
        <div class="quiz-question">
          <p class="question-number">שאלה ${i + 1}</p>
          <p class="question-text"><strong>נכון או לא נכון?</strong></p>
          <p class="question-statement">"${statement}"</p>
          <div class="quiz-options tf-options">
            <label class="quiz-option">
              <input type="radio" name="q${i}" value="true" ${isTrue ? 'data-correct="true"' : ""}>
              <span>✓ נכון</span>
            </label>
            <label class="quiz-option">
              <input type="radio" name="q${i}" value="false" ${!isTrue ? 'data-correct="true"' : ""}>
              <span>✗ לא נכון</span>
            </label>
          </div>
          <button class="btn btn-sm check-answer" onclick="checkQuizAnswer(${i})">בדוק תשובה</button>
          <p class="answer-feedback" id="feedback-${i}"></p>
        </div>
      `
    }
  }

  questions += `
    <div class="quiz-summary">
      <button class="btn btn-primary" onclick="checkAllAnswers()">בדוק את כל התשובות</button>
      <p id="quiz-score"></p>
    </div>
  </div>`

  return questions
}

// Common Hebrew words to filter out
const commonWords = [
  "את",
  "של",
  "על",
  "עם",
  "כי",
  "לא",
  "גם",
  "או",
  "אם",
  "הוא",
  "היא",
  "הם",
  "הן",
  "אני",
  "אתה",
  "את",
  "זה",
  "זו",
  "אלה",
  "מה",
  "מי",
  "איך",
  "למה",
  "כמה",
  "אבל",
  "רק",
  "עוד",
  "כל",
  "כאשר",
  "היה",
  "היתה",
  "היו",
  "יש",
  "אין",
  "בין",
  "לפי",
  "כדי",
  "אשר",
  "כמו",
  "יותר",
  "פחות",
]

function generateMainIdeaOptions(sentence, fullText) {
  const mainIdea = sentence.substring(0, 60)
  return shuffleArray([
    { text: mainIdea + (mainIdea.length < sentence.length ? "..." : ""), correct: true },
    { text: "הטקסט אינו מתייחס לנושא זה כלל", correct: false },
    { text: "הטקסט מציג עמדה הפוכה לחלוטין", correct: false },
    { text: "המידע בטקסט אינו מספיק כדי להסיק מסקנה", correct: false },
  ])
}

function generateTrueClaimOptions(sentence, fullText) {
  return shuffleArray([
    { text: sentence.substring(0, 70) + "...", correct: true },
    { text: "הכותב מתנגד לרעיון זה", correct: false },
    { text: "הטקסט מציג דעה שונה", correct: false },
    { text: "אין בטקסט התייחסות לנושא", correct: false },
  ])
}

function generateMeaningOptions(sentence) {
  return shuffleArray([
    { text: "הטקסט מסביר ומפרט את הנושא", correct: true },
    { text: "הטקסט שולל את הטענה המרכזית", correct: false },
    { text: "הטקסט מציג סתירה פנימית", correct: false },
    { text: "הטקסט אינו קשור לנושא", correct: false },
  ])
}

function generateInferenceOptions(sentence, fullText) {
  return shuffleArray([
    { text: "ניתן להסיק שהכותב תומך ברעיון המוצג", correct: true },
    { text: "הכותב מתנגד לכל הנאמר", correct: false },
    { text: "אין מספיק מידע להסקת מסקנות", correct: false },
    { text: "הטקסט מכיל סתירות רבות", correct: false },
  ])
}

function generateWordOptions(importantWords) {
  const word = importantWords[Math.floor(Math.random() * importantWords.length)] || "נושא"
  return shuffleArray([
    { text: word, correct: true },
    { text: "מידע", correct: false },
    { text: "תהליך", correct: false },
    { text: "מושג", correct: false },
  ])
}

function reverseStatement(statement) {
  const reversals = ["לא ", "אין ", "איננו "]
  return reversals[Math.floor(Math.random() * reversals.length)] + statement.toLowerCase()
}

function exaggerateStatement(statement) {
  const exaggerations = ["תמיד ", "אף פעם לא ", "בכל המקרים ", "ללא יוצא מן הכלל "]
  return exaggerations[Math.floor(Math.random() * exaggerations.length)] + statement.toLowerCase()
}

function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Global functions for quiz checking
window.checkQuizAnswer = (questionIndex) => {
  const inputs = document.querySelectorAll(`input[name="q${questionIndex}"]`)
  const feedback = document.getElementById(`feedback-${questionIndex}`)

  let answered = false
  let correct = false

  inputs.forEach((input) => {
    if (input.checked) {
      answered = true
      if (input.dataset.correct === "true") {
        correct = true
      }
    }
  })

  if (!answered) {
    feedback.innerHTML = '<span style="color: var(--warning);">אנא בחר תשובה</span>'
    return
  }

  if (correct) {
    feedback.innerHTML = '<span style="color: var(--success);">✓ תשובה נכונה! כל הכבוד!</span>'
    addPoints(5)
  } else {
    feedback.innerHTML = '<span style="color: var(--danger);">✗ תשובה שגויה. נסה שוב!</span>'
  }
}

window.checkAllAnswers = () => {
  const questions = document.querySelectorAll(".quiz-question")
  let correct = 0
  let total = 0

  questions.forEach((q, i) => {
    const inputs = q.querySelectorAll('input[type="radio"]')
    if (inputs.length > 0) {
      total++
      inputs.forEach((input) => {
        if (input.checked && input.dataset.correct === "true") {
          correct++
        }
      })
    }
  })

  const score = document.getElementById("quiz-score")
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0
  score.innerHTML = `
    <strong>התוצאה שלך: ${correct}/${total} (${percentage}%)</strong><br>
    ${percentage >= 80 ? "🌟 מצוין!" : percentage >= 60 ? "👍 טוב מאוד!" : "💪 המשך להתאמן!"}
  `
}

// ========================================
// Voice Recorder - Fixed with shareable links
// ========================================
function initVoiceRecorder() {
  const startBtn = document.getElementById("startRecording")
  const stopBtn = document.getElementById("stopRecording")
  const timerDisplay = document.getElementById("recorderTimer")
  const visualizer = document.getElementById("recorderVisualizer")
  const recordingsContainer = document.getElementById("recordingsContainer")

  let mediaRecorder
  let audioChunks = []
  let timerInterval
  let startTime

  const storageKey = currentUser ? `recordings_${currentUser.id}` : "recordings"
  let recordings = JSON.parse(localStorage.getItem(storageKey) || "[]")

  displayRecordings()

  startBtn?.addEventListener("click", async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder = new MediaRecorder(stream)
      audioChunks = []

      mediaRecorder.ondataavailable = (e) => {
        audioChunks.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" })

        const recording = {
          id: Date.now(),
          date: new Date().toLocaleString("he-IL"),
          duration: timerDisplay.textContent,
        }

        // Convert to base64 for storage and shareable link
        const reader = new FileReader()
        reader.readAsDataURL(audioBlob)
        reader.onloadend = () => {
          recording.data = reader.result
          recordings.push(recording)
          localStorage.setItem(storageKey, JSON.stringify(recordings))
          displayRecordings()
          addPoints(5)
        }

        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      startTime = Date.now()

      timerInterval = setInterval(() => {
        const elapsed = Date.now() - startTime
        const minutes = Math.floor(elapsed / 60000)
        const seconds = Math.floor((elapsed % 60000) / 1000)
        timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      }, 1000)

      startBtn.disabled = true
      stopBtn.disabled = false
      visualizer.classList.add("recording")
    } catch (err) {
      alert("לא ניתן לגשת למיקרופון. אנא אשר גישה.")
    }
  })

  stopBtn?.addEventListener("click", () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop()
      clearInterval(timerInterval)
      startBtn.disabled = false
      stopBtn.disabled = true
      visualizer.classList.remove("recording")
    }
  })

  function displayRecordings() {
    if (!recordingsContainer) return
    recordingsContainer.innerHTML = ""

    if (recordings.length === 0) {
      recordingsContainer.innerHTML = '<p style="color: var(--text-muted);">אין הקלטות שמורות</p>'
      return
    }

    recordings.forEach((rec, index) => {
      const item = document.createElement("div")
      item.className = "recording-item"
      item.innerHTML = `
        <div class="recording-header">
          <span class="recording-title">🎤 הקלטה ${index + 1}</span>
          <span class="recording-meta">${rec.date} | ${rec.duration}</span>
        </div>
        <audio controls src="${rec.data}"></audio>
        <div class="recording-actions">
          <button class="btn-action btn-share" onclick="shareRecordingNative('${rec.id}')" title="שתף הקלטה">
            📤 שתף
          </button>
          <button class="btn-action btn-download" onclick="downloadRecording('${rec.id}')" title="הורד לשיתוף">
            💾 הורד לשיתוף
          </button>
          <button class="btn-action btn-delete" onclick="deleteRecording(${rec.id})" title="מחק">
            🗑️ מחק
          </button>
        </div>
        <div class="share-info" id="share-info-${rec.id}" style="display: none;">
          <p class="share-tip">💡 ההקלטה הורדה! כעת תוכל לשתף אותה דרך וואטסאפ, אימייל או כל אפליקציה אחרת</p>
        </div>
      `
      recordingsContainer.appendChild(item)
    })
  }

  window.shareRecordingNative = async (id) => {
    const rec = recordings.find((r) => r.id == id)
    if (!rec || !rec.data) return

    // Convert base64 to blob
    const response = await fetch(rec.data)
    const blob = await response.blob()
    const file = new File([blob], `recording-${rec.id}.webm`, { type: "audio/webm" })

    // Check if Web Share API is supported and can share files
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "הקלטה",
          text: `הקלטה מתאריך ${rec.date}`,
        })
      } catch (err) {
        if (err.name !== "AbortError") {
          // User cancelled - that's ok, otherwise download
          downloadRecording(id)
        }
      }
    } else {
      // Fallback to download if Web Share not supported
      downloadRecording(id)
      const info = document.getElementById(`share-info-${id}`)
      if (info) info.style.display = "block"
    }
  }

  window.downloadRecording = (id) => {
    const rec = recordings.find((r) => r.id == id)
    if (rec && rec.data) {
      const a = document.createElement("a")
      a.href = rec.data
      a.download = `recording-${rec.date.replace(/[/:]/g, "-")}.webm`
      a.click()

      // Show tip
      const info = document.getElementById(`share-info-${id}`)
      if (info) info.style.display = "block"
    }
  }

  window.deleteRecording = (id) => {
    if (confirm("האם למחוק את ההקלטה?")) {
      recordings = recordings.filter((r) => r.id !== id)
      localStorage.setItem(storageKey, JSON.stringify(recordings))
      displayRecordings()
    }
  }
}

// ========================================
// Speech to Text
// ========================================
function initSpeechToText() {
  const startBtn = document.getElementById("startSpeechRecognition")
  const statusDisplay = document.getElementById("speechStatus")
  const output = document.getElementById("speechOutput")
  const copyBtn = document.getElementById("copySpeechText")

  if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
    if (statusDisplay) statusDisplay.textContent = "זיהוי דיבור אינו נתמך בדפדפן זה"
    if (startBtn) startBtn.disabled = true
    return
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = new SpeechRecognition()

  recognition.lang = "he-IL"
  recognition.continuous = true
  recognition.interimResults = true

  let isListening = false
  let finalTranscript = ""

  startBtn?.addEventListener("click", () => {
    if (isListening) {
      recognition.stop()
    } else {
      recognition.start()
    }
  })

  recognition.onstart = () => {
    isListening = true
    startBtn.textContent = "⏹️ עצור זיהוי"
    startBtn.classList.add("listening")
    statusDisplay.textContent = "מקשיב... דבר/י עכשיו"
    statusDisplay.classList.add("listening")
  }

  recognition.onresult = (event) => {
    let interimTranscript = ""

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        finalTranscript += transcript + " "
      } else {
        interimTranscript += transcript
      }
    }

    output.innerHTML = finalTranscript + '<span style="color: var(--text-muted);">' + interimTranscript + "</span>"
    copyBtn.style.display = finalTranscript ? "inline-block" : "none"
  }

  recognition.onend = () => {
    isListening = false
    startBtn.textContent = "🎤 התחל זיהוי דיבור"
    startBtn.classList.remove("listening")
    statusDisplay.textContent = "לחץ על הכפתור והתחל לדבר"
    statusDisplay.classList.remove("listening")
  }

  recognition.onerror = (event) => {
    statusDisplay.textContent = `שגיאה: ${event.error}`
    isListening = false
    startBtn.textContent = "🎤 התחל זיהוי דיבור"
  }

  copyBtn?.addEventListener("click", () => {
    navigator.clipboard.writeText(finalTranscript)
    copyBtn.textContent = "✓ הועתק!"
    setTimeout(() => {
      copyBtn.textContent = "העתק טקסט"
    }, 2000)
  })
}

// ========================================
// Reading Practice
// ========================================
function initReadingPractice() {
  const getTextBtn = document.getElementById("getReadingText")
  const textDisplay = document.getElementById("readingText")
  const controls = document.getElementById("readingControls")
  const startReadingBtn = document.getElementById("startReading")
  const stopReadingBtn = document.getElementById("stopReading")
  const timerDisplay = document.getElementById("readingTimer")
  const resultsDisplay = document.getElementById("readingResults")

  const texts = {
    easy: [
      "היום יום יפה. השמש זורחת בשמיים. הציפורים שרות על העצים. הילדים משחקים בגן. הכלב רץ על הדשא הירוק.",
      "אמא הכינה עוגה טעימה. היא שמה סוכר וביצים בקערה. אחר כך היא ערבבה הכל יחד. העוגה יצאה מתוקה ויפה.",
    ],
    medium: [
      "בית הספר שלנו נמצא ברחוב הראשי של העיר. יש בו הרבה כיתות ומעבדות. המורים מלמדים מקצועות רבים כמו מתמטיקה, מדעים ושפות. אנחנו אוהבים ללמוד דברים חדשים כל יום.",
      "החיים במדבר קשים מאוד. ביום חם מאוד ובלילה קר. יש מעט מים ומעט צמחים. אבל יש חיות שהתרגלו לחיות שם, כמו גמלים ונחשים.",
    ],
    hard: [
      "המהפכה התעשייתית שינתה את פני העולם. המצאות חדשות כמו מכונת הקיטור אפשרו ייצור המוני של מוצרים. אנשים עברו מכפרים לערים וחיי היומיום השתנו לחלוטין. השפעות המהפכה מורגשות עד היום.",
      "הפוטוסינתזה היא תהליך שבו צמחים מייצרים את המזון שלהם. הם משתמשים באור השמש, מים ופחמן דו-חמצני כדי ליצור סוכרים. כתוצאה מהתהליך משתחרר חמצן לאוויר, שאנחנו נושמים.",
    ],
  }

  let currentText = ""
  let timerInterval

  getTextBtn?.addEventListener("click", () => {
    const level = document.getElementById("readingLevel").value
    const levelTexts = texts[level]
    currentText = levelTexts[Math.floor(Math.random() * levelTexts.length)]

    textDisplay.textContent = currentText
    controls.style.display = "flex"
    resultsDisplay.innerHTML = ""
  })

  startReadingBtn?.addEventListener("click", () => {
    const startTime = Date.now()

    timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const minutes = Math.floor(elapsed / 60)
      const seconds = elapsed % 60
      timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }, 1000)

    startReadingBtn.style.display = "none"
    stopReadingBtn.style.display = "inline-block"
  })

  stopReadingBtn?.addEventListener("click", () => {
    clearInterval(timerInterval)

    const timeText = timerDisplay.textContent
    const [minutes, seconds] = timeText.split(":").map(Number)
    const totalSeconds = minutes * 60 + seconds
    const wordCount = currentText.split(/\s+/).length
    const wpm = Math.round((wordCount / totalSeconds) * 60)

    resultsDisplay.innerHTML = `
      <h4>תוצאות הקריאה</h4>
      <p>זמן קריאה: ${timeText}</p>
      <p>מספר מילים: ${wordCount}</p>
      <p>מהירות: ${wpm} מילים לדקה</p>
      <p>${wpm > 150 ? "מצוין! קריאה מהירה!" : wpm > 100 ? "טוב מאוד!" : "המשך להתאמן!"}</p>
    `

    startReadingBtn.style.display = "inline-block"
    stopReadingBtn.style.display = "none"

    addPoints(5)
  })
}

// ========================================
// Calculator
// ========================================
function initCalculator() {
  const display = document.getElementById("calcDisplay")
  const buttons = document.querySelectorAll(".calc-btn")

  let currentValue = "0"
  let operator = null
  let previousValue = null
  let waitingForOperand = false

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.action

      if (!isNaN(action) || action === "decimal") {
        handleNumber(action)
      } else if (["add", "subtract", "multiply", "divide"].includes(action)) {
        handleOperator(action)
      } else if (action === "equals") {
        handleEquals()
      } else if (action === "clear") {
        handleClear()
      } else if (action === "backspace") {
        handleBackspace()
      } else if (action === "percent") {
        handlePercent()
      } else if (["sin", "cos", "tan", "sqrt", "power"].includes(action)) {
        handleFunction(action)
      }

      display.value = currentValue
    })
  })

  function handleNumber(num) {
    if (waitingForOperand) {
      currentValue = num === "decimal" ? "0." : num
      waitingForOperand = false
    } else {
      if (num === "decimal") {
        if (!currentValue.includes(".")) {
          currentValue += "."
        }
      } else {
        currentValue = currentValue === "0" ? num : currentValue + num
      }
    }
  }

  function handleOperator(op) {
    const opSymbols = { add: "+", subtract: "-", multiply: "*", divide: "/" }
    if (operator && !waitingForOperand) {
      handleEquals()
    }
    previousValue = Number.parseFloat(currentValue)
    operator = opSymbols[op]
    waitingForOperand = true
  }

  function handleEquals() {
    if (operator && previousValue !== null) {
      const current = Number.parseFloat(currentValue)
      let result
      switch (operator) {
        case "+":
          result = previousValue + current
          break
        case "-":
          result = previousValue - current
          break
        case "*":
          result = previousValue * current
          break
        case "/":
          result = current !== 0 ? previousValue / current : "Error"
          break
      }
      currentValue = String(result)
      operator = null
      previousValue = null
      waitingForOperand = true
    }
  }

  function handleClear() {
    currentValue = "0"
    operator = null
    previousValue = null
    waitingForOperand = false
  }

  function handleBackspace() {
    currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : "0"
  }

  function handlePercent() {
    currentValue = String(Number.parseFloat(currentValue) / 100)
  }

  function handleFunction(func) {
    const val = Number.parseFloat(currentValue)
    let result
    switch (func) {
      case "sin":
        result = Math.sin((val * Math.PI) / 180)
        break
      case "cos":
        result = Math.cos((val * Math.PI) / 180)
        break
      case "tan":
        result = Math.tan((val * Math.PI) / 180)
        break
      case "sqrt":
        result = Math.sqrt(val)
        break
      case "power":
        result = val * val
        break
    }
    currentValue = String(Number.parseFloat(result.toFixed(10)))
    waitingForOperand = true
  }
}

// ========================================
// Notes
// ========================================
function initNotes() {
  const newNoteBtn = document.getElementById("newNote")
  const saveNoteBtn = document.getElementById("saveNote")
  const deleteNoteBtn = document.getElementById("deleteNote")
  const notesList = document.getElementById("notesList")
  const titleInput = document.getElementById("noteTitle")
  const contentInput = document.getElementById("noteContent")

  const storageKey = currentUser ? `notes_${currentUser.id}` : "notes"
  const notes = JSON.parse(localStorage.getItem(storageKey) || "[]")

  displayNotes()

  newNoteBtn?.addEventListener("click", () => {
    currentNote = null
    titleInput.value = ""
    contentInput.value = ""
    document.querySelectorAll(".note-item").forEach((item) => item.classList.remove("active"))
  })

  saveNoteBtn?.addEventListener("click", () => {
    const title = titleInput.value.trim() || "הערה ללא כותרת"
    const content = contentInput.value.trim()

    if (!content) {
      alert("אנא כתוב תוכן להערה")
      return
    }

    if (currentNote !== null) {
      notes[currentNote] = { title, content, date: new Date().toLocaleString("he-IL") }
    } else {
      notes.push({ title, content, date: new Date().toLocaleString("he-IL") })
      currentNote = notes.length - 1
    }

    localStorage.setItem(storageKey, JSON.stringify(notes))
    displayNotes()
    addPoints(2)
  })

  deleteNoteBtn?.addEventListener("click", () => {
    if (currentNote !== null && confirm("האם למחוק את ההערה?")) {
      notes.splice(currentNote, 1)
      localStorage.setItem(storageKey, JSON.stringify(notes))
      currentNote = null
      titleInput.value = ""
      contentInput.value = ""
      displayNotes()
    }
  })

  function displayNotes() {
    notesList.innerHTML = ""

    if (notes.length === 0) {
      notesList.innerHTML = '<p style="color: var(--text-muted); padding: 1rem;">אין הערות שמורות</p>'
      return
    }

    notes.forEach((note, index) => {
      const item = document.createElement("div")
      item.className = `note-item ${index === currentNote ? "active" : ""}`
      item.innerHTML = `
        <h4>${note.title}</h4>
        <span>${note.date}</span>
      `
      item.addEventListener("click", () => {
        currentNote = index
        titleInput.value = note.title
        contentInput.value = note.content
        document.querySelectorAll(".note-item").forEach((i) => i.classList.remove("active"))
        item.classList.add("active")
      })
      notesList.appendChild(item)
    })
  }
}

// ========================================
// Todo List
// ========================================
function initTodoList() {
  const input = document.getElementById("todoInput")
  const prioritySelect = document.getElementById("todoPriority")
  const dueDateInput = document.getElementById("todoDueDate")
  const addBtn = document.getElementById("addTodo")
  const todoList = document.getElementById("todoList")
  const filterBtns = document.querySelectorAll(".filter-btn")

  const storageKey = currentUser ? `todos_${currentUser.id}` : "todos"
  let todos = JSON.parse(localStorage.getItem(storageKey) || "[]")
  let currentFilter = "all"

  displayTodos()

  addBtn?.addEventListener("click", () => {
    const text = input.value.trim()
    if (!text) return

    todos.push({
      id: Date.now(),
      text,
      priority: prioritySelect.value,
      dueDate: dueDateInput.value,
      completed: false,
    })

    localStorage.setItem(storageKey, JSON.stringify(todos))
    input.value = ""
    dueDateInput.value = ""
    displayTodos()
    addPoints(2)
  })

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")
      currentFilter = btn.dataset.filter
      displayTodos()
    })
  })

  function displayTodos() {
    todoList.innerHTML = ""

    let filteredTodos = todos
    if (currentFilter === "active") {
      filteredTodos = todos.filter((t) => !t.completed)
    } else if (currentFilter === "completed") {
      filteredTodos = todos.filter((t) => t.completed)
    }

    if (filteredTodos.length === 0) {
      todoList.innerHTML = '<li style="text-align: center; padding: 2rem; color: var(--text-muted);">אין משימות</li>'
      return
    }

    filteredTodos.forEach((todo) => {
      const li = document.createElement("li")
      li.className = `todo-item ${todo.completed ? "completed" : ""}`

      const priorityLabels = { high: "גבוה", medium: "בינוני", low: "נמוך" }

      li.innerHTML = `
        <input type="checkbox" ${todo.completed ? "checked" : ""} onchange="toggleTodo(${todo.id})">
        <span class="todo-text">${todo.text}</span>
        <span class="todo-priority ${todo.priority}">${priorityLabels[todo.priority]}</span>
        ${todo.dueDate ? `<span class="todo-due">${todo.dueDate}</span>` : ""}
        <button class="todo-delete" onclick="deleteTodo(${todo.id})">×</button>
      `
      todoList.appendChild(li)
    })
  }

  window.toggleTodo = (id) => {
    const todo = todos.find((t) => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
      localStorage.setItem(storageKey, JSON.stringify(todos))
      displayTodos()
      if (todo.completed) addPoints(5)
    }
  }

  window.deleteTodo = (id) => {
    todos = todos.filter((t) => t.id !== id)
    localStorage.setItem(storageKey, JSON.stringify(todos))
    displayTodos()
  }
}

// ========================================
// Pomodoro Timer
// ========================================
function initPomodoro() {
  const timerDisplay = document.getElementById("pomodoroTimer")
  const labelDisplay = document.getElementById("pomodoroLabel")
  const startBtn = document.getElementById("startPomodoro")
  const pauseBtn = document.getElementById("pausePomodoro")
  const resetBtn = document.getElementById("resetPomodoro")
  const roundsDisplay = document.getElementById("pomodoroRounds")
  const workTimeInput = document.getElementById("workTime")
  const breakTimeInput = document.getElementById("breakTime")

  let isRunning = false
  let isBreak = false
  let timeLeft = 25 * 60
  let interval
  let rounds = Number.parseInt(localStorage.getItem("pomodoroRounds") || "0")

  roundsDisplay.textContent = rounds

  startBtn?.addEventListener("click", () => {
    if (!isRunning) {
      isRunning = true
      startBtn.style.display = "none"
      pauseBtn.style.display = "inline-block"

      interval = setInterval(() => {
        timeLeft--

        if (timeLeft <= 0) {
          clearInterval(interval)
          isRunning = false

          if (!isBreak) {
            rounds++
            localStorage.setItem("pomodoroRounds", rounds)
            roundsDisplay.textContent = rounds
            addPoints(10)

            isBreak = true
            timeLeft = Number.parseInt(breakTimeInput.value) * 60
            labelDisplay.textContent = "זמן הפסקה"

            if (currentUser?.settings?.notifyPomodoro !== false) {
              alert("סיימת סבב עבודה! קח הפסקה 🎉")
            }
          } else {
            isBreak = false
            timeLeft = Number.parseInt(workTimeInput.value) * 60
            labelDisplay.textContent = "זמן עבודה"

            if (currentUser?.settings?.notifyPomodoro !== false) {
              alert("ההפסקה נגמרה! חזור לעבודה 💪")
            }
          }

          startBtn.style.display = "inline-block"
          pauseBtn.style.display = "none"
        }

        updateTimerDisplay()
      }, 1000)
    }
  })

  pauseBtn?.addEventListener("click", () => {
    clearInterval(interval)
    isRunning = false
    startBtn.style.display = "inline-block"
    pauseBtn.style.display = "none"
  })

  resetBtn?.addEventListener("click", () => {
    clearInterval(interval)
    isRunning = false
    isBreak = false
    timeLeft = Number.parseInt(workTimeInput.value) * 60
    labelDisplay.textContent = "זמן עבודה"
    startBtn.style.display = "inline-block"
    pauseBtn.style.display = "none"
    updateTimerDisplay()
  })

  function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }
}

// ========================================
// Chat Tutor - Fixed with enhanced local AI knowledge
// ========================================
function initChatTutor() {
  const chatMessages = document.getElementById("chatMessages")
  const chatInput = document.getElementById("chatInput")
  const sendBtn = document.getElementById("sendMessage")
  const suggestions = document.querySelectorAll(".suggestion-btn")

  if (!chatMessages || !chatInput) return

  // MUCH Enhanced AI Knowledge Base
  const knowledgeBase = {
    // Greetings
    greetings: {
      patterns: ["שלום", "היי", "הי", "מה נשמע", "מה קורה", "בוקר טוב", "ערב טוב", "hello", "hi", "hey"],
      responses: [
        `שלום! 👋 שמח לראות אותך. אני כאן לעזור לך בכל נושא לימודי. 

במה תרצה שנתחיל?
• מתמטיקה 📐
• מדעים 🔬
• אנגלית 🇬🇧
• היסטוריה 📚
• עברית ✍️
• טיפים ללמידה 💡`,
        "היי! אני המורה הוירטואלי שלך. שאל אותי כל שאלה בנושאי לימוד!",
        "שלום וברוכים הבאים! מה תרצה ללמוד היום?",
      ],
    },

    // Study Tips - Expanded
    studyTips: {
      patterns: [
        "איך לומדים",
        "טיפים ללמידה",
        "איך להתכונן למבחן",
        "איך לזכור",
        "שיטות למידה",
        "קשה לי ללמוד",
        "לא מצליח לזכור",
        "איך להתרכז",
      ],
      responses: [
        `🎯 **10 טיפים מוכחים ללמידה יעילה:**

**1. שיטת הפומודורו**
למד 25 דקות → הפסקה 5 דקות → חזור על כך 4 פעמים → הפסקה ארוכה

**2. למידה פעילה**
• כתוב סיכומים במילים שלך
• הסבר לעצמך בקול רם
• צור כרטיסיות זיכרון

**3. חזרות מרווחות**
• חזור על החומר אחרי יום, שבוע, חודש
• המוח זוכר טוב יותר כשיש הפסקות

**4. סביבת למידה**
• מקום שקט וממוזג
• תאורה טובה
• הרחק את הטלפון

**5. תזונה ושינה**
• שתה מים (המוח צריך נוזלים!)
• אכול אגוזים, דגים, ירקות
• 8 שעות שינה = זיכרון חזק

**6. מפות חשיבה**
• צייר דיאגרמות
• קשר בין מושגים
• השתמש בצבעים

**7. לימוד בקבוצות**
• הסבר לאחרים מחזק את ההבנה שלך
• דיונים פותחים את המחשבה

**8. התחל מהקשה**
• למד נושאים קשים כשאתה ער
• השאר את הקל לסוף

**9. פרסים**
• תגמל את עצמך על הישגים
• זה מגביר מוטיבציה

**10. שאל שאלות**
• אין שאלות טיפשיות
• אם לא הבנת - שאל שוב!`,
      ],
    },

    // Mathematics - Greatly Expanded
    math: {
      patterns: ["מתמטיקה", "חשבון", "גיאומטריה", "אלגברה", "שטח", "היקף", "אחוזים", "שברים", "משוואות"],
      responses: [
        `📐 **מתמטיקה - נושאים עיקריים:**

**חשבון בסיסי:**
• חיבור, חיסור, כפל, חילוק
• סדר פעולות: PEMDAS (סוגריים, חזקות, כפל/חילוק, חיבור/חיסור)

**שברים:**
• שבר = מונה ÷ מכנה
• חיבור שברים: מכנה משותף → חבר מונים
• כפל שברים: מונה × מונה, מכנה × מכנה

**אחוזים:**
• X% מ-Y = (X × Y) ÷ 100
• 50% = חצי, 25% = רבע, 10% = עשירית
• למצוא אחוז: (חלק ÷ שלם) × 100

**שטחים:**
• ריבוע: צלע²
• מלבן: אורך × רוחב
• משולש: (בסיס × גובה) ÷ 2
• עיגול: π × רדיוס²
• טרפז: (בסיס1 + בסיס2) × גובה ÷ 2

**היקפים:**
• ריבוע: 4 × צלע
• מלבן: 2 × (אורך + רוחב)
• עיגול: 2 × π × רדיוס

על איזה נושא תרצה להרחיב?`,
      ],
    },

    // Pythagorean Theorem
    pythagoras: {
      patterns: ["פיתגורס", "משפט פיתגורס", "משולש ישר זווית"],
      responses: [
        `📐 **משפט פיתגורס**

**הנוסחה:**
$$a² + b² = c²$$

**מה זה אומר?**
במשולש ישר זווית:
• a, b = הניצבים (הצלעות היוצרות את הזווית הישרה)
• c = היתר (הצלע הארוכה ביותר, מול זווית 90°)

**דוגמאות מפורסמות:**
• 3, 4, 5 → 9 + 16 = 25 ✓
• 5, 12, 13 → 25 + 144 = 169 ✓
• 8, 15, 17 → 64 + 225 = 289 ✓

**איך משתמשים?**
1. למצוא צלע חסרה במשולש ישר זווית
2. לבדוק אם משולש הוא ישר זווית
3. לחשב מרחקים (למשל: אלכסון מסך)

**דוגמה:**
אם a=6 ו-b=8, מה c?
c² = 36 + 64 = 100
c = √100 = 10

**טיפ לזיכרון:** "שלוש ארבע חמש, פיתגורס לא מתבייש!"`,
      ],
    },

    // Equations
    equations: {
      patterns: ["משוואה", "משוואות", "פתור משוואה", "X", "נעלם", "איקס"],
      responses: [
        `🔢 **פתרון משוואות - שלב אחר שלב**

**עקרון הזהב:** מה שעושים לצד אחד - עושים גם לשני!

**משוואה פשוטה:**
x + 5 = 12
x = 12 - 5
x = 7 ✓

**משוואה עם כפל:**
3x = 15
x = 15 ÷ 3
x = 5 ✓

**משוואה מורכבת:**
2x + 3 = 11
2x = 11 - 3
2x = 8
x = 4 ✓

**משוואה עם סוגריים:**
2(x + 4) = 14
2x + 8 = 14
2x = 6
x = 3 ✓

**משוואה עם X בשני הצדדים:**
5x - 2 = 3x + 6
5x - 3x = 6 + 2
2x = 8
x = 4 ✓

**בדיקה:** תמיד הציבו את התשובה בחזרה!

רוצה תרגיל לתרגול?`,
      ],
    },

    // Fractions
    fractions: {
      patterns: ["שבר", "שברים", "מכנה", "מונה", "חיבור שברים", "כפל שברים"],
      responses: [
        `🔢 **שברים - המדריך המלא**

**מבנה השבר:**
מונה (למעלה) / מכנה (למטה)
½ = אחד חלקי שניים = חצי

**חיבור וחיסור שברים:**
צריך מכנה משותף!
½ + ¼ = ²⁄₄ + ¼ = ³⁄₄

**כפל שברים:**
מונה × מונה, מכנה × מכנה
½ × ¾ = ³⁄₈

**חילוק שברים:**
הופכים את השני וכופלים!
½ ÷ ¼ = ½ × ⁴⁄₁ = ⁴⁄₂ = 2

**צמצום שברים:**
מחלקים מונה ומכנה באותו מספר
⁶⁄₈ = ³⁄₄ (חילקנו ב-2)

**המרה למספר עשרוני:**
מחלקים מונה במכנה
¾ = 3 ÷ 4 = 0.75

**שברים חשובים לזכור:**
½ = 0.5 = 50%
¼ = 0.25 = 25%
¾ = 0.75 = 75%
⅓ ≈ 0.333 ≈ 33%`,
      ],
    },

    // Science - Expanded
    science: {
      patterns: ["מדעים", "פיזיקה", "כימיה", "ביולוגיה", "תא", "אטום", "אנרגיה", "מולקולה"],
      responses: [
        `🔬 **מדעים - נושאים מרכזיים:**

**ביולוגיה - מדע החיים:**
• מבנה התא ותפקודיו
• מערכות הגוף
• גנטיקה ותורשה
• אקולוגיה וסביבה

**כימיה - מדע החומר:**
• מבנה האטום
• יסודות ומולקולות
• תגובות כימיות
• טבלה מחזורית

**פיזיקה - מדע הטבע:**
• כוחות ותנועה
• אנרגיה וסוגיה
• חשמל ומגנטיות
• גלים ואור

**מושגים חשובים:**
• אנרגיה לא נוצרת ולא נעלמת - רק עוברת ממצב למצב
• כל החומר מורכב מאטומים
• תאים הם יחידות החיים הבסיסיות

על איזה תחום תרצה להרחיב?`,
      ],
    },

    // Cell Structure
    cell: {
      patterns: ["תא", "תאים", "מבנה התא", "גרעין", "מיטוכונדריה", "ממברנה"],
      responses: [
        `🧫 **מבנה התא - יחידת החיים הבסיסית**

**חלקי התא ותפקידיהם:**

**גרעין (Nucleus)**
• "המוח" של התא
• מכיל את ה-DNA
• שולט בכל פעילויות התא

**ממברנה (Cell Membrane)**
• המעטפת החיצונית
• שולטת במה שנכנס ויוצא
• מגינה על התא

**ציטופלזמה (Cytoplasm)**
• הנוזל שממלא את התא
• בו צפים כל האברונים

**מיטוכונדריה (Mitochondria)**
• "תחנת הכוח" של התא
• מייצרת אנרגיה (ATP)

**ריבוזומים (Ribosomes)**
• מייצרים חלבונים
• נמצאים על הרשתית

**רשתית אנדופלזמטית (ER)**
• מערכת תעלות בתא
• מעבירה חומרים

**רק בתאי צמחים:**
• דופן תא - קשיחה
• כלורופלסט - פוטוסינתזה
• חלולית גדולה - אגירת מים

**הבדל מרכזי:**
• תא חיה = ממברנה גמישה
• תא צמח = דופן קשיחה + ממברנה`,
      ],
    },

    // Photosynthesis
    photosynthesis: {
      patterns: ["פוטוסינתזה", "סינתזה", "צמחים מייצרים", "כלורופיל"],
      responses: [
        `🌿 **פוטוסינתזה - איך צמחים מייצרים מזון**

**המשוואה המפורסמת:**
6CO₂ + 6H₂O + אור שמש → C₆H₁₂O₆ + 6O₂

**בעברית פשוטה:**
פחמן דו-חמצני + מים + אור = סוכר (גלוקוז) + חמצן

**איפה זה קורה?**
בכלורופלסטים - אברונים ירוקים בעלים
מכילים כלורופיל - הפיגמנט הירוק

**שלבי התהליך:**
1. **שלב האור** - קולט אנרגיה מהשמש
2. **מחזור קלווין** - בונה סוכרים מ-CO₂

**למה זה חשוב?**
• מייצר חמצן לנשימה
• מייצר מזון לכל שרשרת המזון
• קולט CO₂ ומפחית התחממות גלובלית

**עובדות מעניינות:**
• עץ גדול מייצר חמצן ל-4 אנשים ביום
• 70% מהחמצן בעולם מאצות בים
• צמחים גם נושמים (בלילה)!

**ההפך מפוטוסינתזה = נשימה תאית:**
סוכר + חמצן → אנרגיה + CO₂ + מים`,
      ],
    },

    // Atom
    atom: {
      patterns: ["אטום", "אטומים", "פרוטון", "נויטרון", "אלקטרון", "מבנה האטום"],
      responses: [
        `⚛️ **מבנה האטום**

**האטום מורכב מ-3 חלקיקים:**

**פרוטונים (+)**
• מטען חיובי
• נמצאים בגרעין
• מספרם קובע את סוג היסוד!

**נויטרונים (0)**
• ללא מטען (ניטרליים)
• נמצאים בגרעין
• מייצבים את הגרעין

**אלקטרונים (-)**
• מטען שלילי
• סובבים סביב הגרעין בקליפות
• קלים מאוד!

**עקרונות חשובים:**
• אטום ניטרלי: מספר פרוטונים = מספר אלקטרונים
• המספר האטומי = מספר הפרוטונים
• המסה האטומית ≈ פרוטונים + נויטרונים

**הקליפות (מסלולי אלקטרונים):**
• קליפה ראשונה: עד 2 אלקטרונים
• קליפה שנייה: עד 8 אלקטרונים
• קליפה שלישית: עד 18 אלקטרונים

**דוגמה - פחמן (C):**
• 6 פרוטונים
• 6 נויטרונים
• 6 אלקטרונים (2 בקליפה ראשונה, 4 בשנייה)`,
      ],
    },

    // History - Expanded
    history: {
      patterns: ["היסטוריה", "תקופה", "עתיקה", "ימי הביניים", "עת חדשה"],
      responses: [
        `📜 **היסטוריה - התקופות העיקריות**

**פרהיסטוריה (עד 3500 לפנה"ס)**
• תקופת האבן
• המצאת הכתב

**העת העתיקה (3500 לפנה"ס - 476)**
• מצרים העתיקה
• יוון העתיקה
• האימפריה הרומית
• תקופת המקרא

**ימי הביניים (476 - 1492)**
• התפשטות הנצרות והאסלאם
• מסעות הצלב
• הפאודליזם

**הרנסנס (1400 - 1600)**
• פריחה תרבותית באירופה
• הומניזם
• ליאונרדו דה וינצ'י

**העת החדשה (1492 - 1789)**
• גילוי אמריקה
• המהפכה המדעית
• עידן ההשכלה

**העת החדישה (1789 - היום)**
• המהפכה הצרפתית
• המהפכה התעשייתית
• מלחמות העולם
• הקמת מדינת ישראל

על איזו תקופה תרצה לשמוע יותר?`,
      ],
    },

    // World War 2
    ww2: {
      patterns: ["מלחמת העולם השנייה", "מלחמת העולם השניה", "מלחמה עולמית שניה", "ww2"],
      responses: [
        `⚔️ **מלחמת העולם השנייה (1939-1945)**

**התחלה:** 1 בספטמבר 1939 - גרמניה פולשת לפולין

**הצדדים:**
🔵 **בעלות הברית:**
• בריטניה, צרפת, ארה"ב, ברית המועצות

🔴 **מדינות הציר:**
• גרמניה, איטליה, יפן

**אירועים מרכזיים:**
• 1939 - פלישה לפולין
• 1940 - כיבוש צרפת, הקרב על בריטניה
• 1941 - גרמניה תוקפת ברה"מ, פרל הארבור
• 1942 - קרב סטלינגרד
• 1944 - D-Day (פלישה לנורמנדי)
• 1945 - כניעת גרמניה, הפצצות אטום על יפן

**השואה:**
• רצח 6 מיליון יהודים
• מחנות ריכוז והשמדה
• גטאות ברחבי אירופה

**תוצאות המלחמה:**
• ~70 מיליון הרוגים
• הקמת האו"ם
• חלוקת אירופה (מלחמה קרה)
• הקמת מדינת ישראל (1948)`,
      ],
    },

    // Holocaust
    holocaust: {
      patterns: ["שואה", "יום השואה", "מחנות השמדה", "גטו", "הנאצים"],
      responses: [
        `🕯️ **השואה (1933-1945)**

**מה קרה?**
רצח שיטתי של 6 מיליון יהודים על ידי גרמניה הנאצית והמשתפים איתה

**התפתחות הרדיפה:**
1. חוקי נירנברג (1935) - שלילת אזרחות
2. ליל הבדולח (1938) - פוגרומים
3. גטאות (1940-1943)
4. "הפתרון הסופי" (1942) - רצח שיטתי

**מחנות השמדה:**
• אושוויץ-בירקנאו
• טרבלינקה
• סוביבור
• מיידנק

**גבורה יהודית:**
• מרד גטו ורשה
• הפרטיזנים
• חסידי אומות עולם

**לזכור ולא לשכוח:**
• יום השואה - כ"ז בניסן
• "זכור את אשר עשה לך עמלק"
• עדויות ניצולים

**מורשת השואה:**
• מדינת ישראל - בית לעם היהודי
• חוקים נגד גזענות
• חינוך לסובלנות`,
      ],
    },

    // Israel History
    israelHistory: {
      patterns: ["מדינת ישראל", "הקמת המדינה", "מלחמת העצמאות", "בן גוריון", "הציונות"],
      responses: [
        `🇮🇱 **היסטוריה של מדינת ישראל**

**הציונות:**
• תיאודור הרצל - "אם תרצו אין זו אגדה"
• הקונגרס הציוני הראשון (1897)
• גלי עלייה לארץ ישראל

**דרך להקמת המדינה:**
• הצהרת בלפור (1917)
• המנדט הבריטי (1920-1948)
• תוכנית החלוקה (1947)

**הקמת המדינה - 14 במאי 1948:**
• דוד בן-גוריון מכריז על עצמאות
• "מדינה יהודית בארץ ישראל"

**מלחמת העצמאות (1948-1949):**
• 7 צבאות ערביים תקפו
• ניצחון ישראלי
• הסכמי שביתת נשק

**מלחמות נוספות:**
• מבצע סיני (1956)
• מלחמת ששת הימים (1967)
• מלחמת יום הכיפורים (1973)
• מלחמת לבנון (1982)

**הישגים:**
• קליטת מיליוני עולים
• בניית משק מתקדם
• הייטק ומדע
• הסכמי שלום עם מצרים וירדן`,
      ],
    },

    // English Grammar
    english: {
      patterns: ["אנגלית", "english", "זמנים באנגלית", "tenses", "פועל", "verb", "דקדוק אנגלי"],
      responses: [
        `🇬🇧 **אנגלית - הזמנים העיקריים**

**Past (עבר):**
• Simple Past: I played ⟵ שיחקתי
• Past Continuous: I was playing ⟵ הייתי משחק
• Past Perfect: I had played ⟵ כבר שיחקתי (לפני משהו אחר)

**Present (הווה):**
• Simple Present: I play ⟵ אני משחק (הרגל)
• Present Continuous: I am playing ⟵ אני משחק (עכשיו)
• Present Perfect: I have played ⟵ שיחקתי (רלוונטי להווה)

**Future (עתיד):**
• Simple Future: I will play ⟵ אני אשחק
• Going to: I am going to play ⟵ אני הולך לשחק
• Present for Future: I play tomorrow ⟵ תוכניות קבועות

**סימנים לזיהוי:**
• ed בסוף = עבר רגיל
• ing בסוף = פעולה מתמשכת
• will/going to = עתיד
• have/has + V3 = Perfect

**פעלים לא רגילים חשובים:**
• be → was/were → been
• go → went → gone
• have → had → had
• do → did → done
• see → saw → seen
• eat → ate → eaten

רוצה דוגמאות נוספות או תרגול?`,
      ],
    },

    // Essay Writing
    essay: {
      patterns: ["חיבור", "כתיבת חיבור", "איך לכתוב חיבור", "מבנה חיבור", "כתיבה"],
      responses: [
        `✍️ **איך לכתוב חיבור מנצח**

**מבנה בסיסי - 5 פסקאות:**

**1. פתיחה (הקדמה)**
• משפט פתיחה מושך
• רקע קצר לנושא
• משפט מפתח (טענה מרכזית)

**2-4. גוף החיבור**
• פסקה = רעיון אחד מרכזי
• משפט נושא → פיתוח → דוגמאות → סיכום
• מילות קישור בין פסקאות

**5. סיום**
• סיכום הרעיונות
• חזרה על המסר המרכזי
• משפט סיום חזק

**מילות קישור שימושיות:**
• להוספה: בנוסף, יתר על כן, כמו כן
• להנגדה: לעומת זאת, מצד שני, אולם
• לדוגמה: למשל, כגון, לדוגמה
• לסיכום: לסיכום, בשורה התחתונה, כללית

**טיפים:**
✓ תכנן לפני שאתה כותב
✓ השתמש במילון נרדפות
✓ בדוק איות ופיסוק
✓ קרא בקול - לשמוע טעויות
✓ בקש ממישהו לקרוא

**פתיחות מומלצות:**
• שאלה רטורית
• ציטוט מפורסם
• עובדה מפתיעה
• סיפור קצר`,
      ],
    },

    // Hebrew Grammar
    hebrew: {
      patterns: ["עברית", "דקדוק", "שורש", "בניין", "משקל", "דקדוק עברי"],
      responses: [
        `✡️ **דקדוק עברי - המדריך המלא**

**השורש:**
3-4 אותיות שהן הבסיס של מילים רבות
• ש.מ.ר → שומר, משמר, שמירה, נשמר
• כ.ת.ב → כותב, מכתב, כתיבה, נכתב

**7 הבניינים:**
1. **פָּעַל** - הבסיסי: כתב, למד
2. **נִפְעַל** - סביל: נכתב, נלמד
3. **פִּעֵל** - חיזוק: דיבר, לימד
4. **פֻּעַל** - סביל של פיעל: דובר, לומד
5. **הִפְעִיל** - גורם: הכתיב, הלמיד
6. **הֻפְעַל** - סביל של הפעיל: הוכתב
7. **הִתְפַּעֵל** - על עצמו: התלבש, התרחץ

**הזמנים:**
• עבר: כתבתי, כתבת, כתב...
• הווה: כותב, כותבת, כותבים
• עתיד: אכתוב, תכתוב, יכתוב...

**הגופים:**
אני, אתה, את, הוא, היא
אנחנו, אתם, אתן, הם, הן

**סמיכות:**
שני שמות עצם שמתחברים
• בית + ספר = בית ספר
• שולחן + כתיבה = שולחן כתיבה`,
      ],
    },

    // Geography
    geography: {
      patterns: ["גיאוגרפיה", "יבשות", "מדינות", "עולם", "מפה", "אקלים"],
      responses: [
        `🌍 **גיאוגרפיה - העולם שלנו**

**7 היבשות:**
1. אסיה - הגדולה ביותר
2. אפריקה - השנייה בגודלה
3. צפון אמריקה
4. דרום אמריקה
5. אנטארקטיקה - הקרה ביותר
6. אירופה
7. אוסטרליה/אוקיאניה

**5 האוקיינוסים:**
1. האוקיינוס השקט - הגדול
2. האוקיינוס האטלנטי
3. האוקיינוס ההודי
4. הים הדרומי
5. הים הארקטי

**אזורי אקלים:**
• טרופי - חם ולח כל השנה
• ממוזג - 4 עונות
• יבשתי - קיץ חם, חורף קר
• קוטבי - קר מאוד
• מדברי - יבש מאוד

**ישראל:**
• שטח: ~22,000 קמ"ר
• אוכלוסייה: ~9.5 מיליון
• בירה: ירושלים
• גבולות: לבנון, סוריה, ירדן, מצרים
• ים תיכון, ים המלח, ים סוף`,
      ],
    },

    // Computer Science
    computers: {
      patterns: ["מחשבים", "תכנות", "קוד", "אלגוריתם", "מדעי המחשב", "תוכנה"],
      responses: [
        `💻 **מדעי המחשב - יסודות**

**מה זה מחשב?**
מכונה שמעבדת מידע לפי הוראות (תוכנה)

**חומרה (Hardware):**
• מעבד (CPU) - ה"מוח"
• זיכרון (RAM) - אחסון זמני
• דיסק קשיח - אחסון קבוע
• מסך, מקלדת, עכבר

**תוכנה (Software):**
• מערכת הפעלה (Windows, macOS)
• תוכנות יישום (Word, Chrome)
• משחקים, אפליקציות

**שפות תכנות:**
• Python - קלה למתחילים
• JavaScript - אתרים
• Scratch - ילדים
• Java - אנדרואיד
• C++ - משחקים

**מושגים בסיסיים:**
• אלגוריתם = רצף צעדים לפתרון
• משתנה = תיבה לאחסון מידע
• לולאה = חזרה על פעולות
• תנאי = if... then... else

**בינארי:**
מחשבים "מבינים" רק 0 ו-1
• 0 = כבוי, 1 = דלוק
• כל מידע מתורגם לבינארי`,
      ],
    },

    // Thanks
    thanks: {
      patterns: ["תודה", "תודה רבה", "מעולה", "אחלה", "נהדר", "thanks", "מגניב", "וואו"],
      responses: [
        "בשמחה רבה! 😊 אני תמיד כאן לעזור. יש עוד משהו שתרצה ללמוד?",
        "אין בעד מה! המשך ללמוד ולהצליח! 🌟",
        "שמח שיכולתי לעזור! בהצלחה בלימודים! 💪",
        "תודה לך! אשמח לעזור עוד. מה הנושא הבא?",
      ],
    },

    // Encouragement
    encouragement: {
      patterns: ["קשה לי", "אני לא מבין", "נמאס לי", "לא מצליח", "אני טיפש", "יואש"],
      responses: [
        `💪 **אל תוותר! כל אחד יכול להצליח!**

**זכור:**
• גם אינשטיין נכשל במבחנים
• מייקל ג'ורדן הורד מנבחרת הכדורסל בתיכון
• תומס אדיסון ניסה 1,000 פעמים לפני שהמציא את הנורה

**טיפים להתגברות על קשיים:**
1. קח הפסקה קצרה (5-10 דקות)
2. נסה להסביר לעצמך בקול רם
3. בקש עזרה - אין בושה בזה!
4. פרק לחלקים קטנים יותר
5. תתרגל - אף אחד לא נולד מומחה

**משפטים לחיזוק:**
• "אני יכול ללמוד הכל"
• "טעויות הן חלק מהלמידה"
• "כל צעד קטן מקרב למטרה"
• "אני משתפר כל יום"

אני מאמין בך! מה הנושא שקשה לך? ננסה יחד 🤝`,
      ],
    },

    // Jokes
    jokes: {
      patterns: ["ספר בדיחה", "בדיחה", "משהו מצחיק", "תצחיק אותי"],
      responses: [
        `😄 **בדיחות ללמידה:**

למה המתמטיקאי לא הולך לים?
כי הוא מפחד מסינוסים! 📐

למה הספר של מתמטיקה עצוב?
כי יש לו הרבה בעיות! 📚

מה אמר האלקטרון לפרוטון?
"למה אתה תמיד כל כך חיובי?" ⚛️

למה התלמיד הביא סולם לשיעור?
כי רצה להגיע להשכלה גבוהה! 🪜

מה ההבדל בין מורה לרכבת?
המורה אומרת "תוציאו את המסטיק"
והרכבת אומרת "צ'יק צ'ק, צ'יק צ'ק" 🚂

עכשיו חזרה ללימודים! 😊
על מה תרצה ללמוד?`,
      ],
    },

    // Default
    default: {
      responses: [
        "שאלה מעניינת! 🤔 תוכל לנסח אותה בצורה יותר ספציפית?",
        `לא הבנתי בדיוק. אני יכול לעזור ב:
• מתמטיקה 📐
• מדעים 🔬
• אנגלית 🇬🇧
• היסטוריה 📜
• עברית ✍️
• טיפים ללמידה 💡

מה תרצה ללמוד?`,
        "אשמח לעזור! נסה לשאול שאלה ספציפית יותר על נושא לימודי.",
        "לא מצאתי תשובה מדויקת. אולי תנסה לנסח אחרת או לשאול על נושא אחר?",
      ],
    },
  }

  function findResponse(message) {
    const lowerMessage = message.toLowerCase()

    // Check each knowledge category
    for (const [category, data] of Object.entries(knowledgeBase)) {
      if (category === "default") continue

      for (const pattern of data.patterns) {
        if (lowerMessage.includes(pattern.toLowerCase())) {
          const responses = data.responses
          return responses[Math.floor(Math.random() * responses.length)]
        }
      }
    }

    // Return default response if no match found
    return knowledgeBase.default.responses[Math.floor(Math.random() * knowledgeBase.default.responses.length)]
  }

  function addMessage(text, isUser) {
    const messageDiv = document.createElement("div")
    messageDiv.className = `chat-message ${isUser ? "user-message" : "bot-message"}`

    // Convert markdown-style formatting to HTML
    const formattedText = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>")
      .replace(/• /g, "&bull; ")

    messageDiv.innerHTML = `<div class="message-content">${formattedText}</div>`
    chatMessages.appendChild(messageDiv)
    chatMessages.scrollTop = chatMessages.scrollHeight
  }

  function sendMessage() {
    const message = chatInput.value.trim()
    if (!message) return

    addMessage(message, true)
    chatInput.value = ""

    // Show typing indicator
    const typingDiv = document.createElement("div")
    typingDiv.className = "chat-message bot-message typing-indicator"
    typingDiv.innerHTML = '<div class="message-content">מקליד...</div>'
    chatMessages.appendChild(typingDiv)
    chatMessages.scrollTop = chatMessages.scrollHeight

    // Simulate thinking time
    setTimeout(
      () => {
        typingDiv.remove()
        const response = findResponse(message)
        addMessage(response, false)
        addPoints(2)
      },
      800 + Math.random() * 700,
    )
  }

  sendBtn?.addEventListener("click", sendMessage)

  chatInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  })

  suggestions?.forEach((btn) => {
    btn.addEventListener("click", () => {
      chatInput.value = btn.textContent
      sendMessage()
    })
  })
}

// ========================================
// Study Planner
// ========================================
function initStudyPlanner() {
  const addSessionBtn = document.getElementById("addStudySession")
  const plannerList = document.getElementById("plannerList")

  if (!addSessionBtn) return

  addSessionBtn.addEventListener("click", () => {
    const subject = document.getElementById("plannerSubject").value
    const day = document.getElementById("plannerDay").value
    const time = document.getElementById("plannerTime").value
    const duration = document.getElementById("plannerDuration").value

    if (!subject || !day || !time || !duration) {
      alert("אנא מלא את כל השדות")
      return
    }

    const sessions = JSON.parse(localStorage.getItem(`studySessions_${currentUser?.id}`) || "[]")
    sessions.push({ id: Date.now(), subject, day, time, duration })
    localStorage.setItem(`studySessions_${currentUser?.id}`, JSON.stringify(sessions))

    displayStudySessions()
    addPoints(3)
  })

  function displayStudySessions() {
    const sessions = JSON.parse(localStorage.getItem(`studySessions_${currentUser?.id}`) || "[]")
    const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"]

    plannerList.innerHTML = sessions
      .map(
        (session) => `
      <div class="planner-item">
        <div class="planner-info">
          <strong>${session.subject}</strong>
          <span>יום ${days[session.day]} | ${session.time} | ${session.duration} דקות</span>
        </div>
        <button class="btn btn-danger btn-sm" onclick="deleteSession(${session.id})">מחק</button>
      </div>
    `,
      )
      .join("")
  }

  window.deleteSession = (id) => {
    const sessions = JSON.parse(localStorage.getItem(`studySessions_${currentUser?.id}`) || "[]")
    const filtered = sessions.filter((s) => s.id !== id)
    localStorage.setItem(`studySessions_${currentUser?.id}`, JSON.stringify(filtered))
    displayStudySessions()
  }

  displayStudySessions()
}

// ========================================
// Flashcards
// ========================================
// ========================================
function initFlashcards() {
  const flashcards = JSON.parse(localStorage.getItem("userFlashcards") || "[]")
  let currentIndex = 0
  let isFlipped = false

  const addBtn = document.getElementById("addFlashcard")
  const frontInput = document.getElementById("flashcardFront")
  const backInput = document.getElementById("flashcardBack")
  const deckInput = document.getElementById("flashcardDeck")
  const flashcard = document.getElementById("currentFlashcard")
  const counter = document.getElementById("flashcardCounter")
  const prevBtn = document.getElementById("prevFlashcard")
  const nextBtn = document.getElementById("nextFlashcard")
  const flipBtn = document.getElementById("flipFlashcard")

  function updateDisplay() {
    if (flashcards.length === 0) {
      flashcard.querySelector(".flashcard-front p").textContent = "אין כרטיסיות עדיין"
      flashcard.querySelector(".flashcard-back p").textContent = "הוסף כרטיסייה חדשה למעלה"
      counter.textContent = "0 / 0"
      return
    }

    const card = flashcards[currentIndex]
    flashcard.querySelector(".flashcard-front p").textContent = card.front
    flashcard.querySelector(".flashcard-back p").textContent = card.back
    counter.textContent = `${currentIndex + 1} / ${flashcards.length}`

    // Reset flip state
    isFlipped = false
    flashcard.classList.remove("flipped")
  }

  function saveCards() {
    localStorage.setItem("userFlashcards", JSON.stringify(flashcards))
  }

  addBtn?.addEventListener("click", () => {
    const front = frontInput.value.trim()
    const back = backInput.value.trim()
    const deck = deckInput.value.trim() || "כללי"

    if (!front || !back) {
      alert("יש למלא את שני הצדדים של הכרטיסייה")
      return
    }

    flashcards.push({ front, back, deck, created: new Date().toISOString() })
    saveCards()

    frontInput.value = ""
    backInput.value = ""

    currentIndex = flashcards.length - 1
    updateDisplay()
    addPoints(2)
  })

  flashcard?.addEventListener("click", () => {
    isFlipped = !isFlipped
    flashcard.classList.toggle("flipped", isFlipped)
  })

  flipBtn?.addEventListener("click", () => {
    isFlipped = !isFlipped
    flashcard.classList.toggle("flipped", isFlipped)
  })

  prevBtn?.addEventListener("click", () => {
    if (flashcards.length === 0) return
    currentIndex = (currentIndex - 1 + flashcards.length) % flashcards.length
    updateDisplay()
  })

  nextBtn?.addEventListener("click", () => {
    if (flashcards.length === 0) return
    currentIndex = (currentIndex + 1) % flashcards.length
    updateDisplay()
  })

  updateDisplay()
}

// ========================================
// Dictionary
// ========================================
// ========================================
function initDictionary() {
  const searchInput = document.getElementById("dictionarySearch")
  const searchBtn = document.getElementById("dictionarySearchBtn")
  const output = document.getElementById("dictionaryOutput")

  // Extensive Hebrew dictionary database
  const hebrewDictionary = {
    // Common Words
    שלום: {
      word: "שָׁלוֹם",
      type: "שם עצם, זכר",
      definition: "מצב של שקט, ביטחון והרמוניה; ברכה בעת פגישה או פרידה",
      examples: ["שלום רב!", "יש שלום בארץ", "לשלום ולברכה"],
      synonyms: ["שקט", "שלווה", "רוגע"],
      root: "ש.ל.מ",
    },
    ספר: {
      word: "סֵפֶר",
      type: "שם עצם, זכר",
      definition: "חיבור כתוב או מודפס בעל כריכה; יצירה ספרותית",
      examples: ["קראתי ספר מעניין", "ספר הספרים", "ספר לימוד"],
      synonyms: ["כרך", "חיבור", "יצירה"],
      root: "ס.פ.ר",
    },
    בית: {
      word: "בַּיִת",
      type: "שם עצם, זכר",
      definition: "מבנה המשמש למגורים; משפחה, משק בית",
      examples: ["אני גר בבית יפה", "בית ספר", "בעלת הבית"],
      synonyms: ["דירה", "מעון", "משכן"],
      root: "ב.י.ת",
    },
    ילד: {
      word: "יֶלֶד",
      type: "שם עצם, זכר",
      definition: "אדם צעיר שטרם הגיע לגיל ההתבגרות; בן או בת",
      examples: ["הילד משחק בחצר", "ילדים ונוער", "ילד טוב"],
      synonyms: ["נער", "פעוט", "תינוק"],
      root: "י.ל.ד",
    },
    ילדה: {
      word: "יַלְדָּה",
      type: "שם עצם, נקבה",
      definition: "נערה צעירה שטרם הגיעה לגיל ההתבגרות; בת",
      examples: ["הילדה רוקדת", "ילדה חכמה", "ילדה יפה"],
      synonyms: ["נערה", "בת", "עלמה"],
      root: "י.ל.ד",
    },
    אהבה: {
      word: "אַהֲבָה",
      type: "שם עצם, נקבה",
      definition: "רגש עמוק של חיבה, משיכה והערצה כלפי אדם או דבר",
      examples: ["אהבה אמיתית", "אהבת הורים", "מכתב אהבה"],
      synonyms: ["חיבה", "אהדה", "רומנטיקה"],
      root: "א.ה.ב",
    },
    חבר: {
      word: "חָבֵר",
      type: "שם עצם, זכר",
      definition: "אדם קרוב שיש עמו קשר של ידידות; עמית, שותף",
      examples: ["הוא החבר הכי טוב שלי", "חברים לדרך", "חבר לכיתה"],
      synonyms: ["ידיד", "רע", "עמית"],
      root: "ח.ב.ר",
    },
    חברה: {
      word: "חֲבֵרָה",
      type: "שם עצם, נקבה",
      definition: "אישה קרובה שיש עמה קשר של ידידות; בת זוג",
      examples: ["היא חברה טובה", "חברה לספסל", "יש לו חברה"],
      synonyms: ["ידידה", "רעיה", "עמיתה"],
      root: "ח.ב.ר",
    },
    לומד: {
      word: "לוֹמֵד",
      type: "פועל, בניין קל",
      definition: "רוכש ידע או מיומנות; תלמיד הלומד בבית ספר",
      examples: ["הוא לומד מתמטיקה", "לומד לבחינה", "לומד באוניברסיטה"],
      synonyms: ["מתלמד", "רוכש", "קולט"],
      root: "ל.מ.ד",
    },
    כותב: {
      word: "כּוֹתֵב",
      type: "פועל, בניין קל",
      definition: "מעלה על הכתב מילים או סימנים; מחבר יצירה",
      examples: ["הוא כותב מכתב", "כותב שירים", "כותב בעברית"],
      synonyms: ["מחבר", "רושם", "מתעד"],
      root: "כ.ת.ב",
    },
    קורא: {
      word: "קוֹרֵא",
      type: "פועל, בניין קל",
      definition: "מפענח כתב ומבין את משמעותו; קריאה בקול",
      examples: ["הוא קורא ספר", "קורא עיתון", "קורא בקול רם"],
      synonyms: ["מעיין", "לומד", "מפענח"],
      root: "ק.ר.א",
    },
    הולך: {
      word: "הוֹלֵךְ",
      type: "פועל, בניין קל",
      definition: "נע ברגליים ממקום למקום; מתקדם",
      examples: ["הוא הולך לבית הספר", "הולך ברחוב", "הולך ומשתפר"],
      synonyms: ["צועד", "פוסע", "מתקדם"],
      root: "ה.ל.כ",
    },
    רץ: {
      word: "רָץ",
      type: "פועל, בניין קל",
      definition: "נע במהירות ברגליים; ממהר",
      examples: ["הילד רץ בפארק", "רץ מרתון", "רץ לעזרה"],
      synonyms: ["דוהר", "ממהר", "נחפז"],
      root: "ר.ו.צ",
    },
    אוכל: {
      word: "אוֹכֵל",
      type: "פועל / שם עצם",
      definition: "מכניס מזון לפה ובולע; מזון באופן כללי",
      examples: ["הוא אוכל ארוחת צהריים", "אוכל טעים", "אוכל בריא"],
      synonyms: ["סועד", "טועם", "מזון"],
      root: "א.כ.ל",
    },
    שותה: {
      word: "שׁוֹתֶה",
      type: "פועל, בניין קל",
      definition: "מכניס משקה לפה ובולע",
      examples: ["הוא שותה מים", "שותה קפה", "שותה לבריאות"],
      synonyms: ["גומע", "לוגם", "מתרווה"],
      root: "ש.ת.ה",
    },
    יפה: {
      word: "יָפֶה",
      type: "שם תואר",
      definition: "נעים למראה, מושך את העין; טוב, ראוי לשבח",
      examples: ["נוף יפה", "שמלה יפה", "מעשה יפה"],
      synonyms: ["נאה", "יאה", "מקסים"],
      root: "י.פ.ה",
    },
    גדול: {
      word: "גָּדוֹל",
      type: "שם תואר",
      definition: "בעל מידות רבות; חשוב, משמעותי",
      examples: ["בית גדול", "חלום גדול", "אדם גדול"],
      synonyms: ["ענק", "עצום", "רחב"],
      root: "ג.ד.ל",
    },
    קטן: {
      word: "קָטָן",
      type: "שם תואר",
      definition: "בעל מידות מועטות; צעיר, לא משמעותי",
      examples: ["כלב קטן", "הילד הקטן", "פרט קטן"],
      synonyms: ["זעיר", "פעוט", "מצומצם"],
      root: "ק.ט.נ",
    },
    חדש: {
      word: "חָדָשׁ",
      type: "שם תואר",
      definition: "שנוצר לאחרונה; שונה מהקודם, מודרני",
      examples: ["טלפון חדש", "שנה חדשה", "רעיון חדש"],
      synonyms: ["טרי", "מודרני", "עדכני"],
      root: "ח.ד.ש",
    },
    ישן: {
      word: "יָשָׁן",
      type: "שם תואר / פועל",
      definition: "קיים מזה זמן רב; במצב שינה",
      examples: ["ספר ישן", "הוא ישן במיטה", "חבר ישן"],
      synonyms: ["עתיק", "קדום", "נושן"],
      root: "י.ש.נ",
    },
    טוב: {
      word: "טוֹב",
      type: "שם תואר",
      definition: "בעל איכות גבוהה; מוסרי, ראוי",
      examples: ["יום טוב", "אדם טוב", "ציון טוב"],
      synonyms: ["מצוין", "נפלא", "ראוי"],
      root: "ט.ו.ב",
    },
    רע: {
      word: "רַע",
      type: "שם תואר",
      definition: "בעל איכות נמוכה; לא מוסרי, מזיק",
      examples: ["מזג אוויר רע", "אדם רע", "הרגשה רעה"],
      synonyms: ["גרוע", "שלילי", "מזיק"],
      root: "ר.ע.ע",
    },
    מהיר: {
      word: "מָהִיר",
      type: "שם תואר",
      definition: "נע או פועל במהירות רבה; חד, זריז",
      examples: ["רכבת מהירה", "תגובה מהירה", "שינוי מהיר"],
      synonyms: ["זריז", "חד", "מיידי"],
      root: "מ.ה.ר",
    },
    איטי: {
      word: "אִיטִי",
      type: "שם תואר",
      definition: "נע או פועל בקצב נמוך; לא ממהר",
      examples: ["צב איטי", "תהליך איטי", "הליכה איטית"],
      synonyms: ["מתון", "עצלני", "מושהה"],
      root: "א.ט.ט",
    },
    חכם: {
      word: "חָכָם",
      type: "שם תואר / שם עצם",
      definition: "בעל תבונה ושכל; מלומד, נבון",
      examples: ["תלמיד חכם", "החלטה חכמה", "אדם חכם"],
      synonyms: ["נבון", "משכיל", "פיקח"],
      root: "ח.כ.מ",
    },
    שמח: {
      word: "שָׂמֵחַ",
      type: "שם תואר",
      definition: "חש שמחה, אושר; עליז, מרוצה",
      examples: ["ילד שמח", "חג שמח", "אני שמח לראותך"],
      synonyms: ["מאושר", "עליז", "מרוצה"],
      root: "ש.מ.ח",
    },
    עצוב: {
      word: "עָצוּב",
      type: "שם תואר",
      definition: "חש עצב, צער; מדוכא",
      examples: ["סיפור עצוב", "הוא עצוב היום", "שיר עצוב"],
      synonyms: ["נוגה", "מדוכא", "אומלל"],
      root: "ע.צ.ב",
    },
    אמא: {
      word: "אִמָּא",
      type: "שם עצם, נקבה",
      definition: "האם, ההורה הנשי; כינוי חיבה",
      examples: ["אמא שלי", "יום האם", "אמא אוהבת"],
      synonyms: ["אם", "הורה", "יולדת"],
      root: "א.מ.מ",
    },
    אבא: {
      word: "אַבָּא",
      type: "שם עצם, זכר",
      definition: "האב, ההורה הזכר; כינוי חיבה",
      examples: ["אבא שלי", "אבא ובן", "אבא עובד"],
      synonyms: ["אב", "הורה", "אבי"],
      root: "א.ב.ב",
    },
    מורה: {
      word: "מוֹרֶה",
      type: "שם עצם",
      definition: "אדם שמקצועו ללמד; מדריך, מנחה",
      examples: ["מורה למתמטיקה", "המורה הטובה", "מורה דרך"],
      synonyms: ["מלמד", "מחנך", "מדריך"],
      root: "י.ר.ה",
    },
    תלמיד: {
      word: "תַּלְמִיד",
      type: "שם עצם, זכר",
      definition: "אדם הלומד במוסד חינוכי; מי שלומד מרב או מורה",
      examples: ["תלמיד חכם", "תלמיד בכיתה ה", "תלמיד מצטיין"],
      synonyms: ["לומד", "חניך", "שוליה"],
      root: "ל.מ.ד",
    },
    כיתה: {
      word: "כִּתָּה",
      type: "שם עצם, נקבה",
      definition: "קבוצת תלמידים הלומדים יחד; חדר לימוד",
      examples: ["כיתה א", "חדר הכיתה", "כיתת לימוד"],
      synonyms: ["קבוצה", "מחלקה", "שכבה"],
      root: "כ.ת.ת",
    },
    שיעור: {
      word: "שִׁעוּר",
      type: "שם עצם, זכר",
      definition: "יחידת לימוד; משימה לביצוע בבית",
      examples: ["שיעור מתמטיקה", "שיעורי בית", "לוח שיעורים"],
      synonyms: ["לקח", "הרצאה", "תרגיל"],
      root: "ש.ע.ר",
    },
    מבחן: {
      word: "מִבְחָן",
      type: "שם עצם, זכר",
      definition: "בדיקה של ידע או יכולת; ניסיון",
      examples: ["מבחן במתמטיקה", "עמד במבחן", "מבחן נהיגה"],
      synonyms: ["בחינה", "מבדק", "ניסיון"],
      root: "ב.ח.נ",
    },
    ציון: {
      word: "צִיּוּן",
      type: "שם עצם, זכר",
      definition: "הערכה מספרית של הישג; סימון, ציון דרך",
      examples: ["ציון 100", "ציון טוב", "ציון לשבח"],
      synonyms: ["הערכה", "דירוג", "סימן"],
      root: "צ.י.נ",
    },
    שאלה: {
      word: "שְׁאֵלָה",
      type: "שם עצם, נקבה",
      definition: "משפט המבקש מידע; בעיה לפתרון",
      examples: ["יש לי שאלה", "שאלה קשה", "שאלות ותשובות"],
      synonyms: ["תהייה", "בעיה", "חידה"],
      root: "ש.א.ל",
    },
    תשובה: {
      word: "תְּשׁוּבָה",
      type: "שם עצם, נקבה",
      definition: "מענה לשאלה; פתרון לבעיה",
      examples: ["תשובה נכונה", "מחפש תשובות", "אין תשובה"],
      synonyms: ["מענה", "פתרון", "תגובה"],
      root: "ש.ו.ב",
    },
    עולם: {
      word: "עוֹלָם",
      type: "שם עצם, זכר",
      definition: "כדור הארץ וכל מה שעליו; היקום; תחום מסוים",
      examples: ["מסביב לעולם", "עולם חדש", "עולם הספורט"],
      synonyms: ["תבל", "יקום", "ארץ"],
      root: "ע.ל.מ",
    },
    ארץ: {
      word: "אֶרֶץ",
      type: "שם עצם, נקבה",
      definition: "מדינה, טריטוריה; קרקע, אדמה",
      examples: ["ארץ ישראל", "ארץ רחוקה", "פני הארץ"],
      synonyms: ["מדינה", "אדמה", "טריטוריה"],
      root: "א.ר.צ",
    },
    עיר: {
      word: "עִיר",
      type: "שם עצם, נקבה",
      definition: "יישוב גדול ומפותח; מרכז עירוני",
      examples: ["עיר גדולה", "מרכז העיר", "עיר הבירה"],
      synonyms: ["כרך", "מטרופולין", "יישוב"],
      root: "ע.י.ר",
    },
    כפר: {
      word: "כְּפָר",
      type: "שם עצם, זכר",
      definition: "יישוב קטן, בדרך כלל חקלאי",
      examples: ["כפר קטן", "חיי הכפר", "בן כפר"],
      synonyms: ["יישוב", "מושב", "עיירה"],
      root: "כ.פ.ר",
    },
    דרך: {
      word: "דֶּרֶךְ",
      type: "שם עצם, נקבה",
      definition: "נתיב, כביש; שיטה, אופן",
      examples: ["דרך ארוכה", "בדרך הביתה", "דרך חיים"],
      synonyms: ["נתיב", "שביל", "אופן"],
      root: "ד.ר.כ",
    },
    זמן: {
      word: "זְמַן",
      type: "שם עצם, זכר",
      definition: "המשכיות של אירועים; עונה, תקופה",
      examples: ["אין לי זמן", "זמן רב", "באותו זמן"],
      synonyms: ["עת", "תקופה", "שעה"],
      root: "ז.מ.נ",
    },
    יום: {
      word: "יוֹם",
      type: "שם עצם, זכר",
      definition: "תקופה של 24 שעות; שעות האור",
      examples: ["יום יפה", "במהלך היום", "יום הולדת"],
      synonyms: ["יממה", "תאריך"],
      root: "י.ו.מ",
    },
    לילה: {
      word: "לַיְלָה",
      type: "שם עצם, זכר",
      definition: "הזמן בין שקיעה לזריחה; חושך",
      examples: ["לילה טוב", "באמצע הלילה", "לילה חשוך"],
      synonyms: ["חשכה", "אישון", "ערב"],
      root: "ל.י.ל",
    },
    בוקר: {
      word: "בֹּקֶר",
      type: "שם עצם, זכר",
      definition: "הזמן המוקדם של היום, לאחר הזריחה",
      examples: ["בוקר טוב", "בשעות הבוקר", "ארוחת בוקר"],
      synonyms: ["שחר", "עלות השחר"],
      root: "ב.ק.ר",
    },
    ערב: {
      word: "עֶרֶב",
      type: "שם עצם, זכר",
      definition: "הזמן בין אחר הצהריים ללילה",
      examples: ["ערב טוב", "לקראת ערב", "ערב שבת"],
      synonyms: ["שקיעה", "דמדומים"],
      root: "ע.ר.ב",
    },
    שמש: {
      word: "שֶׁמֶשׁ",
      type: "שם עצם, נקבה",
      definition: "הכוכב המרכזי של מערכת השמש; אור יום",
      examples: ["אור השמש", "שקיעת השמש", "יום שמשי"],
      synonyms: ["חמה"],
      root: "ש.מ.ש",
    },
    ירח: {
      word: "יָרֵחַ",
      type: "שם עצם, זכר",
      definition: "הלוויין הטבעי של כדור הארץ; חודש",
      examples: ["אור הירח", "ירח מלא", "ירח דבש"],
      synonyms: ["לבנה", "סהר"],
      root: "י.ר.ח",
    },
    כוכב: {
      word: "כּוֹכָב",
      type: "שם עצם, זכר",
      definition: "גוף שמיימי זוהר; אדם מפורסם",
      examples: ["כוכב בשמיים", "כוכב קולנוע", "כוכב נופל"],
      synonyms: ["שמש", "סלבריטי"],
      root: "כ.כ.ב",
    },
    מים: {
      word: "מַיִם",
      type: "שם עצם, זכר רבים",
      definition: "נוזל חיוני לחיים; H2O",
      examples: ["כוס מים", "מים קרים", "מי ים"],
      synonyms: ["נוזל"],
      root: "מ.י.מ",
    },
    אש: {
      word: "אֵשׁ",
      type: "שם עצם, נקבה",
      definition: "להבה, בעירה; חום עז",
      examples: ["אש בוערת", "מכבי אש", "לשחק באש"],
      synonyms: ["להבה", "שריפה", "אור"],
      root: "א.ש.ש",
    },
    רוח: {
      word: "רוּחַ",
      type: "שם עצם, נקבה",
      definition: "תנועת אוויר; נשמה, תחושה",
      examples: ["רוח חזקה", "רוח טובה", "מצב רוח"],
      synonyms: ["משב", "נשמה", "אווירה"],
      root: "ר.ו.ח",
    },
    אדמה: {
      word: "אֲדָמָה",
      type: "שם עצם, נקבה",
      definition: "פני השטח של כדור הארץ; קרקע",
      examples: ["אדמה פורייה", "עובד אדמה", "רעידת אדמה"],
      synonyms: ["קרקע", "ארץ", "שטח"],
      root: "א.ד.מ",
    },
    עץ: {
      word: "עֵץ",
      type: "שם עצם, זכר",
      definition: "צמח גדול בעל גזע וענפים; חומר מעץ",
      examples: ["עץ גבוה", "שולחן עץ", "עץ פרי"],
      synonyms: ["אילן"],
      root: "ע.צ.צ",
    },
    פרח: {
      word: "פֶּרַח",
      type: "שם עצם, זכר",
      definition: "איבר הרבייה של צמח; אדם צעיר",
      examples: ["פרח יפה", "זר פרחים", "פרח אדום"],
      synonyms: ["ציץ", "ניצן"],
      root: "פ.ר.ח",
    },
    חיה: {
      word: "חַיָּה",
      type: "שם עצם, נקבה",
      definition: "יצור חי שאינו אדם או צמח; בעל חיים",
      examples: ["חיות בר", "גן חיות", "חיה מסוכנת"],
      synonyms: ["בעל חיים", "יצור"],
      root: "ח.י.ה",
    },
    כלב: {
      word: "כֶּלֶב",
      type: "שם עצם, זכר",
      definition: "בעל חיים ביתי מאולף, ידיד האדם",
      examples: ["כלב נאמן", "גור כלבים", "כלב שמירה"],
      synonyms: [],
      root: "כ.ל.ב",
    },
    חתול: {
      word: "חָתוּל",
      type: "שם עצם, זכר",
      definition: "בעל חיים ביתי קטן מאולף",
      examples: ["חתול שחור", "גור חתולים", "חתול רחוב"],
      synonyms: [],
      root: "ח.ת.ל",
    },
    ציפור: {
      word: "צִפּוֹר",
      type: "שם עצם, נקבה",
      definition: "בעל חיים מכוסה נוצות ובעל כנפיים",
      examples: ["ציפור שרה", "קן ציפורים", "ציפור נודדת"],
      synonyms: ["עוף"],
      root: "צ.פ.ר",
    },
    לב: {
      word: "לֵב",
      type: "שם עצם, זכר",
      definition: "איבר שואב הדם בגוף; מרכז הרגשות",
      examples: ["לב אוהב", "בכל הלב", "שבור לב"],
      synonyms: ["ליבה", "מרכז"],
      root: "ל.ב.ב",
    },
    ראש: {
      word: "רֹאשׁ",
      type: "שם עצם, זכר",
      definition: "חלק עליון של הגוף; מנהיג; התחלה",
      examples: ["כאב ראש", "ראש הממשלה", "ראש השנה"],
      synonyms: ["גולגולת", "מנהיג", "פסגה"],
      root: "ר.א.ש",
    },
    יד: {
      word: "יָד",
      type: "שם עצם, נקבה",
      definition: "איבר בגוף המשמש לאחיזה; עזרה",
      examples: ["יד ימין", "לתת יד", "כתב יד"],
      synonyms: ["כף יד", "זרוע"],
      root: "י.ד.ד",
    },
    רגל: {
      word: "רֶגֶל",
      type: "שם עצם, נקבה",
      definition: "איבר בגוף המשמש להליכה; פעם, הזדמנות",
      examples: ["כאב ברגל", "ברגל", "רגל שולחן"],
      synonyms: ["כף רגל"],
      root: "ר.ג.ל",
    },
    עין: {
      word: "עַיִן",
      type: "שם עצם, נקבה",
      definition: "איבר הראייה; מבט; מעיין",
      examples: ["עין כחולה", "בעין יפה", "עין מים"],
      synonyms: ["מבט"],
      root: "ע.י.נ",
    },
    אוזן: {
      word: "אֹזֶן",
      type: "שם עצם, נקבה",
      definition: "איבר השמיעה",
      examples: ["כאב אוזניים", "אוזן קשבת", "לוחש לאוזן"],
      synonyms: [],
      root: "א.ז.נ",
    },
    פה: {
      word: "פֶּה",
      type: "שם עצם, זכר",
      definition: "פתח בפנים לאכילה ודיבור; כניסה",
      examples: ["פתח פה", "בעל פה", "פה המערה"],
      synonyms: ["פיה", "פתח"],
      root: "פ.ה.ה",
    },
    אף: {
      word: "אַף",
      type: "שם עצם, זכר",
      definition: "איבר הריח והנשימה בפנים",
      examples: ["נזלת מהאף", "אף גדול", "להרים אף"],
      synonyms: ["חוטם"],
      root: "א.נ.פ",
    },
    // Mathematical terms
    מספר: {
      word: "מִסְפָּר",
      type: "שם עצם, זכר",
      definition: "סימן המייצג כמות; מניין",
      examples: ["מספר גדול", "מספר טלפון", "מספר אי-זוגי"],
      synonyms: ["ספרה", "כמות"],
      root: "ס.פ.ר",
    },
    חיבור: {
      word: "חִבּוּר",
      type: "שם עצם, זכר",
      definition: "פעולה חשבונית של הוספה; חיבור בין דברים",
      examples: ["תרגיל חיבור", "חיבור מספרים", "נקודת חיבור"],
      synonyms: ["סכום", "צירוף"],
      root: "ח.ב.ר",
    },
    חיסור: {
      word: "חִסּוּר",
      type: "שם עצם, זכר",
      definition: "פעולה חשבונית של הפחתה",
      examples: ["תרגיל חיסור", "10 פחות 3", "חיסור מספרים"],
      synonyms: ["הפחתה", "גריעה"],
      root: "ח.ס.ר",
    },
    כפל: {
      word: "כֶּפֶל",
      type: "שם עצם, זכר",
      definition: "פעולה חשבונית של הכפלה; פי שניים",
      examples: ["לוח הכפל", "תרגיל כפל", "כפל מבצעים"],
      synonyms: ["הכפלה"],
      root: "כ.פ.ל",
    },
    חילוק: {
      word: "חִלּוּק",
      type: "שם עצם, זכר",
      definition: "פעולה חשבונית של חלוקה",
      examples: ["תרגיל חילוק", "חילוק ל-3", "חילוק שווה"],
      synonyms: ["חלוקה"],
      root: "ח.ל.ק",
    },
    משולש: {
      word: "מְשֻׁלָּשׁ",
      type: "שם עצם, זכר",
      definition: "צורה גאומטרית בעלת שלוש צלעות ושלוש זוויות",
      examples: ["משולש שווה צלעות", "משולש ישר זווית", "שטח משולש"],
      synonyms: ["טריגון"],
      root: "ש.ל.ש",
    },
    ריבוע: {
      word: "רִבּוּעַ",
      type: "שם עצם, זכר",
      definition: "צורה גאומטרית בעלת ארבע צלעות שוות וזוויות ישרות",
      examples: ["ריבוע קסם", "שטח ריבוע", "מטר ריבוע"],
      synonyms: ["מרובע"],
      root: "ר.ב.ע",
    },
    עיגול: {
      word: "עִגּוּל",
      type: "שם עצם, זכר",
      definition: "צורה גאומטרית עגולה; קירוב מספר",
      examples: ["שטח עיגול", "עיגול מספרים", "היקף עיגול"],
      synonyms: ["מעגל"],
      root: "ע.ג.ל",
    },
  }

  function searchWord() {
    const query = searchInput.value.trim().toLowerCase()

    if (!query) {
      output.innerHTML = '<p class="dictionary-hint">הכנס מילה לחיפוש</p>'
      return
    }

    // Search for exact match first
    let result = hebrewDictionary[query]

    // If no exact match, search for partial matches
    if (!result) {
      const keys = Object.keys(hebrewDictionary)
      const partialMatch = keys.find((key) => key.includes(query) || query.includes(key))
      if (partialMatch) {
        result = hebrewDictionary[partialMatch]
      }
    }

    if (result) {
      output.innerHTML = `
        <div class="dictionary-result">
          <div class="dictionary-word">${result.word}</div>
          <div class="dictionary-type">${result.type}</div>
          <div class="dictionary-definition">
            <strong>הגדרה:</strong> ${result.definition}
          </div>
          ${result.root ? `<div class="dictionary-root"><strong>שורש:</strong> ${result.root}</div>` : ""}
          <div class="dictionary-examples">
            <strong>דוגמאות:</strong>
            <ul>
              ${result.examples.map((ex) => `<li>${ex}</li>`).join("")}
            </ul>
          </div>
          ${
            result.synonyms && result.synonyms.length > 0
              ? `
            <div class="dictionary-synonyms">
              <strong>מילים נרדפות:</strong> ${result.synonyms.join(", ")}
            </div>
          `
              : ""
          }
        </div>
      `
      addPoints(2)
    } else {
      // Suggest similar words
      const keys = Object.keys(hebrewDictionary)
      const suggestions = keys
        .filter((key) => key.charAt(0) === query.charAt(0) || key.includes(query.substring(0, 2)))
        .slice(0, 5)

      output.innerHTML = `
        <div class="dictionary-not-found">
          <p>המילה "${query}" לא נמצאה במילון</p>
          ${
            suggestions.length > 0
              ? `
            <p>אולי התכוונת ל:</p>
            <div class="dictionary-suggestions">
              ${suggestions.map((s) => `<button class="suggestion-btn" onclick="document.getElementById('dictionarySearch').value='${s}'; document.getElementById('dictionarySearchBtn').click();">${s}</button>`).join("")}
            </div>
          `
              : ""
          }
        </div>
      `
    }
  }

  searchBtn?.addEventListener("click", searchWord)
  searchInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      searchWord()
    }
  })
}

// ========================================
// Translator
// ========================================
// ========================================
function initTranslator() {
  const translateBtn = document.getElementById("translateBtn")
  const sourceText = document.getElementById("translatorSource")
  const targetText = document.getElementById("translatorTarget")
  const sourceLang = document.getElementById("sourceLang")
  const targetLang = document.getElementById("targetLang")
  const swapBtn = document.getElementById("swapLanguages")

  async function translateText() {
    const text = sourceText.value.trim()

    if (!text) {
      targetText.value = ""
      return
    }

    const from = sourceLang.value
    const to = targetLang.value

    targetText.value = "מתרגם..."

    try {
      // Using MyMemory Translation API (free, no API key needed)
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`,
      )
      const data = await response.json()

      if (data.responseStatus === 200 && data.responseData) {
        targetText.value = data.responseData.translatedText
        addPoints(3)
      } else {
        // Fallback to local translation for common phrases
        targetText.value = localTranslate(text, from, to)
      }
    } catch (error) {
      console.error("Translation error:", error)
      // Fallback to local translation
      targetText.value = localTranslate(text, from, to)
    }
  }

  // Local fallback translation for common words/phrases
  function localTranslate(text, from, to) {
    const translations = {
      "he-en": {
        שלום: "Hello",
        תודה: "Thank you",
        בבקשה: "Please / You're welcome",
        כן: "Yes",
        לא: "No",
        "מה שלומך": "How are you",
        "אני בסדר": "I am fine",
        "בוקר טוב": "Good morning",
        "ערב טוב": "Good evening",
        "לילה טוב": "Good night",
        להתראות: "Goodbye",
        "אני אוהב אותך": "I love you",
        "מה השעה": "What time is it",
        איפה: "Where",
        מתי: "When",
        למה: "Why",
        איך: "How",
        מי: "Who",
        מה: "What",
        ספר: "Book",
        בית: "House",
        מים: "Water",
        אוכל: "Food",
        ילד: "Boy/Child",
        ילדה: "Girl",
        אמא: "Mom",
        אבא: "Dad",
        אח: "Brother",
        אחות: "Sister",
        חבר: "Friend",
        "בית ספר": "School",
        מורה: "Teacher",
        תלמיד: "Student",
      },
      "en-he": {
        hello: "שלום",
        "thank you": "תודה",
        thanks: "תודה",
        please: "בבקשה",
        yes: "כן",
        no: "לא",
        "how are you": "מה שלומך",
        "i am fine": "אני בסדר",
        "good morning": "בוקר טוב",
        "good evening": "ערב טוב",
        "good night": "לילה טוב",
        goodbye: "להתראות",
        bye: "להתראות",
        "i love you": "אני אוהב אותך",
        "what time is it": "מה השעה",
        where: "איפה",
        when: "מתי",
        why: "למה",
        how: "איך",
        who: "מי",
        what: "מה",
        book: "ספר",
        house: "בית",
        home: "בית",
        water: "מים",
        food: "אוכל",
        boy: "ילד",
        girl: "ילדה",
        child: "ילד",
        mom: "אמא",
        mother: "אמא",
        dad: "אבא",
        father: "אבא",
        brother: "אח",
        sister: "אחות",
        friend: "חבר",
        school: "בית ספר",
        teacher: "מורה",
        student: "תלמיד",
      },
    }

    const langPair = `${from}-${to}`
    const dict = translations[langPair]

    if (dict) {
      const lowerText = text.toLowerCase()
      if (dict[lowerText] || dict[text]) {
        return dict[lowerText] || dict[text]
      }

      // Try word by word translation
      const words = text.split(" ")
      const translated = words.map((word) => {
        const lowerWord = word.toLowerCase()
        return dict[lowerWord] || dict[word] || word
      })
      return translated.join(" ")
    }

    return "לא ניתן לתרגם כרגע. נסה שוב מאוחר יותר."
  }

  translateBtn?.addEventListener("click", translateText)

  swapBtn?.addEventListener("click", () => {
    const tempLang = sourceLang.value
    sourceLang.value = targetLang.value
    targetLang.value = tempLang

    const tempText = sourceText.value
    sourceText.value = targetText.value
    targetText.value = tempText
  })

  // Auto-translate on typing (with debounce)
  let translateTimeout
  sourceText?.addEventListener("input", () => {
    clearTimeout(translateTimeout)
    translateTimeout = setTimeout(translateText, 500)
  })
}

// ========================================
// Points System
// ========================================
// Removed the redeclared addPoints function here.

// ========================================
// Statistics
// ========================================
function updateStats() {
  if (!currentUser) return

  const toolsUsed = Number.parseInt(localStorage.getItem(`toolsUsed_${currentUser.id}`) || "0")
  const toolsUsedEl = document.getElementById("toolsUsedStat")
  if (toolsUsedEl) {
    toolsUsedEl.textContent = toolsUsed
  }
}

// ========================================
// Translations
// ========================================
// Removed the redeclared loadTranslations function here.

// The 'applyTranslations' function is defined in the 'Translations System' section above.
// No need to redeclare it here.
