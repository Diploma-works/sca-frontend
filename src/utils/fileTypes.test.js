import { describe, it, expect } from 'vitest';
import { getFileType } from './fileTypes';

describe('getFileType', () => {
    it('returns null for filenames without extension', () => {
        expect(getFileType('Makefile')).toBeNull();
    });

    it('returns null for empty string', () => {
        expect(getFileType('')).toBeNull();
    });

    it('returns null for null/undefined', () => {
        expect(getFileType(null)).toBeNull();
        expect(getFileType(undefined)).toBeNull();
    });

    it('returns correct extension for common file types', () => {
        expect(getFileType('App.jsx')).toBe('jsx');
        expect(getFileType('index.ts')).toBe('ts');
        expect(getFileType('styles.css')).toBe('css');
        expect(getFileType('data.json')).toBe('json');
        expect(getFileType('main.js')).toBe('js');
        expect(getFileType('index.html')).toBe('html');
    });

    it('returns "image" for image file types', () => {
        expect(getFileType('photo.png')).toBe('image');
        expect(getFileType('icon.jpg')).toBe('image');
        expect(getFileType('banner.jpeg')).toBe('image');
        expect(getFileType('logo.bmp')).toBe('image');
        expect(getFileType('favicon.ico')).toBe('image');
    });

    it('returns extension for files with multiple dots', () => {
        expect(getFileType('component.test.jsx')).toBe('jsx');
        expect(getFileType('archive.tar.gz')).toBe('gz');
    });
});
