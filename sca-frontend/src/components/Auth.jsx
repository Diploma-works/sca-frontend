import { useState } from "react";
import { Button, IconButton, InputAdornment, Link, Stack, TextField, Typography } from "@mui/material";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import useSignIn from "react-auth-kit/hooks/useSignIn";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../utils/api";

const VisibilityToggleAdornment = ({ showPassword, setShowPassword }) => {
    const handleClick = () => setShowPassword((prevState) => !prevState);
    return (
        <InputAdornment position="end">
            <IconButton edge="end" onClick={handleClick}>
                {showPassword ? <VisibilityOff/> : <Visibility/>}
            </IconButton>
        </InputAdornment>
    );
}

const Auth = () => {
    const [signUpMode, setSignUpMode] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '', confirm: '' });
    const [error, setError] = useState(null);
    const signIn = useSignIn();
    const navigate = useNavigate();
    const switchMode = () => setSignUpMode((prevState) => !prevState);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleClick = async () => {
        setError(null);
        try {
            if (signUpMode) {
                if (form.password !== form.confirm) {
                    setError('Пароли не совпадают');
                    return;
                }
                
                // Валидация email на клиенте
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(form.email)) {
                    setError('Пожалуйста, введите корректный email адрес (например: user@example.com)');
                    return;
                }
                
                console.log('Регистрация:', form);
                const res = await authAPI.register(form.username, form.password, form.email, form.fullName);
                console.log('Register response:', res);
                signIn({
                    auth: { token: res.token, type: 'Bearer' },
                    userState: res.user
                });
                navigate("/");
            } else {
                console.log('Логин:', { username: form.username, password: form.password });
                const res = await authAPI.login(form.username, form.password);
                console.log('Login response:', res);
                console.log('Token from response:', res.token);
                signIn({
                    auth: { token: res.token, type: 'Bearer' },
                    userState: res.user
                });
                console.log('Token saved to react-auth-kit');
                navigate("/");
            }
        } catch (e) {
            console.error('Auth error:', e);
            
            // Более подробная обработка ошибок валидации
            if (e.message && e.message.includes('must be a well-formed email address')) {
                setError('Пожалуйста, введите корректный email адрес (например: user@example.com)');
            } else if (e.message && e.message.includes('email')) {
                setError('Проблема с email адресом. Проверьте правильность ввода.');
            } else if (e.message && e.message.includes('username')) {
                setError('Пользователь с таким именем уже существует');
            } else {
                setError(e.message || 'Произошла ошибка при регистрации');
            }
        }
    };

    return (
        <Stack sx={{ flex: 1, p: 3, justifyContent: { sm: 'center' } }}>
            <Stack spacing={3} sx={{ p: 3, mx: 'auto', width: 1, minWidth: 250, maxWidth: 350, borderRadius: 1, alignItems: 'center', bgcolor: 'background.paper' }}>
                <Stack direction="row" spacing={1} alignSelf="flex-start" alignItems="center">
                    <Typography fontWeight="bold" color="primary">SCA</Typography>
                    <Typography color="text.disabled">\</Typography>
                    <Typography fontWeight="subtitle2.fontWeight">{signUpMode ? "Регистрация" : "Вход"}</Typography>
                </Stack>
                <TextField
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    variant="outlined"
                    label={signUpMode ? "Имя пользователя" : "Имя или почта"}
                />
                {signUpMode && (
                    <TextField
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                        variant="outlined"
                        label="Электронная почта"
                        placeholder="example@domain.com"
                        helperText="Введите корректный email адрес"
                    />
                )}
                <TextField
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    variant="outlined"
                    label="Пароль"
                    type={showPassword ? "text" : "password"}
                    InputProps={{
                        endAdornment: (
                            <VisibilityToggleAdornment showPassword={showPassword} setShowPassword={setShowPassword} />
                        )
                    }}
                />
                {signUpMode && (
                    <>
                        <TextField
                            name="confirm"
                            value={form.confirm}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                            variant="outlined"
                            label="Подтверждение"
                            type={showPassword ? "text" : "password"}
                            InputProps={{
                                endAdornment: (
                                    <VisibilityToggleAdornment showPassword={showPassword} setShowPassword={setShowPassword} />
                                )
                            }}
                        />
                        <TextField
                            name="fullName"
                            value={form.fullName}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                            variant="outlined"
                            label="ФИО"
                        />
                    </>
                )}
                {error && <Typography color="error" variant="caption">{error}</Typography>}
                <Button fullWidth disableElevation variant="contained" size="large" sx={{ height: 40 }} onClick={handleClick}>
                    {signUpMode ? "Зарегистрироваться!" : "Войти!"}
                </Button>
                <Stack direction="row" spacing={1}>
                    <Typography variant="caption" color="text.disabled">{signUpMode ? "Есть аккаунт?" : "Нет аккаунта?"}</Typography>
                    <Link variant="caption" underline="none" component="button" color="text.primary" fontWeight="subtitle2.fontWeight" onClick={switchMode}>
                        {signUpMode ? "Вход" : "Регистрация"}
                    </Link>
                </Stack>
            </Stack>
        </Stack>
    );
}

export default Auth;