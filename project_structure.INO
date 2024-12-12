scap-messenger/
├── public/
│   ├── uploads/                # Папка для загруженных файлов
│   └── sounds/                 # Звуковые файлы для уведомлений
├── src/
│   ├── components/
│   │   ├── AdminPanel.tsx
│   │   ├── Chat.tsx
│   │   ├── FileUploader.tsx
│   │   ├── Terminal.tsx
│   │   ├── UserProfile.tsx
│   │   └── UserSettings.tsx
│   ├── models/
│   │   ├── Group.ts
│   │   ├── Message.ts
│   │   └── User.ts
│   ├── pages/
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   ├── ban.ts
│   │   │   │   ├── updateRole.ts
│   │   │   │   └── users.ts
│   │   │   ├── moderator/
│   │   │   │   └── mute.ts
│   │   │   ├── user/
│   │   │   │   ├── addPrefix.ts
│   │   │   │   └── changeColor.ts
│   │   │   ├── upload.ts
│   │   │   ├── login.ts
│   │   │   ├── register.ts
│   │   │   └── socket.ts
│   │   ├── chat.tsx
│   │   ├── index.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── store/
│   │   ├── index.ts
│   │   └── userSlice.ts
│   ├── styles/
│   │   └── globalStyles.ts
│   └── utils/
│       ├── db.ts
│       ├── middleware.ts
│       └── rateLimit.ts
├── .eslintrc.js
├── babel.config.js
├── jest.config.js
├── next-env.d.ts
├── package.json
├── prettier.config.js
├── tsconfig.json
└── yarn.lock или package-lock.json
