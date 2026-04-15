export default {
  expo: {
    name: "Study Buddy",
    slug: "study-buddy",
    scheme: "studybuddy",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    plugins: [
      "expo-router",
      "expo-sqlite",
      [
        "expo-notifications",
        {
          icon: undefined,
          color: "#6C63FF"
        }
      ],
      [
        "expo-quick-actions",
        {
          androidIcons: {
            study_compose: {
              foregroundImage: "./assets/shortcut-compose.png",
              backgroundColor: "#6C63FF"
            },
            study_search: {
              foregroundImage: "./assets/shortcut-search.png",
              backgroundColor: "#6C63FF"
            },
            study_bookmark: {
              foregroundImage: "./assets/shortcut-bookmark.png",
              backgroundColor: "#6C63FF"
            }
          }
        }
      ]
    ],
    extra: {
      geminiApiKey: process.env.GEMINI_API_KEY || "PASTE_YOUR_GEMINI_API_KEY_HERE"
    }
  }
};
