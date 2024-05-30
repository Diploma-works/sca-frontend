import { useState } from "react";

import { Button, IconButton, InputAdornment, Link, Stack, TextField, Typography } from "@mui/material";

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import useSignIn from "react-auth-kit/hooks/useSignIn";
import { useNavigate } from "react-router-dom";

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

    const signIn = useSignIn();

    const navigate = useNavigate();

    const switchMode = () => setSignUpMode((prevState) => !prevState);

    // TODO: использовать нормальный запрос, а не хардкод
    const handleClick = () => {
        if (
            signIn({
                auth: {
                    token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTcxNjI5NjI4NSwiZXhwIjoxNzE2Mjk5ODg1fQ.GlZInhtTZGeRU0sSd8bXTQC9OXhHRIB_rfj3oe8awgQ',
                    type: 'Bearer'
                },
                userState: {
                    sub: "1234567890",
                    name: "John Doe",
                    admin: true,
                }
            })) {
            console.log("yup")
            navigate("/sca-frontend");
        } else {
            console.log("yuck :(")
        }
    }

    return (
        <Stack sx={{
            flex: 1,
            p: 3,
            justifyContent: { sm: 'center' },
        }}>
            <Stack spacing={3} sx={{
                p: 3,
                mx: 'auto',
                width: 1,
                minWidth: 250,
                maxWidth: 350,
                borderRadius: 1,
                alignItems: 'center',
                bgcolor: 'background.paper',
            }}>
                <Stack
                    direction="row"
                    spacing={1}
                    alignSelf="flex-start"
                    alignItems="center"
                >
                    <Typography fontWeight="bold" color="primary">SCA</Typography>
                    <Typography color="text.disabled">\</Typography>
                    <Typography fontWeight="subtitle2.fontWeight">
                        {signUpMode ? "Регистрация" : "Вход"}
                    </Typography>
                </Stack>
                <TextField
                    //error
                    fullWidth
                    size="small"
                    variant="outlined"
                    label={signUpMode ? "Имя пользователя" : "Имя или почта"}
                    //helperText={"Такого пользователя не существует!"}
                />
                {signUpMode && (
                    <TextField
                        //error
                        fullWidth
                        size="small"
                        variant="outlined"
                        label="Электронная почта"
                        //helperText={"Такого пользователя не существует!"}
                    />
                )}
                <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    label="Пароль"
                    type={showPassword ? "text" : "password"}
                    InputProps={{
                        endAdornment: (
                            <VisibilityToggleAdornment
                                showPassword={showPassword}
                                setShowPassword={setShowPassword}
                            />
                        )
                    }}
                />
                {signUpMode && (
                    <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        label="Подтверждение"
                        type={showPassword ? "text" : "password"}
                        InputProps={{
                            endAdornment: (
                                <VisibilityToggleAdornment
                                    showPassword={showPassword}
                                    setShowPassword={setShowPassword}
                                />
                            )
                        }}
                    />
                )}
                <Button
                    fullWidth
                    disableElevation
                    variant="contained"
                    size="large"
                    sx={{ height: 40 }}
                    onClick={handleClick}
                >
                    {signUpMode ? "Зарегистрироваться!" : "Войти!"}
                </Button>
                <Stack direction="row" spacing={1}>
                    <Typography variant="caption" color="text.disabled">
                        {signUpMode ? "Есть аккаунт?" : "Нет аккаунта?"}
                    </Typography>
                    <Link
                        variant="caption"
                        underline="none"
                        component="button"
                        color="text.primary"
                        fontWeight="subtitle2.fontWeight"
                        onClick={switchMode}
                    >
                        {signUpMode ? "Вход" : "Регистрация"}
                    </Link>
                </Stack>
            </Stack>
        </Stack>
    );
}

export default Auth;