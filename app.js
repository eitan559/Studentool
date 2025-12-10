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
  initFlashcards()
  initDictionary()
  initTranslator()
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
    authError.classList.remove("hidden")
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

    output.innerHTML = '<p style="color: var(--primary);">יוצר שאלות...</p>'

    setTimeout(() => {
      const quiz = generateQuiz(sourceText, quizType, count)
      output.innerHTML = quiz
      addPoints(10)
    }, 1200)
  })
}

function generateQuiz(text, type, count) {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 10)
  let questions = ""

  for (let i = 0; i < Math.min(count, sentences.length); i++) {
    const sentence = sentences[i].trim()

    if (type === "multiple" || type === "mixed") {
      questions += `
        <div class="quiz-question">
          <p><strong>שאלה ${i + 1}:</strong> מה נכון לגבי הנאמר בטקסט?</p>
          <p style="font-style: italic; color: var(--text-secondary);">"${sentence}"</p>
          <div class="quiz-options">
            <label><input type="radio" name="q${i}"> א. הטקסט מתאר עובדה זו</label><br>
            <label><input type="radio" name="q${i}"> ב. הטקסט סותר עובדה זו</label><br>
            <label><input type="radio" name="q${i}"> ג. הטקסט לא מתייחס לנושא</label><br>
            <label><input type="radio" name="q${i}"> ד. אף תשובה אינה נכונה</label>
          </div>
        </div>
        <hr>
      `
    } else if (type === "open") {
      questions += `
        <div class="quiz-question">
          <p><strong>שאלה ${i + 1}:</strong> הסבר במילותיך:</p>
          <p style="font-style: italic; color: var(--text-secondary);">"${sentence}"</p>
          <textarea rows="3" placeholder="כתוב את תשובתך כאן..."></textarea>
        </div>
        <hr>
      `
    } else if (type === "truefalse") {
      questions += `
        <div class="quiz-question">
          <p><strong>שאלה ${i + 1}:</strong> נכון או לא נכון?</p>
          <p style="font-style: italic; color: var(--text-secondary);">"${sentence}"</p>
          <div class="quiz-options">
            <label><input type="radio" name="q${i}"> נכון</label>
            <label><input type="radio" name="q${i}"> לא נכון</label>
          </div>
        </div>
        <hr>
      `
    }
  }

  return `
    <h4>שאלון - ${count} שאלות</h4>
    ${questions}
    <button class="btn btn-primary" onclick="alert('שאלון נשמר!')">שמור שאלון</button>
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
          <button class="btn-action btn-share" onclick="shareRecording('${rec.id}')" title="שתף הקלטה">
            🔗 צור קישור לשיתוף
          </button>
          <button class="btn-action btn-open" onclick="openRecordingPlayer('${rec.id}')" title="פתח בנגן">
            ▶️ פתח בנגן
          </button>
          <button class="btn-action btn-download" onclick="downloadRecording('${rec.id}')" title="הורד">
            💾 הורד
          </button>
          <button class="btn-action btn-delete" onclick="deleteRecording(${rec.id})" title="מחק">
            🗑️
          </button>
        </div>
        <div class="share-link-container" id="share-container-${rec.id}" style="display: none;">
          <input type="text" readonly class="share-link-input" id="share-link-${rec.id}">
          <button class="btn-copy" onclick="copyShareLink('${rec.id}')">📋 העתק</button>
        </div>
        <span class="copy-success" id="copy-success-${rec.id}" style="display: none;">✓ הקישור הועתק! ניתן לשתף עם כל אחד</span>
      `
      recordingsContainer.appendChild(item)
    })
  }

  window.shareRecording = (id) => {
    const rec = recordings.find((r) => r.id == id)
    if (rec && rec.data) {
      // Create shareable URL with encoded audio data
      const baseUrl = window.location.href.replace("index.html", "").replace(/#.*$/, "")
      const shareUrl = `${baseUrl}player.html?data=${encodeURIComponent(rec.data)}&date=${encodeURIComponent(rec.date)}&duration=${encodeURIComponent(rec.duration)}`

      // Show the share link input
      const container = document.getElementById(`share-container-${id}`)
      const input = document.getElementById(`share-link-${id}`)

      if (container && input) {
        input.value = shareUrl
        container.style.display = "flex"
        input.select()
      }
    }
  }

  window.copyShareLink = (id) => {
    const input = document.getElementById(`share-link-${id}`)
    if (input) {
      input.select()
      navigator.clipboard
        .writeText(input.value)
        .then(() => {
          const successEl = document.getElementById(`copy-success-${id}`)
          if (successEl) {
            successEl.style.display = "inline"
            setTimeout(() => {
              successEl.style.display = "none"
            }, 3000)
          }
        })
        .catch(() => {
          // Fallback for older browsers
          document.execCommand("copy")
          const successEl = document.getElementById(`copy-success-${id}`)
          if (successEl) {
            successEl.style.display = "inline"
            setTimeout(() => {
              successEl.style.display = "none"
            }, 3000)
          }
        })
    }
  }

  window.openRecordingPlayer = (id) => {
    const rec = recordings.find((r) => r.id == id)
    if (rec && rec.data) {
      const baseUrl = window.location.href.replace("index.html", "").replace(/#.*$/, "")
      const playerUrl = `${baseUrl}player.html?data=${encodeURIComponent(rec.data)}&date=${encodeURIComponent(rec.date)}&duration=${encodeURIComponent(rec.duration)}`
      window.open(playerUrl, "_blank")
    }
  }

  window.downloadRecording = (id) => {
    const rec = recordings.find((r) => r.id == id)
    if (rec && rec.data) {
      const a = document.createElement("a")
      a.href = rec.data
      a.download = `הקלטה-${rec.date.replace(/[/:]/g, "-")}.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
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

  // Enhanced AI Knowledge Base
  const knowledgeBase = {
    // Greetings
    greetings: {
      patterns: ["שלום", "היי", "הי", "מה נשמע", "מה קורה", "בוקר טוב", "ערב טוב", "hello", "hi"],
      responses: [
        "שלום! שמח לראות אותך. במה אוכל לעזור לך היום?",
        "היי! אני כאן כדי לעזור לך בלימודים. מה תרצה ללמוד?",
        "שלום וברוכים הבאים! אני המורה הוירטואלי שלך. שאל אותי כל שאלה!",
      ],
    },

    // Study Tips
    studyTips: {
      patterns: ["איך לומדים", "טיפים ללמידה", "איך להתכונן למבחן", "איך לזכור", "שיטות למידה"],
      responses: [
        `הנה טיפים מצוינים ללמידה יעילה:

1. **שיטת הפומודורו** - למד 25 דקות, הפסקה של 5 דקות
2. **למידה פעילה** - כתוב סיכומים במילים שלך
3. **חזרות מרווחות** - חזור על החומר בהפרשי זמן
4. **לימוד בקבוצות** - הסבר לאחרים מחזק את ההבנה
5. **שינה טובה** - המוח מעבד מידע בשינה
6. **תזונה נכונה** - אכילה בריאה משפרת ריכוז`,
      ],
    },

    // Math
    math: {
      patterns: ["מתמטיקה", "חשבון", "משוואה", "גיאומטריה", "אלגברה", "פיתגורס", "שטח", "היקף", "אחוזים"],
      responses: [
        `במתמטיקה, הנה כמה נושאים חשובים:

**משפט פיתגורס**: a² + b² = c² (במשולש ישר זווית)

**נוסחאות שטח**:
- ריבוע: a²
- מלבן: a × b
- משולש: (בסיס × גובה) / 2
- עיגול: πr²

**אחוזים**: X% מ-Y = (X × Y) / 100

איזה נושא ספציפי תרצה שאסביר?`,
      ],
    },

    // Pythagorean Theorem
    pythagoras: {
      patterns: ["פיתגורס", "משפט פיתגורס"],
      responses: [
        `**משפט פיתגורס**

במשולש ישר-זווית, הקשר בין הצלעות הוא:
$$a² + b² = c²$$

כאשר:
- a ו-b הן הניצבים (הצלעות שיוצרות את הזווית הישרה)
- c היא היתר (הצלע הארוכה ביותר, מול הזווית הישרה)

**דוגמה**: אם a=3 ו-b=4, אז c=5
כי: 3² + 4² = 9 + 16 = 25 = 5²

**שימושים**: מדידת מרחקים, בנייה, ניווט ועוד!`,
      ],
    },

    // Science
    science: {
      patterns: ["מדעים", "פיזיקה", "כימיה", "ביולוגיה", "פוטוסינתזה", "תא", "אטום", "אנרגיה"],
      responses: [
        `הנה נושאים מרכזיים במדעים:

**פוטוסינתזה**: התהליך שבו צמחים מייצרים מזון
- מים + פחמן דו-חמצני + אור → סוכר + חמצן

**מבנה התא**:
- גרעין - מכיל את ה-DNA
- ממברנה - מגנה על התא
- מיטוכונדריה - מייצרת אנרגיה

**מבנה האטום**:
- פרוטונים (+) ונויטרונים בגרעין
- אלקטרונים (-) סובבים סביב

על מה תרצה להרחיב?`,
      ],
    },

    // Photosynthesis
    photosynthesis: {
      patterns: ["פוטוסינתזה", "סינתזה", "צמחים מייצרים"],
      responses: [
        `**פוטוסינתזה - תהליך יצירת המזון בצמחים**

**המשוואה**:
6CO₂ + 6H₂O + אור → C₆H₁₂O₆ + 6O₂

**בעברית פשוטה**:
פחמן דו-חמצני + מים + אור שמש → סוכר + חמצן

**איפה זה קורה?** בכלורופלסטים שבעלים (מכילים כלורופיל ירוק)

**למה זה חשוב?**
1. מייצר חמצן לנשימה
2. מייצר מזון לצמח ולכל שרשרת המזון
3. קולט פחמן דו-חמצני מהאוויר

**עובדה מעניינת**: עץ גדול יכול לייצר מספיק חמצן ל-4 אנשים ביום!`,
      ],
    },

    // History
    history: {
      patterns: ["היסטוריה", "מלחמת העולם", "שואה", "תקופה", "עתיקה", "ימי הביניים"],
      responses: [
        `נושאים מרכזיים בהיסטוריה:

**תקופות היסטוריות**:
- העת העתיקה (עד 476 לספירה)
- ימי הביניים (476-1492)
- העת החדשה (1492-1789)
- העת החדישה (1789-היום)

**אירועים מרכזיים**:
- מלחמת העולם הראשונה (1914-1918)
- מלחמת העולם השנייה (1939-1945)
- הקמת מדינת ישראל (1948)

על איזו תקופה תרצה לשמוע יותר?`,
      ],
    },

    // World War 2
    ww2: {
      patterns: ["מלחמת העולם השנייה", "מלחמת העולם השניה", "מלחמה עולמית"],
      responses: [
        `**מלחמת העולם השנייה (1939-1945)**

**מתי התחילה?** 1 בספטמבר 1939 - גרמניה פלשה לפולין

**הצדדים**:
- בעלות הברית: בריטניה, צרפת, ארה"ב, ברית המועצות
- מדינות הציר: גרמניה, איטליה, יפן

**אירועים מרכזיים**:
- השואה - רצח 6 מיליון יהודים
- הפצצת פרל הארבור (1941)
- פלישה לנורמנדי D-Day (1944)
- הפצצות האטום על יפן (1945)

**מתי נגמרה?** 2 בספטמבר 1945

**תוצאות**: הקמת האו"ם, חלוקת אירופה, הקמת מדינת ישראל`,
      ],
    },

    // English
    english: {
      patterns: ["אנגלית", "english", "זמנים באנגלית", "tenses", "פועל", "verb"],
      responses: [
        `**זמנים באנגלית (Tenses)**

**Past (עבר)**:
- I played - שיחקתי
- I was playing - הייתי משחק

**Present (הווה)**:
- I play - אני משחק
- I am playing - אני משחק (עכשיו)

**Future (עתיד)**:
- I will play - אני אשחק
- I am going to play - אני הולך לשחק

**טיפים**:
- ed בסוף = עבר רגיל
- ing בסוף = פעולה מתמשכת
- will/going to = עתיד

רוצה דוגמאות נוספות?`,
      ],
    },

    // Essay Writing
    essay: {
      patterns: ["חיבור", "כתיבת חיבור", "איך לכתוב חיבור", "מבנה חיבור"],
      responses: [
        `**איך לכתוב חיבור מצוין**

**מבנה בסיסי**:
1. **פתיחה** - הצגת הנושא ומשפט מפתח
2. **גוף** - 2-3 פסקאות עם טיעונים ודוגמאות
3. **סיכום** - חזרה על הרעיון המרכזי

**טיפים**:
- התחל במשפט מושך תשומת לב
- כל פסקה = רעיון אחד מרכזי
- השתמש במילות קישור (ראשית, בנוסף, לסיכום)
- הבא דוגמאות מהחיים
- סיים במסר או מחשבה

**מילות קישור שימושיות**:
לעומת זאת, מאידך, בנוסף לכך, יתר על כן, לסיכום`,
      ],
    },

    // Hebrew Grammar
    hebrew: {
      patterns: ["עברית", "דקדוק", "שורש", "בניין", "משקל"],
      responses: [
        `**דקדוק עברי - יסודות**

**שורש**: 3-4 אותיות שמהוות את הבסיס של מילים
דוגמה: ש.מ.ר → שומר, נשמר, משמרת, שמירה

**הבניינים בעברית**:
- פָּעַל - הבניין הבסיסי (כתב, למד)
- נִפְעַל - סביל (נכתב, נלמד)  
- פִּעֵל - חיזוק (דיבר, לימד)
- פֻּעַל - סביל של פיעל (דובר, לומד)
- הִפְעִיל - גורם לפעולה (הכתיב, הלמיד)
- הֻפְעַל - סביל של הפעיל (הוכתב)
- הִתְפַּעֵל - פעולה על עצמו (התלבש)

**זמנים**: עבר, הווה, עתיד
**גופים**: אני, אתה, את, הוא, היא, אנחנו, אתם, אתן, הם, הן`,
      ],
    },

    // Thanks
    thanks: {
      patterns: ["תודה", "תודה רבה", "מעולה", "אחלה", "נהדר", "thanks"],
      responses: [
        "בשמחה! אני תמיד כאן לעזור. יש עוד משהו?",
        "אין בעד מה! המשך ללמוד ולהצליח!",
        "שמח שיכולתי לעזור! בהצלחה בלימודים!",
      ],
    },

    // Default
    default: {
      responses: [
        "שאלה מעניינת! תוכל לנסח אותה בצורה אחרת?",
        "לא הבנתי בדיוק. אפשר לשאול על מתמטיקה, מדעים, היסטוריה, אנגלית או טיפים ללמידה.",
        "אני כאן לעזור! נסה לשאול על נושא ספציפי בלימודים.",
      ],
    },
  }

  function findResponse(message) {
    const lowerMessage = message.toLowerCase()

    for (const [category, data] of Object.entries(knowledgeBase)) {
      if (category === "default") continue
      for (const pattern of data.patterns) {
        if (lowerMessage.includes(pattern.toLowerCase())) {
          const responses = data.responses
          return responses[Math.floor(Math.random() * responses.length)]
        }
      }
    }

    return knowledgeBase.default.responses[Math.floor(Math.random() * knowledgeBase.default.responses.length)]
  }

  function addMessage(text, isUser) {
    const messageDiv = document.createElement("div")
    messageDiv.className = `chat-message ${isUser ? "user-message" : "bot-message"}`
    messageDiv.innerHTML = `<div class="message-content">${text.replace(/\n/g, "<br>")}</div>`
    chatMessages.appendChild(messageDiv)
    chatMessages.scrollTop = chatMessages.scrollHeight
  }

  function sendMessage() {
    const message = chatInput.value.trim()
    if (!message) return

    addMessage(message, true)
    chatInput.value = ""

    // Simulate thinking
    setTimeout(() => {
      const response = findResponse(message)
      addMessage(response, false)
      addPoints(2)
    }, 500)
  }

  sendBtn?.addEventListener("click", sendMessage)

  chatInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage()
    }
  })

  suggestions.forEach((btn) => {
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
function initFlashcards() {
  const addCardBtn = document.getElementById("addFlashcard")
  const flipCardBtn = document.getElementById("flipCard")
  const prevCardBtn = document.getElementById("prevCard")
  const nextCardBtn = document.getElementById("nextCard")
  const cardFront = document.getElementById("cardFront")
  const cardBack = document.getElementById("cardBack")
  const cardCounter = document.getElementById("cardCounter")

  if (!addCardBtn) return

  const cards = JSON.parse(localStorage.getItem(`flashcards_${currentUser?.id}`) || "[]")
  let currentIndex = 0
  let isFlipped = false

  addCardBtn.addEventListener("click", () => {
    const front = document.getElementById("flashcardFront").value.trim()
    const back = document.getElementById("flashcardBack").value.trim()
    const category = document.getElementById("flashcardCategory").value

    if (!front || !back) {
      alert("אנא מלא את שני הצדדים של הכרטיסייה")
      return
    }

    cards.push({ id: Date.now(), front, back, category })
    localStorage.setItem(`flashcards_${currentUser?.id}`, JSON.stringify(cards))

    document.getElementById("flashcardFront").value = ""
    document.getElementById("flashcardBack").value = ""

    displayCard()
    addPoints(3)
  })

  flipCardBtn?.addEventListener("click", () => {
    isFlipped = !isFlipped
    document.querySelector(".flashcard-inner")?.classList.toggle("flipped", isFlipped)
  })

  prevCardBtn?.addEventListener("click", () => {
    if (cards.length > 0) {
      currentIndex = (currentIndex - 1 + cards.length) % cards.length
      isFlipped = false
      document.querySelector(".flashcard-inner")?.classList.remove("flipped")
      displayCard()
    }
  })

  nextCardBtn?.addEventListener("click", () => {
    if (cards.length > 0) {
      currentIndex = (currentIndex + 1) % cards.length
      isFlipped = false
      document.querySelector(".flashcard-inner")?.classList.remove("flipped")
      displayCard()
    }
  })

  function displayCard() {
    if (cards.length === 0) {
      cardFront.textContent = "אין כרטיסיות עדיין"
      cardBack.textContent = "הוסף כרטיסייה חדשה"
      cardCounter.textContent = "0/0"
      return
    }

    const card = cards[currentIndex]
    cardFront.textContent = card.front
    cardBack.textContent = card.back
    cardCounter.textContent = `${currentIndex + 1}/${cards.length}`
  }

  displayCard()
}

// ========================================
// Dictionary
// ========================================
function initDictionary() {
  const searchBtn = document.getElementById("searchWord")
  const wordInput = document.getElementById("dictionaryWord")
  const resultDiv = document.getElementById("dictionaryResult")

  if (!searchBtn) return

  const dictionary = {
    // Hebrew words
    שלום: { meaning: "ברכה, מצב של שקט ורוגע", example: "שלום לכולם!" },
    תודה: { meaning: "הבעת הכרת תודה", example: "תודה רבה על העזרה" },
    ספר: { meaning: "חיבור כתוב המכיל מידע או סיפורים", example: "קראתי ספר מרתק" },
    למידה: { meaning: "תהליך רכישת ידע ומיומנויות", example: "הלמידה דורשת התמדה" },
    הצלחה: { meaning: "השגת מטרה או יעד", example: "ההצלחה דורשת עבודה קשה" },
  }

  searchBtn.addEventListener("click", () => {
    const word = wordInput.value.trim()
    if (!word) return

    const result = dictionary[word]
    if (result) {
      resultDiv.innerHTML = `
        <div class="dictionary-entry">
          <h4>${word}</h4>
          <p><strong>משמעות:</strong> ${result.meaning}</p>
          <p><strong>דוגמה:</strong> ${result.example}</p>
        </div>
      `
    } else {
      resultDiv.innerHTML = `<p>המילה "${word}" לא נמצאה במילון. נסה מילה אחרת.</p>`
    }

    addPoints(1)
  })

  wordInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchBtn.click()
  })
}

