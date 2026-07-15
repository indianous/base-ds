/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}', './.storybook/**/*.{ts,tsx}'],

  theme: {
    extend: {
      // -----------------------------------------------------------------------
      // CORES — tokens semânticos mapeados para variáveis CSS
      // Use: bg-primary, text-primary-foreground, border-primary-border, etc.
      // -----------------------------------------------------------------------
      colors: {
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        border:     'var(--color-border)',
        input:      'var(--color-input)',
        ring:       'var(--color-ring)',
        overlay:    'var(--color-overlay)',

        muted: {
          DEFAULT:    'var(--color-muted)',
          foreground: 'var(--color-muted-foreground)',
        },

        brutalist: {
          DEFAULT:    'var(--color-brutalist)',
          foreground: 'var(--color-brutalist-foreground)',
          border:     'var(--color-brutalist-border)',
        },

        primary: {
          DEFAULT:    'var(--color-primary)',
          foreground: 'var(--color-primary-foreground)',
          hover:      'var(--color-primary-hover)',
          active:     'var(--color-primary-active)',
          muted:      'var(--color-primary-muted)',
          'muted-fg': 'var(--color-primary-muted-fg)',
          border:     'var(--color-primary-border)',
        },

        secondary: {
          DEFAULT:    'var(--color-secondary)',
          foreground: 'var(--color-secondary-foreground)',
          hover:      'var(--color-secondary-hover)',
          active:     'var(--color-secondary-active)',
          muted:      'var(--color-secondary-muted)',
          'muted-fg': 'var(--color-secondary-muted-fg)',
          border:     'var(--color-secondary-border)',
        },

        success: {
          DEFAULT:    'var(--color-success)',
          foreground: 'var(--color-success-foreground)',
          hover:      'var(--color-success-hover)',
          muted:      'var(--color-success-muted)',
          'muted-fg': 'var(--color-success-muted-fg)',
          border:     'var(--color-success-border)',
        },

        warning: {
          DEFAULT:    'var(--color-warning)',
          foreground: 'var(--color-warning-foreground)',
          hover:      'var(--color-warning-hover)',
          muted:      'var(--color-warning-muted)',
          'muted-fg': 'var(--color-warning-muted-fg)',
          border:     'var(--color-warning-border)',
        },

        destructive: {
          DEFAULT:    'var(--color-destructive)',
          foreground: 'var(--color-destructive-foreground)',
          hover:      'var(--color-destructive-hover)',
          active:     'var(--color-destructive-active)',
          muted:      'var(--color-destructive-muted)',
          'muted-fg': 'var(--color-destructive-muted-fg)',
          border:     'var(--color-destructive-border)',
        },

        info: {
          DEFAULT:    'var(--color-info)',
          foreground: 'var(--color-info-foreground)',
          hover:      'var(--color-info-hover)',
          muted:      'var(--color-info-muted)',
          'muted-fg': 'var(--color-info-muted-fg)',
          border:     'var(--color-info-border)',
        },
      },

      // -----------------------------------------------------------------------
      // ESPAÇAMENTO — sobrescreve as chaves equivalentes do Tailwind com tokens
      // p-4 → var(--spacing-4) = 16px; m-2 → var(--spacing-2) = 8px; etc.
      // -----------------------------------------------------------------------
      spacing: {
        '0':   'var(--spacing-0)',
        '0.5': 'var(--spacing-0-5)',
        '1':   'var(--spacing-1)',
        '1.5': 'var(--spacing-1-5)',
        '2':   'var(--spacing-2)',
        '2.5': 'var(--spacing-2-5)',
        '3':   'var(--spacing-3)',
        '3.5': 'var(--spacing-3-5)',
        '4':   'var(--spacing-4)',
        '5':   'var(--spacing-5)',
        '6':   'var(--spacing-6)',
        '7':   'var(--spacing-7)',
        '8':   'var(--spacing-8)',
        '9':   'var(--spacing-9)',
        '10':  'var(--spacing-10)',
        '11':  'var(--spacing-11)',
        '12':  'var(--spacing-12)',
        '14':  'var(--spacing-14)',
        '16':  'var(--spacing-16)',
        '20':  'var(--spacing-20)',
        '24':  'var(--spacing-24)',
        '28':  'var(--spacing-28)',
        '32':  'var(--spacing-32)',
        '36':  'var(--spacing-36)',
        '40':  'var(--spacing-40)',
        '48':  'var(--spacing-48)',
        '56':  'var(--spacing-56)',
        '64':  'var(--spacing-64)',
      },

      // -----------------------------------------------------------------------
      // TIPOGRAFIA
      // -----------------------------------------------------------------------
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },

      fontSize: {
        xs:   'var(--text-xs)',
        sm:   'var(--text-sm)',
        base: 'var(--text-base)',
        lg:   'var(--text-lg)',
        xl:   'var(--text-xl)',
        '2xl':'var(--text-2xl)',
        '3xl':'var(--text-3xl)',
        '4xl':'var(--text-4xl)',
        '5xl':'var(--text-5xl)',
      },

      fontWeight: {
        thin:      'var(--font-weight-thin)',
        light:     'var(--font-weight-light)',
        normal:    'var(--font-weight-normal)',
        medium:    'var(--font-weight-medium)',
        semibold:  'var(--font-weight-semibold)',
        bold:      'var(--font-weight-bold)',
        extrabold: 'var(--font-weight-extrabold)',
      },

      lineHeight: {
        none:    'var(--leading-none)',
        tight:   'var(--leading-tight)',
        snug:    'var(--leading-snug)',
        normal:  'var(--leading-normal)',
        relaxed: 'var(--leading-relaxed)',
        loose:   'var(--leading-loose)',
      },

      letterSpacing: {
        tighter: 'var(--tracking-tighter)',
        tight:   'var(--tracking-tight)',
        normal:  'var(--tracking-normal)',
        wide:    'var(--tracking-wide)',
        wider:   'var(--tracking-wider)',
        widest:  'var(--tracking-widest)',
      },

      // -----------------------------------------------------------------------
      // SOMBRAS
      // -----------------------------------------------------------------------
      boxShadow: {
        none:  'var(--shadow-none)',
        sm:    'var(--shadow-sm)',
        md:    'var(--shadow-md)',
        lg:    'var(--shadow-lg)',
        xl:    'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        inner: 'var(--shadow-inner)',
      },

      // -----------------------------------------------------------------------
      // BORDAS
      // -----------------------------------------------------------------------
      borderRadius: {
        none: 'var(--radius-none)',
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        xl:   'var(--radius-xl)',
        '2xl':'var(--radius-2xl)',
        '3xl':'var(--radius-3xl)',
        full: 'var(--radius-full)',
      },

      borderWidth: {
        '0': 'var(--border-0)',
        '1': 'var(--border-1)',
        '2': 'var(--border-2)',
        '4': 'var(--border-4)',
        DEFAULT: 'var(--border-1)',
      },
    },
  },

  plugins: [],
}
