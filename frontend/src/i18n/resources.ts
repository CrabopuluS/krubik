const resources = {
  en: {
    translation: {
      title: 'Krubik Solver',
      subtitle: 'Describe the cube state, preview it in 3D, and get an optimized solution.',
      language: {
        label: 'Language',
        options: {
          en: 'English',
          ru: 'Русский',
        },
      },
      wizard: {
        heading: 'Face: {{face}}',
        hint: 'Drag and drop a color onto each facelet or tap to apply the selected color.',
        instructions: {
          U: 'Start with the Up face. Use the top center sticker as reference.',
          R: 'Proceed to the Right face. Ensure sticker orientation matches your physical cube.',
          F: 'Fill the Front face from top-left to bottom-right.',
          D: 'Complete the Down face; keep the cube orientation fixed.',
          L: 'Fill the Left face while maintaining orientation.',
          B: 'Finish with the Back face. Double-check transitions between faces.',
        },
      },
      palette: {
        label: 'Color palette',
        help: 'Drag or tap to assign a color.',
      },
      visualizer: {
        heading: '3D preview',
        subtitle: 'Use the preview to verify adjacent stickers before solving.',
      },
      buttons: {
        previous: 'Previous',
        next: 'Next',
        reset: 'Reset',
        solve: 'Solve',
      },
      status: {
        idle: 'Ready to solve',
        loading: 'Solving…',
        success: 'Solution ready',
        error: 'Unable to solve',
      },
      solution: {
        heading: 'Solution steps',
        none: 'Cube is already solved.',
        source: {
          external: 'Source: external solver',
          local: 'Source: local solver',
        },
        play: 'Play',
        pause: 'Pause',
      },
      toast: {
        dismiss: 'Dismiss',
      },
    },
  },
  ru: {
    translation: {
      title: 'Krubik Solver',
      subtitle: 'Опишите состояние куба, посмотрите 3D-превью и получите оптимальное решение.',
      language: {
        label: 'Язык',
        options: {
          en: 'English',
          ru: 'Русский',
        },
      },
      wizard: {
        heading: 'Грань: {{face}}',
        hint: 'Перетащите цвет на стикер или коснитесь плитки для применения выбранного цвета.',
        instructions: {
          U: 'Начните с верхней грани. Используйте центральный стикер как ориентир.',
          R: 'Перейдите к правой грани, сохраняя ориентацию куба.',
          F: 'Заполните переднюю грань, двигаясь сверху вниз.',
          D: 'Заполните нижнюю грань; ориентация куба должна оставаться неизменной.',
          L: 'Заполните левую грань, контролируя переходы цветов.',
          B: 'Завершите заднюю грань и перепроверьте переходы между гранями.',
        },
      },
      palette: {
        label: 'Палитра цветов',
        help: 'Перетаскивайте или нажимайте для назначения цвета.',
      },
      visualizer: {
        heading: '3D-превью',
        subtitle: 'Используйте визуализацию для проверки прилегающих стикеров перед решением.',
      },
      buttons: {
        previous: 'Назад',
        next: 'Далее',
        reset: 'Сбросить',
        solve: 'Решить',
      },
      status: {
        idle: 'Готово к решению',
        loading: 'Решение…',
        success: 'Решение получено',
        error: 'Не удалось решить',
      },
      solution: {
        heading: 'Шаги решения',
        none: 'Куб уже собран.',
        source: {
          external: 'Источник: внешний решатель',
          local: 'Источник: локальный решатель',
        },
        play: 'Воспроизвести',
        pause: 'Пауза',
      },
      toast: {
        dismiss: 'Закрыть',
      },
    },
  },
} as const;

export default resources;