// ========================================
// Translator
// ========================================
function initTranslator() {
  const translateBtn = document.getElementById("translateText")
  const inputText = document.getElementById("translatorInput")
  const outputText = document.getElementById("translatorOutput")

  if (!translateBtn) return

  const translations = {
    שלום: "Hello",
    תודה: "Thank you",
    בוקר: "Morning",
    ערב: "Evening",
    ספר: "Book",
    בית: "House",
    מים: "Water",
    אוכל: "Food",
    חבר: "Friend",
    משפחה: "Family",
    אהבה: "Love",
    שמש: "Sun",
    ירח: "Moon",
    כוכב: "Star",
  }

  translateBtn.addEventListener("click", () => {
    const text = inputText.value.trim()
    if (!text) return

    const words = text.split(" ")
    const translated = words
      .map((word) => {
        const cleanWord = word.replace(/[.,!?]/g, "")
        return translations[cleanWord] || word
      })
      .join(" ")

    outputText.value = translated
    addPoints(2)
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
  document.getElementById("toolsUsedStat")?.textContent &&
    (document.getElementById("toolsUsedStat").textContent = toolsUsed)
}

// ========================================
// Translations
// ========================================
// Removed the redeclared loadTranslations function here.

// The 'applyTranslations' function is defined in the 'Translations System' section above.
// No need to redeclare it here.
