import { describe, it, expect } from 'vitest';
import { lightTheme, darkTheme } from './themes';

describe('App themes', () => {
    it('lightTheme has mode light', () => {
        expect(lightTheme.palette.mode).toBe('light');
    });

    it('darkTheme has mode dark', () => {
        expect(darkTheme.palette.mode).toBe('dark');
    });

    it('themes use Montserrat font', () => {
        expect(lightTheme.typography.fontFamily).toContain('Montserrat');
        expect(darkTheme.typography.fontFamily).toContain('Montserrat');
    });
});
