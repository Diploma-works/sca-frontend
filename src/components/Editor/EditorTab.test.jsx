import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme, Tabs } from '@mui/material';
import { EditorTab } from './EditorTab';

const theme = createTheme();

const renderTab = (props) =>
    render(
        <ThemeProvider theme={theme}>
            <Tabs value={props.value ?? 'file.js'}>
                <EditorTab {...props} />
            </Tabs>
        </ThemeProvider>
    );

describe('EditorTab', () => {
    it('renders the filename label', () => {
        renderTab({ value: 'App.jsx', label: 'App.jsx', removeTab: vi.fn() });
        expect(screen.getByText('App.jsx')).toBeInTheDocument();
    });

    it('renders a close button', () => {
        renderTab({ value: 'index.ts', label: 'index.ts', removeTab: vi.fn() });
        expect(screen.getByRole('button', { name: '' })).toBeInTheDocument();
    });

    it('calls removeTab with the tab value when close is clicked', () => {
        const removeTab = vi.fn();
        renderTab({ value: 'styles.css', label: 'styles.css', removeTab });
        const closeBtn = document.querySelector('[aria-label=""]') ??
            document.querySelector('.MuiIconButton-root');
        fireEvent.click(closeBtn);
        expect(removeTab).toHaveBeenCalledWith('styles.css');
    });
});
